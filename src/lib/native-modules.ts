import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Expo Go, native kod içeren modülleri barındırmaz. Reklam (AdMob) ve satın
 * alma (RevenueCat) modülleri bu gruba girer.
 *
 * Bu bayrağa bakarak modülleri yalnızca development build ve yayın
 * derlemelerinde yüklüyoruz; böylece uygulamanın geri kalanı geliştirme
 * sırasında Expo Go'da çalışmaya devam edebiliyor. Aksi halde import
 * satırının kendisi Expo Go'da uygulamayı çökertirdi.
 */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Reklam ve abonelik bu ortamda çalışabilir mi. */
export const monetizationAvailable = !isExpoGo && Platform.OS !== 'web';

type MonetizationConfig = {
  revenueCatIos?: string;
  revenueCatAndroid?: string;
  bannerAdUnitIos?: string;
  bannerAdUnitAndroid?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as MonetizationConfig;

/** Bu platform için RevenueCat genel API anahtarı. */
export const revenueCatApiKey = Platform.select({
  ios: extra.revenueCatIos,
  android: extra.revenueCatAndroid,
});

/** Bu platform için yayın banner reklam birimi. */
export const bannerAdUnitId = Platform.select({
  ios: extra.bannerAdUnitIos,
  android: extra.bannerAdUnitAndroid,
});

/**
 * Anahtarlar app.json'a girilmeden abonelik akışı çalışamaz. Yapılandırma
 * eksikken çökmek yerine paywall'da açıklayıcı bir mesaj gösteriyoruz.
 */
export const purchasesConfigured =
  monetizationAvailable && typeof revenueCatApiKey === 'string' && revenueCatApiKey.length > 0;
