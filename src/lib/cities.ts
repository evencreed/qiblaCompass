export type City = {
  name: string;
  /** Eyalet veya il kısaltması; aynı adlı şehirleri ayırt etmek için. */
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  /**
   * IANA saat dilimi. Namaz vakitleri şehrin kendi saatiyle gösterilsin diye
   * gerekli: başka bir saat dilimindeki şehri seçen kullanıcı, cihazının
   * saatine göre kaymış vakitler görmemeli.
   */
  timeZone: string;
};

const US = 'United States';
const ET = 'America/New_York';
const CT = 'America/Chicago';
const MT = 'America/Denver';
const PT = 'America/Los_Angeles';

/**
 * Şehir listesi elle konum seçmek içindir; birincil yol GPS. Liste, Müslüman
 * nüfusun yoğun olduğu metropoller önceliklendirilerek seçildi.
 */
export const CITIES: City[] = [
  // ---- United States ----
  { name: 'New York', region: 'NY', country: US, latitude: 40.7128, longitude: -74.006, timeZone: ET },
  { name: 'Los Angeles', region: 'CA', country: US, latitude: 34.0522, longitude: -118.2437, timeZone: PT },
  { name: 'Chicago', region: 'IL', country: US, latitude: 41.8781, longitude: -87.6298, timeZone: CT },
  { name: 'Houston', region: 'TX', country: US, latitude: 29.7604, longitude: -95.3698, timeZone: CT },
  { name: 'Dearborn', region: 'MI', country: US, latitude: 42.3223, longitude: -83.1763, timeZone: ET },
  { name: 'Detroit', region: 'MI', country: US, latitude: 42.3314, longitude: -83.0458, timeZone: ET },
  { name: 'Philadelphia', region: 'PA', country: US, latitude: 39.9526, longitude: -75.1652, timeZone: ET },
  { name: 'Phoenix', region: 'AZ', country: US, latitude: 33.4484, longitude: -112.074, timeZone: 'America/Phoenix' },
  { name: 'San Antonio', region: 'TX', country: US, latitude: 29.4241, longitude: -98.4936, timeZone: CT },
  { name: 'San Diego', region: 'CA', country: US, latitude: 32.7157, longitude: -117.1611, timeZone: PT },
  { name: 'Dallas', region: 'TX', country: US, latitude: 32.7767, longitude: -96.797, timeZone: CT },
  { name: 'Austin', region: 'TX', country: US, latitude: 30.2672, longitude: -97.7431, timeZone: CT },
  { name: 'Minneapolis', region: 'MN', country: US, latitude: 44.9778, longitude: -93.265, timeZone: CT },
  { name: 'Columbus', region: 'OH', country: US, latitude: 39.9612, longitude: -82.9988, timeZone: ET },
  { name: 'Cleveland', region: 'OH', country: US, latitude: 41.4993, longitude: -81.6944, timeZone: ET },
  { name: 'Seattle', region: 'WA', country: US, latitude: 47.6062, longitude: -122.3321, timeZone: PT },
  { name: 'Denver', region: 'CO', country: US, latitude: 39.7392, longitude: -104.9903, timeZone: MT },
  { name: 'Boston', region: 'MA', country: US, latitude: 42.3601, longitude: -71.0589, timeZone: ET },
  { name: 'Atlanta', region: 'GA', country: US, latitude: 33.749, longitude: -84.388, timeZone: ET },
  { name: 'Washington', region: 'DC', country: US, latitude: 38.9072, longitude: -77.0369, timeZone: ET },
  { name: 'Miami', region: 'FL', country: US, latitude: 25.7617, longitude: -80.1918, timeZone: ET },
  { name: 'Orlando', region: 'FL', country: US, latitude: 28.5383, longitude: -81.3792, timeZone: ET },
  { name: 'Tampa', region: 'FL', country: US, latitude: 27.9506, longitude: -82.4572, timeZone: ET },
  { name: 'Jacksonville', region: 'FL', country: US, latitude: 30.3322, longitude: -81.6557, timeZone: ET },
  { name: 'Nashville', region: 'TN', country: US, latitude: 36.1627, longitude: -86.7816, timeZone: CT },
  { name: 'Memphis', region: 'TN', country: US, latitude: 35.1495, longitude: -90.049, timeZone: CT },
  { name: 'Portland', region: 'OR', country: US, latitude: 45.5152, longitude: -122.6784, timeZone: PT },
  { name: 'Las Vegas', region: 'NV', country: US, latitude: 36.1699, longitude: -115.1398, timeZone: PT },
  { name: 'San Francisco', region: 'CA', country: US, latitude: 37.7749, longitude: -122.4194, timeZone: PT },
  { name: 'San Jose', region: 'CA', country: US, latitude: 37.3382, longitude: -121.8863, timeZone: PT },
  { name: 'Sacramento', region: 'CA', country: US, latitude: 38.5816, longitude: -121.4944, timeZone: PT },
  { name: 'Kansas City', region: 'MO', country: US, latitude: 39.0997, longitude: -94.5786, timeZone: CT },
  { name: 'St. Louis', region: 'MO', country: US, latitude: 38.627, longitude: -90.1994, timeZone: CT },
  { name: 'Indianapolis', region: 'IN', country: US, latitude: 39.7684, longitude: -86.1581, timeZone: ET },
  { name: 'Milwaukee', region: 'WI', country: US, latitude: 43.0389, longitude: -87.9065, timeZone: CT },
  { name: 'Baltimore', region: 'MD', country: US, latitude: 39.2904, longitude: -76.6122, timeZone: ET },
  { name: 'Charlotte', region: 'NC', country: US, latitude: 35.2271, longitude: -80.8431, timeZone: ET },
  { name: 'Raleigh', region: 'NC', country: US, latitude: 35.7796, longitude: -78.6382, timeZone: ET },
  { name: 'Pittsburgh', region: 'PA', country: US, latitude: 40.4406, longitude: -79.9959, timeZone: ET },
  { name: 'Buffalo', region: 'NY', country: US, latitude: 42.8864, longitude: -78.8784, timeZone: ET },
  { name: 'Newark', region: 'NJ', country: US, latitude: 40.7357, longitude: -74.1724, timeZone: ET },
  { name: 'Paterson', region: 'NJ', country: US, latitude: 40.9168, longitude: -74.1718, timeZone: ET },
  { name: 'Louisville', region: 'KY', country: US, latitude: 38.2527, longitude: -85.7585, timeZone: ET },
  { name: 'New Orleans', region: 'LA', country: US, latitude: 29.9511, longitude: -90.0715, timeZone: CT },
  { name: 'Salt Lake City', region: 'UT', country: US, latitude: 40.7608, longitude: -111.891, timeZone: MT },
  { name: 'Honolulu', region: 'HI', country: US, latitude: 21.3069, longitude: -157.8583, timeZone: 'Pacific/Honolulu' },
  { name: 'Anchorage', region: 'AK', country: US, latitude: 61.2181, longitude: -149.9003, timeZone: 'America/Anchorage' },

  // ---- Canada ----
  { name: 'Toronto', region: 'ON', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timeZone: ET },
  { name: 'Montreal', region: 'QC', country: 'Canada', latitude: 45.5017, longitude: -73.5673, timeZone: ET },
  { name: 'Vancouver', region: 'BC', country: 'Canada', latitude: 49.2827, longitude: -123.1207, timeZone: PT },
  { name: 'Calgary', region: 'AB', country: 'Canada', latitude: 51.0447, longitude: -114.0719, timeZone: 'America/Edmonton' },
  { name: 'Edmonton', region: 'AB', country: 'Canada', latitude: 53.5461, longitude: -113.4938, timeZone: 'America/Edmonton' },
  { name: 'Ottawa', region: 'ON', country: 'Canada', latitude: 45.4215, longitude: -75.6972, timeZone: ET },

  // ---- United Kingdom & Ireland ----
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timeZone: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426, timeZone: 'Europe/London' },
  { name: 'Leeds', country: 'United Kingdom', latitude: 53.8008, longitude: -1.5491, timeZone: 'Europe/London' },
  { name: 'Bradford', country: 'United Kingdom', latitude: 53.795, longitude: -1.7594, timeZone: 'Europe/London' },
  { name: 'Glasgow', country: 'United Kingdom', latitude: 55.8642, longitude: -4.2518, timeZone: 'Europe/London' },
  { name: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603, timeZone: 'Europe/Dublin' },

  // ---- Europe ----
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { name: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698, timeZone: 'Europe/Paris' },
  { name: 'Lyon', country: 'France', latitude: 45.764, longitude: 4.8357, timeZone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timeZone: 'Europe/Berlin' },
  { name: 'Cologne', country: 'Germany', latitude: 50.9375, longitude: 6.9603, timeZone: 'Europe/Berlin' },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, timeZone: 'Europe/Berlin' },
  { name: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.582, timeZone: 'Europe/Berlin' },
  { name: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937, timeZone: 'Europe/Berlin' },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, timeZone: 'Europe/Amsterdam' },
  { name: 'Rotterdam', country: 'Netherlands', latitude: 51.9244, longitude: 4.4777, timeZone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517, timeZone: 'Europe/Brussels' },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, timeZone: 'Europe/Vienna' },
  { name: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417, timeZone: 'Europe/Zurich' },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686, timeZone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, timeZone: 'Europe/Oslo' },
  { name: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683, timeZone: 'Europe/Copenhagen' },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, timeZone: 'Europe/Madrid' },
  { name: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686, timeZone: 'Europe/Madrid' },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, timeZone: 'Europe/Rome' },
  { name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.19, timeZone: 'Europe/Rome' },
  { name: 'Sarajevo', country: 'Bosnia and Herzegovina', latitude: 43.8563, longitude: 18.4131, timeZone: 'Europe/Sarajevo' },
  { name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173, timeZone: 'Europe/Moscow' },

  // ---- Türkiye ----
  { name: 'Istanbul', country: 'Türkiye', latitude: 41.0082, longitude: 28.9784, timeZone: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Türkiye', latitude: 39.9334, longitude: 32.8597, timeZone: 'Europe/Istanbul' },
  { name: 'Izmir', country: 'Türkiye', latitude: 38.4237, longitude: 27.1428, timeZone: 'Europe/Istanbul' },
  { name: 'Bursa', country: 'Türkiye', latitude: 40.1826, longitude: 29.0665, timeZone: 'Europe/Istanbul' },
  { name: 'Antalya', country: 'Türkiye', latitude: 36.8969, longitude: 30.7133, timeZone: 'Europe/Istanbul' },
  { name: 'Adana', country: 'Türkiye', latitude: 37.0, longitude: 35.3213, timeZone: 'Europe/Istanbul' },
  { name: 'Konya', country: 'Türkiye', latitude: 37.8746, longitude: 32.4932, timeZone: 'Europe/Istanbul' },
  { name: 'Gaziantep', country: 'Türkiye', latitude: 37.0662, longitude: 37.3833, timeZone: 'Europe/Istanbul' },

  // ---- Middle East ----
  { name: 'Makkah', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579, timeZone: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6111, timeZone: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timeZone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.4858, longitude: 39.1925, timeZone: 'Asia/Riyadh' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timeZone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timeZone: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531, timeZone: 'Asia/Qatar' },
  { name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timeZone: 'Asia/Kuwait' },
  { name: 'Manama', country: 'Bahrain', latitude: 26.2285, longitude: 50.586, timeZone: 'Asia/Bahrain' },
  { name: 'Muscat', country: 'Oman', latitude: 23.588, longitude: 58.3829, timeZone: 'Asia/Muscat' },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284, timeZone: 'Asia/Amman' },
  { name: 'Jerusalem', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timeZone: 'Asia/Jerusalem' },
  { name: 'Beirut', country: 'Lebanon', latitude: 33.8938, longitude: 35.5018, timeZone: 'Asia/Beirut' },
  { name: 'Damascus', country: 'Syria', latitude: 33.5138, longitude: 36.2765, timeZone: 'Asia/Damascus' },
  { name: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661, timeZone: 'Asia/Baghdad' },
  { name: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.389, timeZone: 'Asia/Tehran' },
  { name: 'Nicosia', country: 'Cyprus', latitude: 35.1856, longitude: 33.3823, timeZone: 'Asia/Nicosia' },

  // ---- Africa ----
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timeZone: 'Africa/Cairo' },
  { name: 'Alexandria', country: 'Egypt', latitude: 31.2001, longitude: 29.9187, timeZone: 'Africa/Cairo' },
  { name: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898, timeZone: 'Africa/Casablanca' },
  { name: 'Rabat', country: 'Morocco', latitude: 34.0209, longitude: -6.8416, timeZone: 'Africa/Casablanca' },
  { name: 'Algiers', country: 'Algeria', latitude: 36.7538, longitude: 3.0588, timeZone: 'Africa/Algiers' },
  { name: 'Tunis', country: 'Tunisia', latitude: 36.8065, longitude: 10.1815, timeZone: 'Africa/Tunis' },
  { name: 'Tripoli', country: 'Libya', latitude: 32.8872, longitude: 13.1913, timeZone: 'Africa/Tripoli' },
  { name: 'Khartoum', country: 'Sudan', latitude: 15.5007, longitude: 32.5599, timeZone: 'Africa/Khartoum' },
  { name: 'Lagos', country: 'Nigeria', latitude: 6.5244, longitude: 3.3792, timeZone: 'Africa/Lagos' },
  { name: 'Kano', country: 'Nigeria', latitude: 12.0022, longitude: 8.592, timeZone: 'Africa/Lagos' },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timeZone: 'Africa/Nairobi' },
  { name: 'Dar es Salaam', country: 'Tanzania', latitude: -6.7924, longitude: 39.2083, timeZone: 'Africa/Dar_es_Salaam' },
  { name: 'Mogadishu', country: 'Somalia', latitude: 2.0469, longitude: 45.3182, timeZone: 'Africa/Mogadishu' },
  { name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473, timeZone: 'Africa/Johannesburg' },
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241, timeZone: 'Africa/Johannesburg' },

  // ---- South & Central Asia ----
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timeZone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timeZone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timeZone: 'Asia/Karachi' },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777, timeZone: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867, timeZone: 'Asia/Kolkata' },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timeZone: 'Asia/Dhaka' },
  { name: 'Kabul', country: 'Afghanistan', latitude: 34.5553, longitude: 69.2075, timeZone: 'Asia/Kabul' },
  { name: 'Tashkent', country: 'Uzbekistan', latitude: 41.2995, longitude: 69.2401, timeZone: 'Asia/Tashkent' },
  { name: 'Almaty', country: 'Kazakhstan', latitude: 43.222, longitude: 76.8512, timeZone: 'Asia/Almaty' },
  { name: 'Baku', country: 'Azerbaijan', latitude: 40.4093, longitude: 49.8671, timeZone: 'Asia/Baku' },

  // ---- Southeast & East Asia ----
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timeZone: 'Asia/Jakarta' },
  { name: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521, timeZone: 'Asia/Jakarta' },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869, timeZone: 'Asia/Kuala_Lumpur' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timeZone: 'Asia/Singapore' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },

  // ---- Oceania ----
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timeZone: 'Australia/Melbourne' },
  { name: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605, timeZone: 'Australia/Perth' },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, timeZone: 'Pacific/Auckland' },
];

/** Listede ve başlıkta gösterilecek tam ad: "Chicago, IL" / "Cairo, Egypt". */
export function cityLabel(city: City): string {
  return city.region ? `${city.name}, ${city.region}` : `${city.name}, ${city.country}`;
}

/**
 * Aksanları ve dile özgü harfleri sadeleştirir, böylece "istanbul" yazan
 * kullanıcı "Istanbul"u, "zurich" yazan "Zurich"i bulur.
 */
export function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase('en')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

/** Şehir adı, eyalet ve ülke üzerinden arar. */
export function searchCities(query: string): City[] {
  const q = normalizeForSearch(query);
  if (!q) return CITIES;
  return CITIES.filter((city) =>
    normalizeForSearch(`${city.name} ${city.region ?? ''} ${city.country}`).includes(q),
  );
}
