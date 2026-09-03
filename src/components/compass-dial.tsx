import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { t, type TranslationKey } from '@/lib/i18n';
import { formatDegrees, normalizeAngle } from '@/lib/qibla';

/** Kıble oku bu açı farkının içindeyken hizalanmış sayılır. */
export const ALIGN_THRESHOLD_DEGREES = 3;

const QIBLA_COLOR = '#D4A24C';
const ALIGNED_COLOR = '#22C55E';

const CARDINALS: { key: TranslationKey; angle: number; major: boolean }[] = [
  { key: 'compass.N', angle: 0, major: true },
  { key: 'compass.NE', angle: 45, major: false },
  { key: 'compass.E', angle: 90, major: true },
  { key: 'compass.SE', angle: 135, major: false },
  { key: 'compass.S', angle: 180, major: true },
  { key: 'compass.SW', angle: 225, major: false },
  { key: 'compass.W', angle: 270, major: true },
  { key: 'compass.NW', angle: 315, major: false },
];

/** Kadran merkezinden verilen açı ve yarıçaptaki noktanın koordinatı. */
function pointAt(center: number, radius: number, angleDegrees: number) {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: center + radius * Math.sin(radians),
    y: center - radius * Math.cos(radians),
  };
}

type Props = {
  size: number;
  /** Cihazın baktığı yön; ölçüm yoksa null. */
  heading: number | null;
  /** Kâbe'nin gerçek kuzeye göre açısı. */
  qibla: number | null;
  /** Kıble oku hedefe kilitlendi mi. */
  aligned: boolean;
};

export function CompassDial({ size, heading, qibla, aligned }: Props) {
  const theme = useTheme();
  const center = size / 2;
  const outerRadius = center - 6;
  const tickOuter = outerRadius - 4;
  const labelRadius = outerRadius - 34;

  const accent = aligned ? ALIGNED_COLOR : QIBLA_COLOR;
  const dialRotation = heading === null ? 0 : -heading;
  const kaaba = qibla === null ? null : pointAt(center, labelRadius - 26, qibla);

  const ticks = Array.from({ length: 72 }, (_, index) => index * 5);

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {/* Kadran zemini */}
        <Circle cx={center} cy={center} r={outerRadius} fill={theme.backgroundElement} />
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke={theme.backgroundSelected}
          strokeWidth={2}
          fill="none"
        />

        {/* Kuzeye göre dönen kısım: dereceler, yön harfleri ve kıble oku */}
        {/* Standart SVG transform: react-native-svg'nin rotation/origin
            kısayolundan farklı olarak web'de de uyarısız çalışır. */}
        <G transform={`rotate(${dialRotation}, ${center}, ${center})`}>
          {ticks.map((angle) => {
            const isCardinal = angle % 45 === 0;
            const isMajor = angle % 15 === 0;
            const length = isCardinal ? 14 : isMajor ? 10 : 5;
            const start = pointAt(center, tickOuter, angle);
            const end = pointAt(center, tickOuter - length, angle);
            return (
              <Line
                key={angle}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isCardinal ? theme.text : theme.textSecondary}
                strokeWidth={isCardinal ? 2.5 : isMajor ? 1.5 : 1}
                opacity={isCardinal ? 0.9 : isMajor ? 0.55 : 0.3}
              />
            );
          })}

          {CARDINALS.map(({ key, angle, major }) => {
            const position = pointAt(center, labelRadius, angle);
            const fontSize = major ? 20 : 12;
            const isNorth = key === 'compass.N';
            return (
              <SvgText
                key={key}
                x={position.x}
                y={position.y + fontSize * 0.35}
                fontSize={fontSize}
                fontWeight={major ? '700' : '500'}
                textAnchor="middle"
                fill={isNorth ? '#E5484D' : major ? theme.text : theme.textSecondary}>
                {t(key)}
              </SvgText>
            );
          })}

          {qibla !== null && kaaba && (
            <G>
              {/* Merkezden Kâbe'ye uzanan ok */}
              <Line
                x1={center}
                y1={center}
                x2={kaaba.x}
                y2={kaaba.y}
                stroke={accent}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Circle cx={kaaba.x} cy={kaaba.y} r={17} fill={accent} />
              {/* Kâbe simgesi: küp ve üzerindeki kuşak */}
              <Path
                d={`M ${kaaba.x - 7} ${kaaba.y - 8} h 14 v 16 h -14 Z`}
                fill="#111111"
                opacity={0.85}
              />
              <Line
                x1={kaaba.x - 7}
                y1={kaaba.y - 2}
                x2={kaaba.x + 7}
                y2={kaaba.y - 2}
                stroke={accent}
                strokeWidth={2}
              />
            </G>
          )}
        </G>

        {/* Sabit tepe göstergesi: cihazın baktığı yön */}
        <Polygon
          points={`${center},${center - outerRadius - 1} ${center - 9},${center - outerRadius + 17} ${center + 9},${center - outerRadius + 17}`}
          fill={accent}
        />
        <Circle cx={center} cy={center} r={6} fill={theme.text} opacity={0.7} />
      </Svg>

      <View style={styles.readout}>
        <ThemedText type="title" style={[styles.degrees, { color: accent }]}>
          {qibla === null ? '--°' : formatDegrees(qibla)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {heading === null
            ? t('qibla.dialWaiting')
            : t('qibla.dialHeading', { degrees: Math.round(normalizeAngle(heading)) })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  readout: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Kadranın ortasındaki yazı dokunmaları engellememeli.
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    gap: 2,
  },
  degrees: {
    fontSize: 40,
    lineHeight: 46,
  },
});
