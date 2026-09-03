import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useLocationState } from '@/lib/location-context';
import {
  configureNotifications,
  DEFAULT_NOTIFICATION_SETTINGS,
  hasNotificationPermission,
  requestNotificationPermission,
  syncPrayerNotifications,
  type NotificationSettings,
} from '@/lib/notifications';
import type { PrayerKey } from '@/lib/prayer-times';

const STORAGE_KEY = 'qibla:notifications';

type NotificationState = {
  settings: NotificationSettings;
  /** Kullanıcı hatırlatmaları açtı ama sistem izni reddedilmiş durumda. */
  permissionDenied: boolean;
  /** Şu an planlı bildirim sayısı; ayarların işe yaradığını görünür kılar. */
  scheduledCount: number;
  setEnabled: (enabled: boolean) => void;
  togglePrayer: (key: PrayerKey) => void;
  setMinutesBefore: (minutes: number) => void;
};

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { coordinates, method, timeZone } = useLocationState();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const restored = useRef(false);

  // Kayıtlı ayarları yükle ve bildirim altyapısını hazırla.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await configureNotifications();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as Partial<NotificationSettings>;
          setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...saved });
        }
      } catch {
        // Bozuk kayıt varsayılanları engellememeli.
      }
      if (!cancelled) restored.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {
      // Kalıcılaştırma başarısız olsa da hatırlatmalar bu oturumda çalışır.
    });
  }, [settings]);

  /**
   * Hatırlatmaları baştan kurar. Konum, hesaplama yöntemi veya ayarlar
   * değiştiğinde çağrılır; eski vakitlerin bildirim olarak gelmesini önlemek
   * için her seferinde tamamen yeniden planlanıyor.
   */
  const sync = useCallback(async () => {
    if (!coordinates) return;

    if (settings.enabled) {
      const granted = await hasNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        setScheduledCount(0);
        return;
      }
      setPermissionDenied(false);
    }

    const count = await syncPrayerNotifications(
      coordinates.latitude,
      coordinates.longitude,
      method,
      settings,
      timeZone,
    );
    setScheduledCount(count);
  }, [coordinates, method, settings, timeZone]);

  useEffect(() => {
    sync();
  }, [sync]);

  // Uygulama öne geldiğinde yeniden planla: bir haftalık pencere kayar ve
  // kullanıcı ayarları sistemden değiştirmiş olabilir.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, [sync]);

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      setPermissionDenied(!granted);
      if (!granted) return;
    }
    setSettings((previous) => ({ ...previous, enabled }));
  }, []);

  const togglePrayer = useCallback((key: PrayerKey) => {
    setSettings((previous) => ({
      ...previous,
      prayers: { ...previous.prayers, [key]: !previous.prayers[key] },
    }));
  }, []);

  const setMinutesBefore = useCallback((minutes: number) => {
    setSettings((previous) => ({ ...previous, minutesBefore: minutes }));
  }, []);

  const value = useMemo<NotificationState>(
    () => ({
      settings,
      permissionDenied,
      scheduledCount,
      setEnabled,
      togglePrayer,
      setMinutesBefore,
    }),
    [settings, permissionDenied, scheduledCount, setEnabled, togglePrayer, setMinutesBefore],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationState {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider.');
  }
  return context;
}
