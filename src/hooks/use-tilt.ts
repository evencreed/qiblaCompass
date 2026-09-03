import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

/**
 * Pusula okuması, telefon yere paralel tutulduğunda doğrudur. Cihaz eğildikçe
 * gösterilen yön sapar ama kullanıcı bunu fark etmez — bu yüzden eğimi ölçüp
 * uyarıyoruz.
 */

/** Bu açının altındaki eğim kabul edilebilir sayılır. */
const FLAT_THRESHOLD_DEGREES = 25;

/** Uyarının açılıp kapanıp titremesini önlemek için çıkışta daha geniş açı. */
const RELEASE_THRESHOLD_DEGREES = 35;

/** İvmeölçer gürültülüdür; ölçümleri yumuşatıyoruz. */
const SMOOTHING = 0.2;

/** 5 Hz eğim için fazlasıyla yeterli ve pil dostu. */
const UPDATE_INTERVAL_MS = 200;

/**
 * İvme vektöründen cihazın yataydan sapmasını hesaplar.
 *
 * Cihazın z ekseni ekrandan dışarı bakar; yerçekimi vektörüyle arasındaki açı
 * doğrudan yataydan sapmayı verir. Mutlak değer kullanmak, ekran yukarı da
 * aşağı da baksa aynı sonucu üretir.
 *
 * @returns 0 = tamamen düz, 90 = dik. Ölçüm anlamsızsa null.
 */
export function tiltFromAcceleration(x: number, y: number, z: number): number | null {
  const magnitude = Math.hypot(x, y, z);
  // Serbest düşüş veya bozuk ölçüm: yönlendirme çıkarılamaz.
  if (magnitude < 0.1) return null;
  return (Math.acos(Math.min(1, Math.abs(z) / magnitude)) * 180) / Math.PI;
}

export type TiltState = {
  /** Cihazın yataydan sapması, derece. 0 = tamamen düz, 90 = dik. */
  tilt: number | null;
  /** Telefon pusula için yeterince düz mü. Ölçüm yoksa true kabul edilir. */
  isFlat: boolean;
};

export function useTilt(enabled = true): TiltState {
  const [tilt, setTilt] = useState<number | null>(null);
  const [isFlat, setIsFlat] = useState(true);

  const smoothed = useRef<number | null>(null);
  const flatRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const available = await Accelerometer.isAvailableAsync().catch(() => false);
      // İvmeölçer yoksa kullanıcıyı boşuna uyarmıyoruz; pusula yine çalışır.
      if (!available || cancelled) return;

      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const raw = tiltFromAcceleration(x, y, z);
        if (raw === null) return;

        const previous = smoothed.current;
        const next = previous === null ? raw : previous + (raw - previous) * SMOOTHING;
        smoothed.current = next;
        setTilt(next);

        const flat = flatRef.current
          ? next <= RELEASE_THRESHOLD_DEGREES
          : next <= FLAT_THRESHOLD_DEGREES;

        if (flat !== flatRef.current) {
          flatRef.current = flat;
          setIsFlat(flat);
        }
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      smoothed.current = null;
      flatRef.current = true;
    };
  }, [enabled]);

  return { tilt, isFlat };
}
