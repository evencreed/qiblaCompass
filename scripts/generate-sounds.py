"""Bildirim sesi üretir.

Uygulamanın kendi zil sesi. Sistem sesinden ayrışması ama dikkat dağıtmaması
için sade bir çan tonu: birkaç harmoniğin üst üste binmesi ve üstel sönüm.

Ezan sesi kasıtlı olarak üretilmiyor. Ezan kaydı eklemek isterseniz telif
açısından uygun bir kayıt bulup `assets/sounds/` altına .wav olarak koyun ve
app.json'daki expo-notifications eklentisinin `sounds` dizisine ekleyin.

Çalıştırma:
    python scripts/generate-sounds.py
"""

import math
import os
import struct
import wave

SAMPLE_RATE = 44100
DURATION = 1.5
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')

# Çan tonu: temel frekans ve üstüne binen harmonikler. Oranlar tam katlar
# değil; gerçek çanlarda da böyle ve bu, sesi elektronik bip'ten ayırıyor.
PARTIALS = [
    (587.33, 1.00, 0.55),   # D5  — temel
    (880.00, 0.55, 0.40),   # A5
    (1174.66, 0.32, 0.28),  # D6
    (1567.98, 0.16, 0.18),  # G6
]


def render():
    frames = bytearray()
    total = int(SAMPLE_RATE * DURATION)

    for index in range(total):
        t = index / SAMPLE_RATE
        value = 0.0
        for frequency, amplitude, decay in PARTIALS:
            value += amplitude * math.exp(-t / decay) * math.sin(2 * math.pi * frequency * t)

        # Başlangıçtaki tık sesini önlemek için çok kısa bir yumuşak giriş
        value *= min(1.0, t / 0.005)

        # Sondaki tık sesini önlemek için son 120 ms'de yumuşak çıkış
        remaining = DURATION - t
        if remaining < 0.12:
            value *= remaining / 0.12

        # Toplam genlik 1'i aşabilir; normalize edip kırpılmayı önlüyoruz
        sample = max(-1.0, min(1.0, value / 2.05))
        frames += struct.pack('<h', int(sample * 32767))

    return bytes(frames)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.normpath(os.path.join(OUT_DIR, 'chime.wav'))

    # Android ve iOS için 16-bit PCM mono WAV; dokümanın önerdiği biçim.
    with wave.open(path, 'wb') as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(render())

    print(f'chime.wav  {os.path.getsize(path) / 1024:.0f} KB  {DURATION}s  {SAMPLE_RATE} Hz mono')


if __name__ == '__main__':
    main()
