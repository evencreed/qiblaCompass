import { bannerAdUnitId, monetizationAvailable } from '@/lib/native-modules';

type AdsModule = typeof import('react-native-google-mobile-ads');

/**
 * Native modül yalnızca kullanılabilir olduğunda yükleniyor; Expo Go'da bu
 * satır çalışmadığı için uygulama açılışta çökmüyor.
 */
export const ads: AdsModule | null = monetizationAvailable
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('react-native-google-mobile-ads') as AdsModule)
  : null;

/**
 * Reklam SDK'sını başlatır. Önce Google'ın UMP onay akışı çalıştırılıyor:
 * AB ve Birleşik Krallık kullanıcılarına onay formu göstermek yasal zorunluluk,
 * ve onaysız kişiselleştirilmiş reklam göstermek AdMob hesabının askıya
 * alınmasına yol açabiliyor.
 */
export async function initializeAds(): Promise<void> {
  if (!ads) return;

  try {
    await ads.AdsConsent.gatherConsent();
  } catch {
    // Onay alınamazsa reklam gösterimi durmaz, yalnızca kişiselleştirilmemiş
    // reklam sunulur. Bu, Google'ın önerdiği davranış.
  }

  try {
    await ads.default().initialize();
  } catch {
    // SDK başlatılamazsa banner kendini gizler; uygulama etkilenmez.
  }
}

/**
 * Geliştirme sırasında Google'ın test birimini kullanıyoruz. Gerçek birimle
 * test etmek AdMob politikası ihlali sayılır ve hesabı kapattırabilir.
 */
export function getBannerUnitId(): string | null {
  if (!ads) return null;
  if (__DEV__ || !bannerAdUnitId) return ads.TestIds.BANNER;
  return bannerAdUnitId;
}
