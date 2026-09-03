import { getCalendars, getLocales } from 'expo-localization';

/**
 * İngilizce kaynak dildir: yeni bir metin önce buraya eklenir, sonra diğer
 * dillere çevrilir. `Record<Key, string>` sayesinde eksik çeviri derleme
 * hatası verir, sessizce İngilizce görünmez.
 */
const en = {
  'tab.qibla': 'Qibla',
  'tab.times': 'Prayer Times',
  'tab.map': 'Map',

  'location.change': 'change',
  'location.changeA11y': 'Change location',
  'location.gps': 'GPS',
  'location.manual': 'chosen manually',
  'location.current': 'Current location',
  'location.waiting': 'Locating…',
  'location.title': 'Location',
  'location.useAutomatic': 'Use my location',
  'location.detect': 'Detect where you are with GPS',
  'location.now': 'Now: {name}',
  'location.search': 'Search for a city',
  'location.noResults': 'No results for “{query}”.',

  'common.close': 'Close',

  'qibla.permissionNeeded': 'Location permission is required for the compass',
  'qibla.waitingLocation': 'Waiting for location…',
  'qibla.readingCompass': 'Reading compass…',
  'qibla.aligned': 'You are facing the Qibla',
  'qibla.turnRight': 'Turn right {degrees}°',
  'qibla.turnLeft': 'Turn left {degrees}°',
  'qibla.meta': 'Kaaba is {direction} · {distance} away',
  'qibla.requestPermission': 'Grant location access',
  'qibla.openSettings': 'Open settings',
  'qibla.dialWaiting': 'waiting for compass',
  'qibla.dialHeading': 'device {degrees}°',
  'qibla.sensorError': 'The compass sensor could not be read. Try restarting your device.',
  'qibla.holdFlat': 'Hold your phone flat',
  'qibla.holdFlatHint': 'The compass drifts while the phone is tilted.',

  'calibration.permissionTitle': 'Location permission required',
  'calibration.permissionBody':
    'Your phone will not share compass data until location access is granted.',
  'calibration.magneticTitle': 'True north unknown',
  'calibration.magneticBody':
    'Without location access the compass shows magnetic north, so the Qibla may be off by a few degrees.',
  'calibration.poorTitle': 'Compass unreliable',
  'calibration.poorBody':
    'Magnetic interference detected. Move away from metal surfaces and magnetic cases, then trace a figure eight.',
  'calibration.weakTitle': 'Compass needs calibrating',
  'calibration.weakBody':
    'Trace a figure eight in the air with your phone a few times; accuracy will correct itself.',

  'times.next': 'Next prayer',
  'times.remaining': '{time} left',
  'times.method': 'Calculation method',
  'times.methodNote':
    'Times are calculated astronomically and may differ by a minute or two from your local mosque.',
  'times.needLocation':
    'A location is needed to calculate prayer times. Choose a city above.',

  'notifications.title': 'Prayer reminders',
  'notifications.enable': 'Remind me before prayer times',
  'notifications.channelName': 'Prayer times',
  'notifications.which': 'Which prayers',
  'notifications.timing': 'When to remind me',
  'notifications.atTime': 'On time',
  'notifications.minutesBefore': '{minutes} min before',
  'notifications.bodyNow': 'It is time for {prayer} · {time}',
  'notifications.bodySoon': '{prayer} is in {minutes} minutes · {time}',
  'notifications.denied':
    'Notifications are turned off for this app. Enable them in your device settings to get reminders.',
  'notifications.openSettings': 'Open settings',
  'notifications.scheduled': '{count} reminders scheduled for the week ahead.',
  'notifications.sound': 'Sound',
  'notifications.previewTitle': 'Sound preview',
  'notifications.soundNeedsBuild':
    'This sound ships with the app, so it stays silent in Expo Go. It plays in a development or store build.',

  'sound.default': 'System default',
  'sound.chime': 'Chime',
  'sound.silent': 'Silent',

  'prayer.fajr': 'Fajr',
  'prayer.sunrise': 'Sunrise',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',

  'method.NorthAmerica': 'ISNA (North America)',
  'method.MuslimWorldLeague': 'Muslim World League',
  'method.Egyptian': 'Egyptian General Authority',
  'method.UmmAlQura': 'Umm al-Qura (Makkah)',
  'method.Karachi': 'Karachi (Hanafi)',
  'method.Dubai': 'Dubai',
  'method.Turkey': 'Diyanet (Türkiye)',
  'method.Singapore': 'Singapore',
  'method.Tehran': 'Tehran',
  'method.MoonsightingCommittee': 'Moonsighting Committee',

  'duration.minutes': '{minutes} min',
  'duration.hoursMinutes': '{hours} hr {minutes} min',

  'ads.remove': 'Remove ads',

  'paywall.title': 'Ad-free',
  'paywall.pitch':
    'A subscription only removes ads. The Qibla compass, prayer times and every other feature stay free for everyone.',
  'paywall.activeTitle': 'Your subscription is active',
  'paywall.activeBody': 'Ads are turned off. Thank you.',
  'paywall.unavailableTitle': 'Purchases are unavailable here',
  'paywall.unavailableBody':
    'Subscriptions only work in a store build or a development build. Expo Go does not support them.',
  'paywall.loadFailed':
    'Subscription options could not be loaded. Check your connection and reopen this screen.',
  'paywall.defaultBenefit': 'Ad-free use',
  'paywall.restore': 'Restore purchases',
  'paywall.legal':
    'Subscriptions renew automatically unless cancelled at least 24 hours before the end of the period. Manage or cancel your subscription in your account settings.',
  'paywall.terms': 'Terms of use',
  'paywall.privacy': 'Privacy policy',
  'paywall.purchaseFailed':
    'The purchase could not be completed. Check your payment method and try again.',
  'paywall.nothingToRestore': 'No subscription was found for this account.',
  'paywall.restoreFailed': 'Restore failed. Please try again later.',
  'paywall.infoFailed': 'Subscription status could not be loaded. Check your connection.',

  'period.MONTHLY': 'Monthly',
  'period.ANNUAL': 'Annual',
  'period.SIX_MONTH': '6 months',
  'period.THREE_MONTH': '3 months',
  'period.LIFETIME': 'Lifetime',

  'compass.N': 'N',
  'compass.NE': 'NE',
  'compass.E': 'E',
  'compass.SE': 'SE',
  'compass.S': 'S',
  'compass.SW': 'SW',
  'compass.W': 'W',
  'compass.NW': 'NW',

  'unit.km': '{value} km',
  'unit.mi': '{value} mi',

  'map.you': 'You',
  'map.kaaba': 'Kaaba',
  'map.kaabaSubtitle': 'Masjid al-Haram, Makkah',
  'map.nearby': 'Nearby',
  'map.fullRoute': 'Full route',
  'map.summary': 'Qibla {degrees}° · {distance}',
  'map.hint':
    'The gold line points to the Kaaba. When the compass is unreliable indoors, line yourself up with it using a wall or the street outside.',
  'map.needLocation': 'A location is needed to draw the map. Pick a city from the Qibla tab.',
} as const;

export type TranslationKey = keyof typeof en;

const tr: Record<TranslationKey, string> = {
  'tab.qibla': 'Kıble',
  'tab.times': 'Vakitler',
  'tab.map': 'Harita',

  'location.change': 'değiştir',
  'location.changeA11y': 'Konumu değiştir',
  'location.gps': 'GPS',
  'location.manual': 'elle seçildi',
  'location.current': 'Bulunduğunuz konum',
  'location.waiting': 'Konum bulunuyor…',
  'location.title': 'Konum',
  'location.useAutomatic': 'Otomatik konum kullan',
  'location.detect': 'GPS ile bulunduğunuz yeri algıla',
  'location.now': 'Şu an: {name}',
  'location.search': 'Şehir ara',
  'location.noResults': '“{query}” için sonuç yok.',

  'common.close': 'Kapat',

  'qibla.permissionNeeded': 'Pusula için konum izni gerekli',
  'qibla.waitingLocation': 'Konum bekleniyor…',
  'qibla.readingCompass': 'Pusula okunuyor…',
  'qibla.aligned': 'Kıble yönündesiniz',
  'qibla.turnRight': 'Sağa {degrees}° dönün',
  'qibla.turnLeft': 'Sola {degrees}° dönün',
  'qibla.meta': 'Kâbe {direction} yönünde · {distance}',
  'qibla.requestPermission': 'Konum iznini iste',
  'qibla.openSettings': 'Ayarlarda izin ver',
  'qibla.dialWaiting': 'pusula bekleniyor',
  'qibla.dialHeading': 'cihaz {degrees}°',
  'qibla.sensorError': 'Pusula sensörü okunamadı. Cihazı yeniden başlatmayı deneyin.',
  'qibla.holdFlat': 'Telefonu yere paralel tutun',
  'qibla.holdFlatHint': 'Telefon eğikken pusula sapıyor.',

  'calibration.permissionTitle': 'Pusula için konum izni gerekli',
  'calibration.permissionBody':
    'Konum izni verilmeden telefon pusula verisini uygulamaya aktarmıyor.',
  'calibration.magneticTitle': 'Gerçek kuzey bilinmiyor',
  'calibration.magneticBody':
    'Konum izni olmadan pusula manyetik kuzeyi gösterir, bu yüzden kıble birkaç derece şaşabilir.',
  'calibration.poorTitle': 'Pusula güvenilmez',
  'calibration.poorBody':
    'Manyetik parazit var. Telefonu metal yüzeylerden ve mıknatıslı kılıflardan uzaklaştırın, sonra 8 çizin.',
  'calibration.weakTitle': 'Pusula kalibrasyonu gerekiyor',
  'calibration.weakBody':
    'Telefonu havada birkaç kez 8 rakamı çizerek çevirin; doğruluk kendiliğinden düzelecek.',

  'times.next': 'Sonraki vakit',
  'times.remaining': '{time} kaldı',
  'times.method': 'Hesaplama yöntemi',
  'times.methodNote':
    'Vakitler astronomik olarak hesaplanır; yerel takvimle bir iki dakika farklılık gösterebilir.',
  'times.needLocation':
    'Vakitleri hesaplamak için konum gerekli. Yukarıdan bir şehir seçebilirsiniz.',

  'notifications.title': 'Vakit hatırlatmaları',
  'notifications.enable': 'Namaz vakitlerinden önce hatırlat',
  'notifications.channelName': 'Namaz vakitleri',
  'notifications.which': 'Hangi vakitler',
  'notifications.timing': 'Ne zaman hatırlatılsın',
  'notifications.atTime': 'Tam vaktinde',
  'notifications.minutesBefore': '{minutes} dk önce',
  'notifications.bodyNow': '{prayer} vakti girdi · {time}',
  'notifications.bodySoon': '{prayer} vaktine {minutes} dakika kaldı · {time}',
  'notifications.denied':
    'Bu uygulama için bildirimler kapalı. Hatırlatma alabilmek için cihaz ayarlarından açın.',
  'notifications.openSettings': 'Ayarları aç',
  'notifications.scheduled': 'Önümüzdeki hafta için {count} hatırlatma kuruldu.',
  'notifications.sound': 'Ses',
  'notifications.previewTitle': 'Ses denemesi',
  'notifications.soundNeedsBuild':
    'Bu ses uygulamayla birlikte paketleniyor, bu yüzden Expo Go’da sessiz kalır. Development veya mağaza derlemesinde çalar.',

  'sound.default': 'Sistem sesi',
  'sound.chime': 'Çan',
  'sound.silent': 'Sessiz',

  'prayer.fajr': 'İmsak',
  'prayer.sunrise': 'Güneş',
  'prayer.dhuhr': 'Öğle',
  'prayer.asr': 'İkindi',
  'prayer.maghrib': 'Akşam',
  'prayer.isha': 'Yatsı',

  'method.NorthAmerica': 'ISNA (Kuzey Amerika)',
  'method.MuslimWorldLeague': 'Dünya İslam Birliği',
  'method.Egyptian': 'Mısır Genel Araştırma Kurumu',
  'method.UmmAlQura': 'Ümmü’l-Kura (Mekke)',
  'method.Karachi': 'Karaçi (Hanefi)',
  'method.Dubai': 'Dubai',
  'method.Turkey': 'Diyanet (Türkiye)',
  'method.Singapore': 'Singapur',
  'method.Tehran': 'Tahran',
  'method.MoonsightingCommittee': 'Moonsighting Committee',

  'duration.minutes': '{minutes} dk',
  'duration.hoursMinutes': '{hours} sa {minutes} dk',

  'ads.remove': 'Reklamları kaldır',

  'paywall.title': 'Reklamsız',
  'paywall.pitch':
    'Abonelik yalnızca reklamları kaldırır. Kıble pusulası, namaz vakitleri ve tüm diğer özellikler herkese ücretsiz kalır.',
  'paywall.activeTitle': 'Aboneliğiniz etkin',
  'paywall.activeBody': 'Reklamlar kapalı. Teşekkürler.',
  'paywall.unavailableTitle': 'Satın alma bu ortamda kullanılamıyor',
  'paywall.unavailableBody':
    'Abonelik yalnızca mağaza sürümünde ve development build’de çalışır; Expo Go bunu desteklemiyor.',
  'paywall.loadFailed':
    'Abonelik seçenekleri yüklenemedi. İnternet bağlantınızı kontrol edip ekranı yeniden açın.',
  'paywall.defaultBenefit': 'Reklamsız kullanım',
  'paywall.restore': 'Satın alımları geri yükle',
  'paywall.legal':
    'Abonelik, dönem bitiminden en az 24 saat önce iptal edilmezse otomatik olarak yenilenir. Aboneliğinizi hesap ayarlarınızdan yönetebilir veya iptal edebilirsiniz.',
  'paywall.terms': 'Kullanım koşulları',
  'paywall.privacy': 'Gizlilik politikası',
  'paywall.purchaseFailed':
    'Satın alma tamamlanamadı. Ödeme yönteminizi kontrol edip tekrar deneyin.',
  'paywall.nothingToRestore': 'Bu hesapta geri yüklenecek bir abonelik bulunamadı.',
  'paywall.restoreFailed': 'Geri yükleme başarısız oldu. Daha sonra tekrar deneyin.',
  'paywall.infoFailed': 'Abonelik bilgisi alınamadı. İnternet bağlantınızı kontrol edin.',

  'period.MONTHLY': 'Aylık',
  'period.ANNUAL': 'Yıllık',
  'period.SIX_MONTH': '6 aylık',
  'period.THREE_MONTH': '3 aylık',
  'period.LIFETIME': 'Ömür boyu',

  'compass.N': 'K',
  'compass.NE': 'KD',
  'compass.E': 'D',
  'compass.SE': 'GD',
  'compass.S': 'G',
  'compass.SW': 'GB',
  'compass.W': 'B',
  'compass.NW': 'KB',

  'unit.km': '{value} km',
  'unit.mi': '{value} mil',

  'map.you': 'Siz',
  'map.kaaba': 'Kâbe',
  'map.kaabaSubtitle': 'Mescid-i Haram, Mekke',
  'map.nearby': 'Yakın',
  'map.fullRoute': 'Tüm yol',
  'map.summary': 'Kıble {degrees}° · {distance}',
  'map.hint':
    'Altın çizgi Kâbe’yi gösterir. Kapalı alanda pusula güvenilmezken bir duvarı veya sokağı bu çizgiye göre referans alabilirsiniz.',
  'map.needLocation': 'Haritayı çizmek için konum gerekli. Kıble sekmesinden bir şehir seçin.',
};

const translations = { en, tr };

type Language = keyof typeof translations;

function detectLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'tr' ? 'tr' : 'en';
}

/** Cihazın dili. Desteklenmeyen diller İngilizceye düşer. */
export const language: Language = detectLanguage();

/** Tarih ve sayı biçimlendirmede kullanılacak tam yerel etiket. */
export const locale: string = getLocales()[0]?.languageTag ?? 'en-US';

/** ISO ülke kodu; hesaplama yöntemi ve mesafe birimi seçiminde kullanılır. */
export const regionCode: string | null = getLocales()[0]?.regionCode ?? null;

/**
 * Cihaz 24 saatlik gösterim kullanıyor mu. ABD'de varsayılan 12 saat olduğu
 * için vakitleri sabit biçimde yazmak yerine cihaz tercihine uyuyoruz.
 */
export const uses24HourClock: boolean = getCalendars()[0]?.uses24hourClock ?? false;

/**
 * Mesafeyi mil olarak gösteren ülkeler. Diğer her yerde kilometre kullanılır.
 */
const IMPERIAL_REGIONS = new Set(['US', 'GB', 'LR', 'MM']);

export const usesMiles: boolean = regionCode !== null && IMPERIAL_REGIONS.has(regionCode);

/**
 * Çeviriyi döndürür ve `{ad}` yer tutucularını doldurur.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template: string = translations[language][key] ?? en[key];
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
