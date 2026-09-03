import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t, type TranslationKey } from '@/lib/i18n';
import { usePremium } from '@/lib/premium-context';

/** Yayına çıkmadan önce gerçek adreslerle değiştirilmeli. */
const TERMS_URL = 'https://example.com/kullanim-kosullari';
const PRIVACY_URL = 'https://example.com/gizlilik';

const KNOWN_PERIODS = ['MONTHLY', 'ANNUAL', 'SIX_MONTH', 'THREE_MONTH', 'LIFETIME'];

function packageLabel(pkg: PurchasesPackage): string {
  if (KNOWN_PERIODS.includes(pkg.packageType)) {
    return t(`period.${pkg.packageType}` as TranslationKey);
  }
  return pkg.product.title;
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function Paywall({ visible, onClose }: Props) {
  const theme = useTheme();
  const { packages, purchase, restore, isBusy, isPremium, available, error } = usePremium();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <ThemedText type="subtitle">{t('paywall.title')}</ThemedText>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
              <ThemedText type="linkPrimary">{t('common.close')}</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.pitch}>
              {t('paywall.pitch')}
            </ThemedText>

            {isPremium ? (
              <ThemedView type="backgroundElement" style={styles.activeCard}>
                <ThemedText type="smallBold" style={{ color: '#22C55E' }}>
                  {t('paywall.activeTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('paywall.activeBody')}
                </ThemedText>
              </ThemedView>
            ) : !available ? (
              <ThemedView type="backgroundElement" style={styles.activeCard}>
                <ThemedText type="smallBold">{t('paywall.unavailableTitle')}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('paywall.unavailableBody')}
                </ThemedText>
              </ThemedView>
            ) : packages.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {t('paywall.loadFailed')}
              </ThemedText>
            ) : (
              <View style={styles.options}>
                {packages.map((pkg) => (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => purchase(pkg)}
                    disabled={isBusy}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                        opacity: isBusy ? 0.5 : 1,
                      },
                    ]}>
                    <View style={styles.optionText}>
                      <ThemedText type="smallBold">{packageLabel(pkg)}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {pkg.product.description || t('paywall.defaultBenefit')}
                      </ThemedText>
                    </View>
                    <ThemedText type="smallBold">{pkg.product.priceString}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {isBusy && <ActivityIndicator style={styles.spinner} />}

            {error && (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}

            {available && !isPremium && (
              <Pressable
                onPress={restore}
                disabled={isBusy}
                accessibilityRole="button"
                hitSlop={8}
                style={styles.restore}>
                <ThemedText type="linkPrimary">{t('paywall.restore')}</ThemedText>
              </Pressable>
            )}

            {/* Apple, abonelik ekranlarında süre, ücret ve otomatik yenileme
                koşullarının açıkça yazılmasını ve sözleşme bağlantılarının
                bulunmasını şart koşuyor. */}
            <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
              {t('paywall.legal')}
            </ThemedText>

            <View style={styles.links}>
              <Pressable onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link" hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.linkText}>
                  {t('paywall.terms')}
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link" hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.linkText}>
                  {t('paywall.privacy')}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  content: { gap: Spacing.three, paddingBottom: Spacing.five },
  pitch: { lineHeight: 24 },
  activeCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  options: { gap: Spacing.two },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  optionText: { flex: 1, gap: Spacing.half },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  spinner: { marginTop: Spacing.two },
  error: { color: '#E5484D' },
  restore: { alignSelf: 'center', paddingVertical: Spacing.two },
  legal: { fontSize: 12, lineHeight: 18 },
  links: { flexDirection: 'row', gap: Spacing.four, justifyContent: 'center' },
  linkText: { textDecorationLine: 'underline', fontSize: 12 },
});
