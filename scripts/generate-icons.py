"""Uygulama ikonlarını üretir.

Tasarım, uygulamanın kendi pusula kadranından türetildi: koyu mürekkep zemin,
Kâbe'yi gösteren altın iğne ve ince derece çentikleri. Kategoride yaygın olan
hilal ve cami siluetlerinden kaçınıldı; mağaza aramasında hepsi birbirine
benzediği için ayırt edici olmuyorlar.

Çalıştırma:
    python scripts/generate-icons.py

Renk veya açı değiştirmek isterseniz aşağıdaki sabitleri düzenleyip betiği
yeniden çalıştırmanız yeterli.
"""

import math
import os

from PIL import Image, ImageDraw

# --- tasarım sabitleri ---------------------------------------------------

INK = (14, 21, 25, 255)          # zemin: hafif mavi-yeşile çalan koyu mürekkep
GOLD = (212, 162, 76, 255)       # kıble oku; uygulamadaki kadranla aynı altın
GOLD_TIP = (233, 190, 112, 255)  # okun ucunda hafif açılma
STEEL = (94, 110, 118, 255)      # iğnenin karşı ucu
TICK_MAJOR = (196, 208, 214, 255)
TICK_MINOR = (110, 126, 134, 255)
# Halka: şeffaflık düşük tutuluyor. Daha saydam bir altın, açılış ekranının
# büyük ölçeğinde donuk bir kahverengiye dönüşüyordu.
RING = (212, 162, 76, 190)

# İğnenin dikeyden sapması. Tam yukarı "kuzey" gibi okunurdu; hafif eğim
# bunun bir yön (bearing) olduğunu anlatıyor.
NEEDLE_ANGLE = 34

# Kenar yumuşatma için yüksek çözünürlükte çizip küçültüyoruz.
SUPERSAMPLE = 4

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')


def _point(cx, cy, radius, angle_deg):
    """Merkezden verilen açı ve yarıçaptaki nokta. 0° yukarı, saat yönünde."""
    rad = math.radians(angle_deg)
    return (cx + radius * math.sin(rad), cy - radius * math.cos(rad))


def render(size, *, background=True, content=0.78, monochrome=False):
    """Tek bir ikon görüntüsü üretir.

    :param background: Kare zemin doldurulsun mu. iOS ikonu şeffaflık kabul
        etmez; Android ön plan katmanı ise şeffaf olmalıdır.
    :param content: Kadranın kısa kenara oranı. Android uyarlanabilir ikonda
        içerik ortadaki güvenli dairede kalmalı, o yüzden küçültülür.
    :param monochrome: Tek renk siluet (Android temalı ikon) üretir.
    """
    work = size * SUPERSAMPLE
    image = Image.new('RGBA', (work, work), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    if background:
        draw.rectangle([0, 0, work, work], fill=INK)

    center = work / 2
    radius = work / 2 * content

    solid = (255, 255, 255, 255)
    tick_major = solid if monochrome else TICK_MAJOR
    tick_minor = (255, 255, 255, 150) if monochrome else TICK_MINOR
    needle_head = solid if monochrome else GOLD
    needle_tail = (255, 255, 255, 130) if monochrome else STEEL

    # Dış halka. Kalın tutuluyor: ana ekranda ikon 60 piksele kadar
    # küçülüyor ve ince çizgiler o boyutta kayboluyor.
    ring_width = max(2, int(work * 0.022))
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        outline=(255, 255, 255, 210) if monochrome else RING,
        width=ring_width,
    )

    # Yalnızca dört ana yön çentiği. Derece çentiklerinin tamamı küçük
    # boyutta gri bir bulanıklığa dönüşüyordu.
    for angle in (0, 90, 180, 270):
        length = radius * 0.16
        width = max(3, int(work * 0.026))
        start = _point(center, center, radius * 0.86, angle)
        end = _point(center, center, radius * 0.86 - length, angle)
        draw.line([start, end], fill=tick_major, width=width)
    del tick_minor

    # Pusula iğnesi. Kadranın büyük kısmını kaplıyor ki küçük boyutta da
    # ilk görülen şey yön olsun.
    shoulder = radius * 0.20
    tip = _point(center, center, radius * 0.80, NEEDLE_ANGLE)
    left = _point(center, center, shoulder, NEEDLE_ANGLE - 90)
    right = _point(center, center, shoulder, NEEDLE_ANGLE + 90)
    tail = _point(center, center, radius * 0.46, NEEDLE_ANGLE + 180)

    draw.polygon([left, tail, right], fill=needle_tail)

    if monochrome:
        draw.polygon([left, tip, right], fill=needle_head)
    else:
        # Uzun eksen boyunca iki ton: klasik pusula iğnesine hacim veriyor
        # ve tek düz üçgenden ayırıyor.
        draw.polygon([left, tip, right], fill=GOLD)
        axis_base = _point(center, center, 0, NEEDLE_ANGLE)
        draw.polygon([axis_base, tip, right], fill=GOLD_TIP)

    # İğnenin gösterdiği yönde, halkanın üzerinde Kâbe işareti. İkonu genel
    # bir pusuladan ayıran tek öğe bu: mağaza aramasında yan yana duran
    # pusula ikonları arasında ne olduğunu anlatıyor. Küçük boyutta altın
    # bir noktaya dönüşür, o hâliyle bile hedefi işaret etmeyi sürdürür.
    marker = radius * 0.115
    mx, my = _point(center, center, radius, NEEDLE_ANGLE)
    # Düz dolu küp: küçük boyutta bozulmadan kalan tek biçim. Kisve kuşağı
    # denendi ama kareyi iki çubuğa bölüp okunaksızlaştırdı.
    draw.rectangle(
        [mx - marker, my - marker, mx + marker, my + marker],
        fill=solid if monochrome else GOLD,
    )

    # Merkez göbeği
    hub = radius * 0.10
    draw.ellipse(
        [center - hub, center - hub, center + hub, center + hub],
        fill=solid if monochrome else INK,
        outline=None if monochrome else GOLD,
        width=max(2, int(work * 0.012)),
    )

    return image.resize((size, size), Image.LANCZOS)


def save(image, name):
    path = os.path.normpath(os.path.join(OUT_DIR, name))
    image.save(path)
    print(f'{name:34} {image.size[0]}x{image.size[1]}')


def main():
    # iOS ve mağaza ikonu: şeffaflık yok, köşeleri sistem yuvarlar
    icon = render(1024, background=True, content=0.86).convert('RGB').convert('RGBA')
    save(icon, 'icon.png')

    # Android uyarlanabilir ikon: içerik ortadaki güvenli dairede (108 dp'nin
    # 66 dp'si, yani %61) kalmalı, dışı cihaz maskesine göre kırpılır. Kâbe
    # işareti halkanın dışına taştığı için oran buna göre hesaplandı:
    # 0.54 * 1.115 ≈ 0.60 < 0.61.
    save(render(1024, background=False, content=0.54), 'android-icon-foreground.png')

    background = Image.new('RGBA', (1024, 1024), INK)
    save(background, 'android-icon-background.png')

    save(render(1024, background=False, content=0.54, monochrome=True),
         'android-icon-monochrome.png')

    # Açılış ekranı: şeffaf zemin, arkasına app.json'daki renk gelir
    save(render(1024, background=False, content=0.86), 'splash-icon.png')

    save(render(196, background=True, content=0.86), "favicon.png")


if __name__ == '__main__':
    main()
