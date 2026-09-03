import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { t } from '@/lib/i18n';
import { normalizeAngle, signedAngleDelta } from '@/lib/qibla';

/**
 * Ham manyetometre verisi titrer; ok bunu birebir yansıtırsa okunamaz hale
 * gelir. Her ölçümde farkın bu oranı kadar ilerleyerek yumuşatıyoruz.
 */
const SMOOTHING = 0.18;

/** Bu eşiğin altındaki değişimler için state güncellemeyip gereksiz render'ı önlüyoruz. */
const MIN_UPDATE_DEGREES = 0.25;

export type HeadingState = {
  /** Cihazın üst kenarının baktığı yön, derece. Ölçüm gelmediyse null. */
  heading: number | null;
  /**
   * Cihaz gerçek kuzeyi hesaplayamadıysa (konum izni yok) manyetik kuzey
   * kullanılır. O durumda kıble açısı sapma miktarı kadar hatalıdır.
   */
  usingMagneticNorth: boolean;
  /** Sensör güven düzeyi 0–3. 2'nin altı kalibrasyon gerektirir. */
  accuracy: number | null;
  error: string | null;
};

/**
 * @param enabled Aboneliği yalnızca konum izni alındıktan sonra başlatın.
 * iOS'ta `watchDeviceHeading` izin verilmeden çağrılırsa exception fırlatır,
 * bu yüzden izinden önce başlatmak sensörü hatalı biçimde "yok" gösterir.
 */
export function useHeading(enabled = true): HeadingState {
  const [heading, setHeading] = useState<number | null>(null);
  const [usingMagneticNorth, setUsingMagneticNorth] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const smoothed = useRef<number | null>(null);
  const lastPublished = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        subscription = await Location.watchHeadingAsync((event) => {
          // trueHeading, konum izni verilmediğinde -1 döner; o zaman manyetik
          // kuzeye düşüyoruz ve kullanıcıyı uyarabilmek için işaretliyoruz.
          const isTrue = event.trueHeading >= 0;
          const raw = normalizeAngle(isTrue ? event.trueHeading : event.magHeading);

          setUsingMagneticNorth(!isTrue);
          setAccuracy(event.accuracy);

          // 359° → 1° geçişinde geriye sarmaması için farkı işaretli alıyoruz.
          const previous = smoothed.current;
          const next =
            previous === null
              ? raw
              : normalizeAngle(previous + signedAngleDelta(previous, raw) * SMOOTHING);
          smoothed.current = next;

          const published = lastPublished.current;
          if (published === null || Math.abs(signedAngleDelta(published, next)) >= MIN_UPDATE_DEGREES) {
            lastPublished.current = next;
            setHeading(next);
          }
        });
        if (cancelled) subscription.remove();
      } catch {
        // Buraya izin verilmişken düşülüyorsa sorun gerçekten sensördedir.
        if (!cancelled) setError(t('qibla.sensorError'));
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      smoothed.current = null;
      lastPublished.current = null;
    };
  }, [enabled]);

  return { heading, usingMagneticNorth, accuracy, error };
}
