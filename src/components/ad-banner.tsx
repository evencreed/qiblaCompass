import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ads, getBannerUnitId } from '@/lib/ads';
import { t } from '@/lib/i18n';
import { usePremium } from '@/lib/premium-context';

type Props = {
  /** "Reklamları kaldır" bağlantısına dokunulduğunda paywall'ı açar. */
  onRemoveAds: () => void;
};

/**
 * Yalnızca vakitler ekranının altında gösteriliyor. Kıble kadranında reklam
 * yok: uygulamanın asıl işi orada ve bu kategoride en çok şikayet edilen şey
 * kadranın üstündeki reklam.
 */
export function AdBanner({ onRemoveAds }: Props) {
  const { isPremium, isReady, available } = usePremium();
  const [failed, setFailed] = useState(false);

  const unitId = getBannerUnitId();

  // Abonelik durumu bilinmeden reklam göstermeyip, ödeme yapmış kullanıcıya
  // bir an için reklam görünmesini engelliyoruz.
  if (!ads || !unitId || !isReady || isPremium || failed) return null;

  const BannerAd = ads.BannerAd;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={ads.BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
      {available && (
        <Pressable onPress={onRemoveAds} accessibilityRole="button" hitSlop={8}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.link}>
            {t('ads.remove')}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
