import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t } from '@/lib/i18n';
import { useLocationState } from '@/lib/location-context';
import {
  distanceToKaabaKm,
  formatDegrees,
  formatDistance,
  greatCirclePath,
  KAABA,
  qiblaBearing,
} from '@/lib/qibla';

const QIBLA_COLOR = '#D4A24C';

/** Yakın görünümde yaklaşık 600 metrelik bir alan; bina ve sokaklar seçilir. */
const NEARBY_DELTA = 0.006;

type Mode = 'nearby' | 'full';

export default function MapScreen() {
  const theme = useTheme();
  const { coordinates, label, hasLocationPermission } = useLocationState();
  const mapRef = useRef<MapView | null>(null);
  const [mode, setMode] = useState<Mode>('nearby');

  const bearing = useMemo(
    () => (coordinates ? qiblaBearing(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );
  const distanceKm = useMemo(
    () => (coordinates ? distanceToKaabaKm(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );
  const path = useMemo(
    () => (coordinates ? greatCirclePath(coordinates.latitude, coordinates.longitude) : []),
    [coordinates],
  );

  const initialRegion: Region | undefined = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: NEARBY_DELTA,
        longitudeDelta: NEARBY_DELTA,
      }
    : undefined;

  // Konum değiştiğinde veya kullanıcı görünüm değiştirdiğinde haritayı taşı.
  useEffect(() => {
    if (!coordinates || !mapRef.current) return;

    if (mode === 'nearby') {
      mapRef.current.animateToRegion(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: NEARBY_DELTA,
          longitudeDelta: NEARBY_DELTA,
        },
        600,
      );
    } else {
      mapRef.current.fitToCoordinates([coordinates, KAABA], {
        edgePadding: { top: 120, right: 80, bottom: 220, left: 80 },
        animated: true,
      });
    }
  }, [mode, coordinates]);

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.fallback}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.fallbackText}>
          The map is available in the mobile app.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!coordinates || bearing === null || distanceKm === null) {
    return (
      <ThemedView style={styles.fallback}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.fallbackText}>
          {t('map.needLocation')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}>
        {/* Büyük daire yolu; 180. meridyeni geçen yollar parçalı gelir. */}
        {path.map((part, index) => (
          <Polyline
            key={index}
            coordinates={part}
            strokeColor={QIBLA_COLOR}
            strokeWidth={4}
            lineCap="round"
          />
        ))}

        <Marker coordinate={coordinates} title={t('map.you')} description={label} pinColor="#3C87F7" />
        <Marker
          coordinate={KAABA}
          title={t('map.kaaba')}
          description={t('map.kaabaSubtitle')}
          pinColor={QIBLA_COLOR}
        />
      </MapView>

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.modes}>
          {(['nearby', 'full'] as Mode[]).map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.modeChip,
                  {
                    backgroundColor: selected ? theme.text : theme.background,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selected ? theme.background : theme.text }}>
                  {t(option === 'nearby' ? 'map.nearby' : 'map.fullRoute')}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <View style={styles.card} pointerEvents="none">
        <ThemedView type="backgroundElement" style={styles.cardInner}>
          <ThemedText type="smallBold" style={{ color: QIBLA_COLOR }}>
            {t('map.summary', {
              degrees: formatDegrees(bearing),
              distance: formatDistance(distanceKm),
            })}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('map.hint')}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  fallbackText: { textAlign: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  modes: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    justifyContent: 'center',
  },
  modeChip: {
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: BottomTabInset + Spacing.three,
  },
  cardInner: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
