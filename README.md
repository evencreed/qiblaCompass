# Qibla Compass

Konuma göre kıble yönünü gösteren ve namaz vakitlerini hesaplayan Expo (React Native)
uygulaması. Android ve iOS'ta çalışır. Arayüz dili İngilizce, hedef pazar ABD ve
dünya geneli.

## Çalıştırma

```bash
npm install
npx expo start
```

Terminaldeki QR kodu telefondaki **Expo Go** ile okutun. Pusula için gerçek cihaz
gerekir — emülatörde manyetometre yoktur.

> Expo Go, App Store'da SDK 54'te kilitli olduğu için proje bilinçli olarak SDK 54'e
> sabitlendi. Ayrıntı için [AGENTS.md](AGENTS.md).

## Ekranlar

- **Qibla** — dönen pusula kadranı, Kâbe'yi gösteren ok, derece bilgisi, "turn right
  X°" yönlendirmesi ve hizalandığında titreşim.
- **Map** — konumunuz ve Kâbe harita üzerinde, aralarında kıble yönünü gösteren
  büyük daire çizgisi. "Nearby" görünümü sokak ölçeğinde, "Full route" tüm yolu
  gösterir.
- **Prayer Times** — günün altı vakti, sonraki vakte geri sayım, hesaplama yöntemi
  seçimi, vakit hatırlatmaları ve altta reklam banner'ı.

### Harita neden büyük daire çiziyor

Mercator projeksiyonunda iki nokta arasındaki **düz çizgi büyük daire değildir**;
haritaya düz çizgi çekmek yanlış bir kıble yönü gösterirdi.
[`greatCirclePath`](src/lib/qibla.ts) küresel doğrusal interpolasyonla ara noktaları
hesaplıyor, böylece sonuç harita sağlayıcısından bağımsız olarak doğru oluyor. Yolun
başlangıç açısının kıble açısına eşit olduğu testlerle doğrulandı. 180. meridyeni
geçen yollar (Honolulu, Fiji gibi) haritayı boydan boya kesmesin diye parçalara
bölünüyor.

Haritanın asıl faydası kapalı alanda: pusula manyetik parazitten güvenilmezken bir
duvarı veya sokağı çizgiye göre referans alabilirsiniz.

> **Android yayın derlemesi için Google Maps API anahtarı gerekiyor.** Expo Go'da
> harita çalışır çünkü Expo Go kendi anahtarını kullanır; bağımsız Android
> derlemesinde anahtar yoksa harita boş görünür. `app.json` içine eklenmeli:
> `android.config.googleMaps.apiKey`. iOS'ta Apple Maps kullanıldığı için anahtar
> gerekmez.

Konum çipine dokunarak GPS ile elle şehir seçimi arasında geçiş yapılır. Seçim ve
hesaplama yöntemi cihazda saklanır.

## Konum

Birincil yol GPS. Koordinat alındıktan sonra `Location.reverseGeocodeAsync` ile şehir
adı çözülüp başlıkta "Chicago, IL" biçiminde gösterilir. Ters coğrafi kodlama yalnızca
etiket içindir — kıble ve vakitler doğrudan koordinattan hesaplanır, dolayısıyla bu
adım başarısız olsa da uygulama tam çalışır.

Elle seçim için dünya genelinden ~140 şehir var; ABD metropolleri ve Müslüman nüfusun
yoğun olduğu şehirler öncelikli. Her şehir kendi IANA saat dilimini taşır, böylece
başka bir saat dilimindeki şehri seçen kullanıcı kaymış vakit görmez.

## Yerelleştirme

[`src/lib/i18n.ts`](src/lib/i18n.ts) içinde basit bir çeviri katmanı var; ek bağımlılık
kullanmıyor. İngilizce kaynak dil, cihaz dili Türkçeyse Türkçe gösterilir.
`Record<TranslationKey, string>` tipi sayesinde **eksik çeviri derleme hatası verir**,
sessizce İngilizce görünmez.

Cihaz yereline göre otomatik uyarlananlar:

| Ne | Nasıl |
| --- | --- |
| Saat biçimi | `getCalendars()[0].uses24hourClock` — ABD'de 12 saat, Türkiye'de 24 |
| Mesafe birimi | ABD, İngiltere, Liberya, Myanmar'da mil; diğer yerlerde kilometre |
| Hesaplama yöntemi | Ülkeye göre varsayılan: ABD/Kanada → ISNA, TR → Diyanet, SA → Ümmü'l-Kura, PK/IN/BD → Karaçi, diğer → Dünya İslam Birliği |

## Doğruluk üzerine notlar

1. **Gerçek kuzey — manyetik kuzey.** Manyetometre manyetik kuzeyi ölçer; kıble açısı
   ise coğrafi kuzeye göredir. `Location.watchHeadingAsync` konum izni verildiğinde
   `trueHeading` döndürerek bu düzeltmeyi yapar.
2. **iOS izin sırası.** `watchDeviceHeading` native tarafta izin yoksa exception
   fırlatır. Bu yüzden pusula aboneliği `useHeading(hasLocationPermission)` ile izne
   bağlı; izinden önce başlatmak sensörü hatalı biçimde "yok" gösterir.
3. **Sensör kalibrasyonu.** `accuracy` (0–3) değeri 2'nin altına düştüğünde kullanıcıya
   8 çizme uyarısı gösterilir.
4. **Cihaz eğimi.** Pusula yalnızca telefon yere paralelken doğrudur; eğildikçe
   gösterilen yön sapar ama kullanıcı bunu fark etmez. [`use-tilt`](src/hooks/use-tilt.ts)
   ivmeölçerle eğimi ölçer; 25°'yi aşınca kadran soluklaşır, uyarı çıkar ve
   **hizalanma titreşimi kilitlenir** — eğik telefonda "kıbleyi buldunuz" demek
   yanlış yönü onaylamak olurdu. Histerezis (çıkışta 35°) uyarının titremesini önler.

## Vakit hatırlatmaları

`expo-notifications` ile yerel bildirim; Expo Go'da çalışır, development build
gerekmez. Hangi vakitlerin açık olduğu ve kaç dakika önce hatırlatılacağı (0–30 dk)
ayarlanabilir, tercihler cihazda saklanır.

Planlama [`notifications.ts`](src/lib/notifications.ts) içinde ve iki kısıtı gözetiyor:

- **iOS aynı anda en fazla 64 bekleyen bildirime izin verir.** 5 vakit × 7 gün = 35
  bu sınırın altında kalır ve kullanıcı uygulamayı bir hafta açmasa bile
  hatırlatmalar sürer.
- **Konum veya yöntem değişince tüm kuyruk silinip yeniden kuruluyor.** Aksi halde
  eski şehre ait yanlış vakitler bildirim olarak gelirdi. Uygulama öne geldiğinde de
  yeniden planlanır, böylece bir haftalık pencere kayar.

Güneş bir namaz vakti olmadığı için hatırlatma listesinde yer almaz.

### Bildirim sesi

Üç seçenek var: sistem sesi, uygulamanın kendi çan sesi, ve sessiz. Seçim
yapıldığı anda ses bir kez çalınıyor — kullanıcının duymadan seçmesini önlemek
için.

Android'de bu, göründüğünden karmaşık: **Android 8+ sesi bildirime değil kanala
bağlar ve bir kanalın sesi oluşturulduktan sonra değiştirilemez.** Bu yüzden
[`notification-sounds.ts`](src/lib/notification-sounds.ts) her ses için ayrı bir
kanal tanımlıyor ve planlama sırasında kanal değiştiriliyor. iOS'ta ses doğrudan
bildirim içeriğine yazılıyor.

Çan sesi [`scripts/generate-sounds.py`](scripts/generate-sounds.py) ile üretiliyor —
birkaç harmoniğin üstel sönümü. Paketlenmiş bir varlık olduğu için **Expo Go'da
sessiz kalır**, development veya mağaza derlemesinde çalar; arayüz bunu kullanıcıya
açıkça söylüyor.

Ezan kaydı eklemek isterseniz: telif açısından uygun bir `.wav` dosyasını
`assets/sounds/` altına koyun, `app.json`'daki `expo-notifications` eklentisinin
`sounds` dizisine ekleyin ve `SOUND_OPTIONS`'a bir giriş yazın. Ezan sesi bilinçli
olarak üretilmedi; doğru kayıt seçimi ve lisansı içerik kararıdır.

Kıble açısı ve namaz vakitleri [adhan](https://github.com/batoulapps/adhan-js) ile
hesaplanır; internet gerekmez.

## Gelir modeli

Vakitler ekranının altında bir AdMob banner'ı var; abonelik bunu kaldırıyor. **Kıble
ekranında reklam yok** ve hiçbir dini işlev ödeme duvarının arkasında değil.

### Expo Go ile çalışmaz

`react-native-google-mobile-ads` ve `react-native-purchases` native kod içerir, Expo Go
bunları barındırmaz. Her ikisi de [`src/lib/native-modules.ts`](src/lib/native-modules.ts)
üzerinden koşullu yükleniyor: Expo Go'da banner ve satın alma sessizce devre dışı kalır,
uygulamanın geri kalanı normal çalışır. Test için development build gerekir:

```bash
eas build --profile development --platform android
```

Android'de ücretli hesap gerekmez. iOS development build'i gerçek cihaza kurmak Apple
Developer Program üyeliği ister.

### Yapılandırma

Anahtarlar `app.json` içindeki `extra` bloğunda; boş bırakıldığında abonelik akışı devre
dışı kalır ve reklamlar Google'ın test birimini kullanır.

| Alan | Nereden alınır |
| --- | --- |
| `revenueCatIos` / `revenueCatAndroid` | RevenueCat panosu → API keys (genel anahtar) |
| `bannerAdUnitIos` / `bannerAdUnitAndroid` | AdMob → Ad units |
| Plugin içindeki `androidAppId` / `iosAppId` | AdMob → App settings |

RevenueCat panosunda `reklamsiz` adında bir entitlement tanımlanmalı; kod abonelik
durumunu ürün kimliklerine değil bu hakka bakarak belirliyor.

> Geliştirme sırasında Google'ın test reklam birimleri kullanılıyor. Gerçek reklam
> birimiyle test etmek AdMob politikasının ihlalidir ve hesabın kapatılmasına yol açar.

### Yayından önce yapılacaklar

- [`src/components/paywall.tsx`](src/components/paywall.tsx) içindeki `TERMS_URL` ve
  `PRIVACY_URL` gerçek adreslerle değiştirilmeli — Apple abonelik ekranında bu
  bağlantıları şart koşuyor.
- Mağaza gizlilik beyanları güncellenmeli: AdMob cihaz tanımlayıcısı topluyor.
- Play Console'da "Reklam içerir" işaretlenmeli.
- `app.json` içindeki `slug` hâlâ `mobil-uygulama`; bundle ID belirlenirken düzeltilmeli.

## Proje yapısı

| Yol | İçerik |
| --- | --- |
| `src/app/index.tsx` | Kıble pusulası ekranı |
| `src/app/map.tsx` | Harita ekranı |
| `src/app/times.tsx` | Namaz vakitleri ekranı |
| `src/lib/i18n.ts` | Çeviriler ve yerel ayara bağlı biçimlendirme |
| `src/lib/qibla.ts` | Kıble açısı, mesafe ve açı yardımcıları |
| `src/lib/prayer-times.ts` | Vakit hesabı, yöntemler, saat dilimi |
| `src/lib/cities.ts` | Dünya geneli şehir listesi |
| `src/lib/location-context.tsx` | Konum kaynağı, ters coğrafi kodlama, tercihler |
| `src/lib/premium-context.tsx` | RevenueCat abonelik durumu |
| `src/lib/ads.ts` · `native-modules.ts` | Reklam SDK'sı ve ortam algılama |
| `src/lib/notifications.ts` | Vakit hatırlatmalarının planlanması |
| `src/lib/notification-sounds.ts` | Bildirim sesi seçenekleri ve Android kanalları |
| `scripts/generate-icons.py` · `generate-sounds.py` | İkon ve zil sesi üreticileri |
| `src/hooks/use-heading.ts` | Pusula aboneliği ve yumuşatma |
| `src/hooks/use-tilt.ts` | Cihaz eğimi ölçümü |
| `src/components/compass-dial.tsx` | SVG pusula kadranı |

## Kontroller

```bash
npx tsc --noEmit          # tip kontrolü
npx expo lint             # lint
npx expo-doctor@latest    # bağımlılık ve yapılandırma denetimi
```
