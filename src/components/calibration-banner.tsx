import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { t, type TranslationKey } from '@/lib/i18n';

export type CalibrationLevel = 'iyi' | 'zayif' | 'kotu' | 'manyetik-kuzey' | 'konum-izni-yok';

/**
 * Sensör doğruluğunu (0–3) bannerın anlayacağı seviyeye çevirir.
 * Konum izni en öncelikli durum: iOS pusula akışını izin olmadan hiç
 * başlatmaz, Android'de de gerçek kuzey hesaplanamaz.
 */
export function calibrationLevel(
  accuracy: number | null,
  usingMagneticNorth: boolean,
  hasLocationPermission: boolean,
): CalibrationLevel {
  if (!hasLocationPermission) return 'konum-izni-yok';
  if (usingMagneticNorth) return 'manyetik-kuzey';
  if (accuracy === null) return 'iyi';
  if (accuracy <= 0) return 'kotu';
  if (accuracy < 2) return 'zayif';
  return 'iyi';
}

const MESSAGES: Record<
  Exclude<CalibrationLevel, 'iyi'>,
  { title: TranslationKey; body: TranslationKey }
> = {
  'konum-izni-yok': {
    title: 'calibration.permissionTitle',
    body: 'calibration.permissionBody',
  },
  'manyetik-kuzey': {
    title: 'calibration.magneticTitle',
    body: 'calibration.magneticBody',
  },
  kotu: {
    title: 'calibration.poorTitle',
    body: 'calibration.poorBody',
  },
  zayif: {
    title: 'calibration.weakTitle',
    body: 'calibration.weakBody',
  },
};

const COLORS: Record<Exclude<CalibrationLevel, 'iyi'>, string> = {
  'konum-izni-yok': '#E5484D',
  'manyetik-kuzey': '#3C87F7',
  kotu: '#E5484D',
  zayif: '#D4A24C',
};

/** Uyarı görünürken 8 hareketini canlandıran küçük gösterge. */
function FigureEight({ color }: { color: string }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <Animated.Text
      style={[
        styles.glyph,
        {
          color,
          transform: [
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['-25deg', '25deg'],
              }),
            },
          ],
        },
      ]}>
      ∞
    </Animated.Text>
  );
}

export function CalibrationBanner({ level }: { level: CalibrationLevel }) {
  if (level === 'iyi') return null;

  const { title, body } = MESSAGES[level];
  const color = COLORS[level];

  return (
    <View style={[styles.banner, { borderColor: color, backgroundColor: `${color}1A` }]}>
      <FigureEight color={color} />
      <View style={styles.text}>
        <ThemedText type="smallBold" style={{ color }}>
          {t(title)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t(body)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  glyph: {
    fontSize: 28,
    fontWeight: '700',
  },
});
