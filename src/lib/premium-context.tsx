import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import { t } from '@/lib/i18n';
import { purchasesConfigured, revenueCatApiKey } from '@/lib/native-modules';

/**
 * RevenueCat panelinde tanımlanan hak (entitlement) kimliği. Abonelik satın
 * alındığında bu hak aktif olur; reklamları gizleme kararını buna bakarak
 * veriyoruz, tek tek ürün kimliklerine değil.
 */
const ENTITLEMENT_ID = 'reklamsiz';

type PremiumState = {
  /** Kullanıcı reklamsız hakkına sahip mi. */
  isPremium: boolean;
  /** İlk sorgu tamamlandı mı; tamamlanmadan reklam göstermiyoruz. */
  isReady: boolean;
  /** Satın alınabilir abonelik paketleri (aylık, yıllık). */
  packages: PurchasesPackage[];
  /** Satın alma veya geri yükleme sürüyor mu. */
  isBusy: boolean;
  /** Bu ortamda satın alma mümkün mü (Expo Go ve web'de değil). */
  available: boolean;
  error: string | null;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
};

const PremiumContext = createContext<PremiumState | null>(null);

/**
 * Native modülü yalnızca gerçekten kullanılabildiğinde yüklüyoruz. Statik
 * import Expo Go'da uygulamayı açılışta çökertirdi.
 */
function loadPurchases() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-purchases').default as typeof import('react-native-purchases').default;
}

function hasEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(!purchasesConfigured);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchasesConfigured) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    (async () => {
      try {
        const Purchases = loadPurchases();
        Purchases.configure({ apiKey: revenueCatApiKey as string });

        const info = await Purchases.getCustomerInfo();
        if (!cancelled) setIsPremium(hasEntitlement(info));

        // Abonelik başka bir cihazda değişirse veya yenilenirse haberdar ol.
        // Dinleyici kendi referansıyla kaldırılıyor; ekleme çağrısı bir
        // temizleme fonksiyonu döndürmüyor.
        const listener = (updated: CustomerInfo) => setIsPremium(hasEntitlement(updated));
        Purchases.addCustomerInfoUpdateListener(listener);
        removeListener = () => Purchases.removeCustomerInfoUpdateListener(listener);

        const offerings = await Purchases.getOfferings();
        if (!cancelled) setPackages(offerings.current?.availablePackages ?? []);
      } catch {
        // Ağ hatası satın alma ekranını engellemeli ama uygulamayı değil;
        // bu durumda kullanıcı ücretsiz sürümü sorunsuz kullanmaya devam eder.
        if (!cancelled) setError(t('paywall.infoFailed'));
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    setIsBusy(true);
    setError(null);
    try {
      const Purchases = loadPurchases();
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPremium(hasEntitlement(customerInfo));
    } catch (e) {
      // Kullanıcının vazgeçmesi hata değil, sessizce kapatılmalı.
      const cancelled = (e as { userCancelled?: boolean })?.userCancelled;
      if (!cancelled) {
        setError(t('paywall.purchaseFailed'));
      }
    } finally {
      setIsBusy(false);
    }
  }, []);

  /**
   * Apple, satın alımları geri yükleme seçeneği sunmayan uygulamaları
   * reddediyor. Cihaz değiştiren veya uygulamayı silip kuran kullanıcı
   * aboneliğine bununla geri kavuşur.
   */
  const restore = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const Purchases = loadPurchases();
      const info = await Purchases.restorePurchases();
      const restored = hasEntitlement(info);
      setIsPremium(restored);
      if (!restored) {
        setError(t('paywall.nothingToRestore'));
      }
    } catch {
      setError(t('paywall.restoreFailed'));
    } finally {
      setIsBusy(false);
    }
  }, []);

  const value = useMemo<PremiumState>(
    () => ({
      isPremium,
      isReady,
      packages,
      isBusy,
      available: purchasesConfigured,
      error,
      purchase,
      restore,
    }),
    [isPremium, isReady, packages, isBusy, error, purchase, restore],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumState {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium, PremiumProvider içinde kullanılmalı.');
  }
  return context;
}
