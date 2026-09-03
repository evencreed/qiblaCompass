import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

import { locale, t, uses24HourClock, type TranslationKey } from '@/lib/i18n';

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerEntry = {
  key: PrayerKey;
  label: string;
  date: Date;
};

/**
 * Sunrise bir namaz vakti değil, ama takvimlerde gösterildiği ve sabah ile
 * öğle arasındaki boşluğu doldurduğu için listede yer alıyor.
 */
const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export type Method =
  | 'NorthAmerica'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'Karachi'
  | 'Dubai'
  | 'Turkey'
  | 'Singapore'
  | 'Tehran'
  | 'MoonsightingCommittee';

/** Yöntem listesi; en yaygın olanlar başta. */
export const METHODS: Method[] = [
  'NorthAmerica',
  'MuslimWorldLeague',
  'Egyptian',
  'UmmAlQura',
  'Karachi',
  'Dubai',
  'Turkey',
  'Singapore',
  'Tehran',
  'MoonsightingCommittee',
];

export function methodLabel(method: Method): string {
  return t(`method.${method}` as TranslationKey);
}

/**
 * Kullanıcının ülkesinde yaygın kabul gören yöntemi seçer. Yanlış varsayılan,
 * vakitleri dakikalarca kaydırdığı için ilk açılışta doğru tahmin önemli.
 */
export function defaultMethodForRegion(region: string | null): Method {
  switch (region) {
    case 'US':
    case 'CA':
      return 'NorthAmerica';
    case 'TR':
      return 'Turkey';
    case 'SA':
      return 'UmmAlQura';
    case 'EG':
      return 'Egyptian';
    case 'AE':
      return 'Dubai';
    case 'PK':
    case 'IN':
    case 'BD':
    case 'AF':
      return 'Karachi';
    case 'SG':
    case 'MY':
    case 'ID':
      return 'Singapore';
    case 'IR':
      return 'Tehran';
    default:
      return 'MuslimWorldLeague';
  }
}

function parametersFor(method: Method) {
  const params = CalculationMethod[method]();
  // Hanefi ikindi hesabı Karaçi yönteminin ayırt edici özelliği; diğerleri
  // kendi tanımlarındaki mezhep ayarında kalır.
  if (method === 'Karachi') {
    params.madhab = Madhab.Hanafi;
  }
  return params;
}

function entriesFor(times: PrayerTimes): PrayerEntry[] {
  return ORDER.map((key) => ({
    key,
    label: t(`prayer.${key}` as TranslationKey),
    date: times[key],
  }));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type DaySchedule = {
  entries: PrayerEntry[];
  /** Şu andan sonraki ilk vakit; yatsıdan sonra yarının sabahına döner. */
  next: PrayerEntry;
  /** İçinde bulunulan vakit; günün ilk vaktinden önce dün yatsısıdır. */
  current: PrayerEntry | null;
};

export function getSchedule(
  latitude: number,
  longitude: number,
  method: Method,
  now: Date = new Date(),
): DaySchedule {
  const coordinates = new Coordinates(latitude, longitude);
  const params = parametersFor(method);

  const entries = entriesFor(new PrayerTimes(coordinates, now, params));

  const upcoming = entries.find((entry) => entry.date.getTime() > now.getTime());
  const next =
    upcoming ??
    // Yatsı geçtiyse sonraki vakit yarının sabahı.
    entriesFor(new PrayerTimes(coordinates, addDays(now, 1), params))[0];

  const passed = entries.filter((entry) => entry.date.getTime() <= now.getTime());
  const current =
    passed.length > 0
      ? passed[passed.length - 1]
      : // Gece yarısı ile sabah arası: hâlâ dünkü yatsı vakti içindeyiz.
        entriesFor(new PrayerTimes(coordinates, addDays(now, -1), params))[ORDER.length - 1];

  return { entries, next, current };
}

/**
 * Saati verilen IANA saat diliminde ve cihazın 12/24 saat tercihine göre
 * biçimlendirir. Elle seçilen yurt dışı şehirlerde cihazın saat dilimi yanlış
 * sonuç vereceği için `timeZone` gerekli.
 */
export function formatTime(date: Date, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !uses24HourClock,
    timeZone,
  };
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    // Hermes'te saat dilimi desteği yoksa cihaz saatine düş.
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: undefined }).format(date);
  }
}

export function formatDate(date: Date, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone,
  };
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: undefined }).format(date);
  }
}

/** Kalan süreyi "2 hr 14 min" / "45 min" biçiminde verir. */
export function formatCountdown(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return t('duration.minutes', { minutes });
  return t('duration.hoursMinutes', { hours, minutes });
}
