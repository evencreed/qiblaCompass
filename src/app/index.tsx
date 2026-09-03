import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalibrationBanner, calibrationLevel } from '@/components/calibration-banner';
import { CityPicker } from '@/components/city-picker';
import { ALIGN_THRESHOLD_DEGREES, CompassDial } from '@/components/compass-dial';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHeading } from '@/hooks/use-heading';
import { useTilt } from '@/hooks/use-tilt';
import { useTheme } from '@/hooks/use-theme';
import { useLocationState } from '@/lib/location-context';
import { t } from '@/lib/i18n';
import {
  compassPoint,
  distanceToKaabaKm,
  formatDistance,
  qiblaBearing,
  signedAngleDelta,
} from '@/lib/qibla';

/**
 * Hizalanma titreşimi eşiğin hemen dışında sürekli tetiklenmesin diye
 * çıkışta daha geniş bir açı kullanılıyor.
 */
const RELEASE_THRESHOLD_DEGREES = 6;

export default function QiblaScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { coordinates, label, source, refreshGps, hasLocationPermission, canAskAgain } =
    useLocationState();
  // Pusulayı ancak izin alındıktan sonra başlat: iOS izinsiz çağrıda
  // exception fırlatıyor ve sensör yokmuş gibi görünüyor.
  const { heading, usingMagneticNorth, accuracy, error } = useHeading(hasLocationPermission);
  // Pusula yalnızca telefon yere paralelken doğrudur; eğimi ayrıca ölçüyoruz.
  const { isFlat } = useTilt(hasLocationPermission);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [aligned, setAligned] = useState(false);
  const wasAligned = useRef(false);

  const qibla = useMemo(
    () => (coordinates ? qiblaBearing(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );
  const distanceKm = useMemo(
    () => (coordinates ? distanceToKaabaKm(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );

  const delta = heading !== null && qibla !== null ? signedAngleDelta(heading, qibla) : null;

  // Hizalanma durumunu histerezisle takip et ve girişte bir kez titret.
  useEffect(() => {
    if (delta === null) return;
    const magnitude = Math.abs(delta);
    const withinAngle = wasAligned.current
      ? magnitude <= RELEASE_THRESHOLD_DEGREES
      : magnitude <= ALIGN_THRESHOLD_DEGREES;
    // Telefon eğikken "hizalandınız" demek yanlış yönü onaylamak olur;
    // titreşim ve yeşil gösterge o durumda tetiklenmemeli.
    const next = withinAngle && isFlat;

    if (next !== wasAligned.current) {
      wasAligned.current = next;
      setAligned(next);
      if (next && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
          // Titreşim desteklenmiyorsa sessizce geç.
        });
      }
    }
  }, [delta, isFlat]);

  const dialSize = Math.min(width - Spacing.four * 2, 340);

  const guidance = () => {
    if (!hasLocationPermission) return t('qibla.permissionNeeded');
    if (error) return error;
    if (qibla === null) return t('qibla.waitingLocation');
    if (heading === null) return t('qibla.readingCompass');
    if (!isFlat) return t('qibla.holdFlat');
    if (aligned) return t('qibla.aligned');
    if (delta === null) return '';
    const degrees = Math.round(Math.abs(delta));
    return delta > 0 ? t('qibla.turnRight', { degrees }) : t('qibla.turnLeft', { degrees });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Pressable
          onPress={() => setPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={t('location.changeA11y')}
          style={({ pressed }) => [
            styles.locationChip,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {source === 'manual' ? t('location.manual') : t('location.gps')} · {t('location.change')}
          </ThemedText>
        </Pressable>

        <CalibrationBanner
          level={calibrationLevel(accuracy, usingMagneticNorth, hasLocationPermission)}
        />

        {/* Eğikken kadran soluklaşıyor: okunan yönün o an güvenilmez
            olduğunu metinden önce görsel olarak anlatıyor. */}
        <View style={[styles.dialArea, !isFlat && styles.dialTilted]}>
          <CompassDial size={dialSize} heading={heading} qibla={qibla} aligned={aligned} />
        </View>

        <View style={styles.footer}>
          <ThemedText type="subtitle" style={[styles.guidance, aligned && styles.guidanceAligned]}>
            {guidance()}
          </ThemedText>

          {!isFlat ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
              {t('qibla.holdFlatHint')}
            </ThemedText>
          ) : (
            qibla !== null &&
            distanceKm !== null && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
                {t('qibla.meta', {
                  direction: compassPoint(qibla),
                  distance: formatDistance(distanceKm),
                })}
              </ThemedText>
            )
          )}

          {/* Elle şehir seçmiş kullanıcının da pusula için izne ihtiyacı var.
              İzin bir kez reddedildiyse sistem diyaloğu bir daha açılmaz,
              o yüzden kullanıcıyı doğrudan ayarlara gönderiyoruz. */}
          {!hasLocationPermission && (
            <Pressable
              onPress={canAskAgain ? refreshGps : () => Linking.openSettings()}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.action,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
              ]}>
              <ThemedText type="smallBold">
                {canAskAgain ? t('qibla.requestPermission') : t('qibla.openSettings')}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <CityPicker visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  locationChip: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  dialArea: { flex: 1, justifyContent: 'center' },
  dialTilted: { opacity: 0.35 },
  footer: { alignItems: 'center', gap: Spacing.two, alignSelf: 'stretch' },
  guidance: { fontSize: 24, lineHeight: 32, textAlign: 'center' },
  guidanceAligned: { color: '#22C55E' },
  meta: { textAlign: 'center' },
  action: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
});
