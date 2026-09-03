import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
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

import { cityLabel, type City } from '@/lib/cities';
import { regionCode, t } from '@/lib/i18n';
import { defaultMethodForRegion, type Method } from '@/lib/prayer-times';

const STORAGE_KEY = 'qibla:preferences';

export type LocationStatus = 'loading' | 'ready' | 'denied' | 'error';

type Persisted = {
  city: City | null;
  method: Method;
};

type LocationState = {
  status: LocationStatus;
  /** Konum GPS'ten mi geliyor yoksa kullanıcı elle mi seçti. */
  source: 'gps' | 'manual';
  coordinates: { latitude: number; longitude: number } | null;
  /** Başlıkta gösterilecek konum adı. */
  label: string;
  /** Vakitlerin biçimleneceği saat dilimi; GPS'te cihazınki doğrudur. */
  timeZone: string | undefined;
  method: Method;
  /** Konum izni verildi mi — pusulanın çalışması buna bağlı. */
  hasLocationPermission: boolean;
  /**
   * Sistem izin diyaloğu tekrar gösterilebilir mi. iOS kullanıcı bir kez
   * reddettikten sonra diyaloğu bir daha açmaz; o durumda kullanıcıyı
   * uygulama ayarlarına yönlendirmek gerekir.
   */
  canAskAgain: boolean;
  selectCity: (city: City) => void;
  refreshGps: () => Promise<void>;
  setMethod: (method: Method) => void;
};

const LocationContext = createContext<LocationState | null>(null);

/**
 * Ters coğrafi kodlama sonucundan okunabilir bir yer adı üretir.
 * "Chicago, IL" biçimi ABD'de beklenen gösterim; eyalet bilgisi yoksa
 * ülkeye düşülür.
 */
function placeNameFrom(address: Location.LocationGeocodedAddress): string | null {
  const city = address.city ?? address.subregion ?? address.district;
  if (!city) return address.country ?? null;
  const qualifier = address.region ?? address.country;
  return qualifier ? `${city}, ${qualifier}` : city;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [method, setMethodState] = useState<Method>(() => defaultMethodForRegion(regionCode));
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const restored = useRef(false);

  const requestGps = useCallback(async () => {
    setStatus('loading');
    try {
      const { granted, canAskAgain: mayAsk } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(granted);
      setCanAskAgain(mayAsk);
      if (!granted) {
        setStatus('denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setGps(coords);
      setCity(null);
      setPlaceName(null);
      setStatus('ready');

      // Şehir adını ayrı ve gecikmeli çözüyoruz: kıble ve vakitler zaten
      // koordinatla hesaplanıyor, ters coğrafi kodlama yalnızca ekranda
      // "Chicago, IL" yazabilmek için. Başarısız olursa uygulama etkilenmez.
      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) setPlaceName(placeNameFrom(address));
      } catch {
        // Ağ yoksa veya servis yanıt vermezse genel etiket kullanılır.
      }
    } catch {
      setStatus('error');
    }
  }, []);

  // Kayıtlı tercihleri yükle; elle seçilmiş şehir yoksa GPS'i dene.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved: Partial<Persisted> = {};
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) saved = JSON.parse(raw) as Partial<Persisted>;
      } catch {
        // Bozuk kayıt varsayılanları engellememeli.
      }
      if (cancelled) return;

      if (saved.method) setMethodState(saved.method);
      restored.current = true;

      if (saved.city) {
        setCity(saved.city);
        setStatus('ready');
        // Konum izni pusula için hâlâ gerekli, sessizce sor.
        const { granted, canAskAgain: mayAsk } = await Location.requestForegroundPermissionsAsync();
        if (!cancelled) {
          setHasLocationPermission(granted);
          setCanAskAgain(mayAsk);
        }
        return;
      }

      await requestGps();
    })();
    return () => {
      cancelled = true;
    };
  }, [requestGps]);

  // Tercihleri kalıcılaştır. İlk render'da yazmayı beklet ki kayıtlı değerler ezilmesin.
  useEffect(() => {
    if (!restored.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ city, method } satisfies Persisted)).catch(
      () => {
        // Kalıcılaştırma başarısız olsa da uygulama çalışmaya devam etmeli.
      },
    );
  }, [city, method]);

  const selectCity = useCallback((next: City) => {
    setCity(next);
    setStatus('ready');
  }, []);

  const value = useMemo<LocationState>(() => {
    const coordinates = city ? { latitude: city.latitude, longitude: city.longitude } : gps;

    let label: string;
    if (city) {
      label = cityLabel(city);
    } else if (placeName) {
      label = placeName;
    } else if (status === 'ready') {
      label = t('location.current');
    } else {
      label = t('location.waiting');
    }

    return {
      status,
      source: city ? 'manual' : 'gps',
      coordinates,
      label,
      timeZone: city?.timeZone,
      method,
      hasLocationPermission,
      canAskAgain,
      selectCity,
      refreshGps: requestGps,
      setMethod: setMethodState,
    };
  }, [
    city,
    gps,
    placeName,
    status,
    method,
    hasLocationPermission,
    canAskAgain,
    selectCity,
    requestGps,
  ]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationState(): LocationState {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationState must be used inside LocationProvider.');
  }
  return context;
}
