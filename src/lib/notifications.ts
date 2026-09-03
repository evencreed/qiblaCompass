import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { t, type TranslationKey } from '@/lib/i18n';
import { SOUND_OPTIONS, soundOption, type SoundId } from '@/lib/notification-sounds';
import { formatTime, getSchedule, type Method, type PrayerKey } from '@/lib/prayer-times';

/**
 * Kaç günlük vakit önceden planlanır. iOS aynı anda en fazla 64 bekleyen
 * bildirime izin verir; 5 vakit × 7 gün = 35 bu sınırın altında kalır ve
 * kullanıcı uygulamayı bir hafta hiç açmasa bile hatırlatmalar sürer.
 */
const DAYS_AHEAD = 7;

/** Güneş bir namaz vakti olmadığı için hatırlatma listesinde yok. */
export const NOTIFIABLE_PRAYERS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export type NotificationSettings = {
  enabled: boolean;
  prayers: Record<PrayerKey, boolean>;
  /** Vakitten kaç dakika önce hatırlatılacağı. 0 = tam vaktinde. */
  minutesBefore: number;
  sound: SoundId;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  prayers: { fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true },
  minutesBefore: 0,
  sound: 'default',
};

/**
 * Bildirim davranışını ve Android kanallarını hazırlar. Android 8+ kanalsız
 * bildirimi hiç göstermez, bu yüzden planlamadan önce çağrılmalı.
 *
 * Her ses seçeneği için ayrı bir kanal açılıyor: Android bir kanalın sesini
 * oluşturulduktan sonra değiştirmeye izin vermiyor, dolayısıyla ses değişimi
 * ancak kanal değiştirerek yapılabiliyor.
 */
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    for (const option of SOUND_OPTIONS) {
      await Notifications.setNotificationChannelAsync(option.channelId, {
        name: `${t('notifications.channelName')} — ${t(option.labelKey)}`,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: option.id === 'silent' ? undefined : [0, 250, 250, 250],
        sound: option.channelSound,
      });
    }
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Planlanmış tüm hatırlatmaları silip önümüzdeki günler için yeniden kurar.
 *
 * Tamamen yeniden kurmak, konum veya hesaplama yöntemi değiştiğinde eski
 * (artık yanlış) vakitlerin bildirim olarak gelmesini engelliyor. Bildirim
 * sayısı az olduğu için maliyeti ihmal edilebilir.
 *
 * @returns Planlanan bildirim sayısı.
 */
export async function syncPrayerNotifications(
  latitude: number,
  longitude: number,
  method: Method,
  settings: NotificationSettings,
  timeZone?: string,
  now: Date = new Date(),
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) return 0;

  const offsetMs = settings.minutesBefore * 60000;
  const sound = soundOption(settings.sound);
  let scheduled = 0;

  for (let day = 0; day < DAYS_AHEAD; day++) {
    const { entries } = getSchedule(latitude, longitude, method, addDays(now, day));

    for (const entry of entries) {
      if (!NOTIFIABLE_PRAYERS.includes(entry.key)) continue;
      if (!settings.prayers[entry.key]) continue;

      const fireAt = new Date(entry.date.getTime() - offsetMs);
      // Geçmiş bir an planlanamaz; bugünün geçmiş vakitleri atlanır.
      if (fireAt.getTime() <= now.getTime()) continue;

      const prayerName = t(`prayer.${entry.key}` as TranslationKey);
      const at = formatTime(entry.date, timeZone);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: prayerName,
          body:
            settings.minutesBefore === 0
              ? t('notifications.bodyNow', { prayer: prayerName, time: at })
              : t('notifications.bodySoon', {
                  prayer: prayerName,
                  time: at,
                  minutes: settings.minutesBefore,
                }),
          sound: sound.contentSound,
          ...(Platform.OS === 'android' ? { channelId: sound.channelId } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        },
      });
      scheduled++;
    }
  }

  return scheduled;
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Seçilen sesi hemen çalar. Kullanıcının sesi duymadan seçim yapmasını
 * önlüyor; özellikle paketlenmiş seslerde önemli çünkü Expo Go'da sessiz
 * kalacaklar ve bu ancak denenince fark ediliyor.
 */
export async function previewSound(id: SoundId): Promise<void> {
  const sound = soundOption(id);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifications.previewTitle'),
      body: t(sound.labelKey),
      sound: sound.contentSound,
      ...(Platform.OS === 'android' ? { channelId: sound.channelId } : {}),
    },
    trigger: null,
  });
}
