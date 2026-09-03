import { Coordinates, Qibla } from 'adhan';

import { locale, t, usesMiles } from '@/lib/i18n';

/** Kâbe'nin koordinatları (Mescid-i Haram, Mekke). */
export const KAABA = { latitude: 21.4224779, longitude: 39.8251832 } as const;

const EARTH_RADIUS_KM = 6371;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Açıyı 0–360 aralığına indirger. */
export function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * İki yön arasındaki en kısa farkı -180..180 aralığında verir.
 * Pozitif değer `to` yönünün `from`'a göre saat yönünde olduğu anlamına gelir.
 */
export function signedAngleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/**
 * Bulunulan noktadan Kâbe'ye bakan büyük daire açısı (gerçek kuzeye göre, derece).
 * Hesabı adhan kütüphanesi yapar; burada yalnızca 0–360'a normalize ediyoruz.
 */
export function qiblaBearing(latitude: number, longitude: number): number {
  return normalizeAngle(Qibla(new Coordinates(latitude, longitude)));
}

/** Kâbe'ye kuş uçuşu mesafe (kilometre), haversine ile. */
export function distanceToKaabaKm(latitude: number, longitude: number): number {
  const dLat = toRadians(KAABA.latitude - latitude);
  const dLon = toRadians(KAABA.longitude - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latitude)) * Math.cos(toRadians(KAABA.latitude)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const POINTS = [
  'compass.N',
  'compass.NE',
  'compass.E',
  'compass.SE',
  'compass.S',
  'compass.SW',
  'compass.W',
  'compass.NW',
] as const;

/** Dereceyi yerelleştirilmiş yön kısaltmasına çevirir (N, NE, E, ...). */
export function compassPoint(degrees: number): string {
  return t(POINTS[Math.round(normalizeAngle(degrees) / 45) % 8]);
}

export type LatLng = { latitude: number; longitude: number };

const toDegrees = (rad: number) => (rad * 180) / Math.PI;

/**
 * Bulunulan noktadan Kâbe'ye giden büyük daire yolunu ara noktalara böler.
 *
 * Haritada iki uzak nokta arasına düz çizgi çekmek yanlış olur: Mercator
 * projeksiyonunda düz çizgi büyük daire değildir, dolayısıyla gerçek kıble
 * yönünü göstermez. Küresel doğrusal interpolasyonla ara noktaları
 * hesaplayıp çokgen çizgi olarak veriyoruz — bu, harita sağlayıcısından
 * bağımsız olarak doğru sonuç verir.
 *
 * Dönüş değeri parçalar dizisidir: 180. meridyeni geçen bir yol tek parça
 * çizilirse harita boydan boya yanlış bir çizgiyle kesilir, o yüzden geçiş
 * noktasında yol bölünür.
 */
export function greatCirclePath(
  latitude: number,
  longitude: number,
  segments = 128,
): LatLng[][] {
  const φ1 = toRadians(latitude);
  const λ1 = toRadians(longitude);
  const φ2 = toRadians(KAABA.latitude);
  const λ2 = toRadians(KAABA.longitude);

  const δ =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
      ),
    );

  // Kâbe'nin üstündeyken çizilecek bir yol yok.
  if (δ < 1e-9) return [];

  const points: LatLng[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const a = Math.sin((1 - f) * δ) / Math.sin(δ);
    const b = Math.sin(f * δ) / Math.sin(δ);

    const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
    const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
    const z = a * Math.sin(φ1) + b * Math.sin(φ2);

    points.push({
      latitude: toDegrees(Math.atan2(z, Math.hypot(x, y))),
      longitude: toDegrees(Math.atan2(y, x)),
    });
  }

  // Ardışık noktalar arasında 180°'den büyük boylam sıçraması varsa
  // meridyen geçilmiştir; orada yolu böl.
  const parts: LatLng[][] = [];
  let current: LatLng[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i].longitude - points[i - 1].longitude) > 180) {
      parts.push(current);
      current = [];
    }
    current.push(points[i]);
  }
  parts.push(current);

  return parts.filter((part) => part.length > 1);
}

const KM_PER_MILE = 1.609344;

/**
 * Mesafeyi kullanıcının bölgesine uygun birimde ve yerel sayı biçiminde verir.
 * ABD ağırlıklı bir kitle hedeflendiği için mil desteği şart.
 */
export function formatDistance(kilometers: number): string {
  const value = usesMiles ? kilometers / KM_PER_MILE : kilometers;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    Math.round(value),
  );
  return t(usesMiles ? 'unit.mi' : 'unit.km', { value: formatted });
}

/** Ekranda gösterilecek derece metni: "151°". */
export function formatDegrees(degrees: number): string {
  return `${Math.round(normalizeAngle(degrees))}°`;
}
