import type { TranslationKey } from '@/lib/i18n';

export type SoundId = 'default' | 'chime' | 'silent';

export type SoundOption = {
  id: SoundId;
  labelKey: TranslationKey;
  /**
   * Android kanal kimliği. Android 8+ sesi bildirime değil kanala bağlar ve
   * bir kanalın sesi oluşturulduktan sonra değiştirilemez — bu yüzden her ses
   * seçeneğinin kendi kanalı var.
   */
  channelId: string;
  /** Android kanalına verilecek ses. null = sessiz. */
  channelSound: string | null;
  /** iOS'ta bildirim içeriğine verilecek ses. false = sessiz. */
  contentSound: boolean | string;
  /**
   * Ses uygulamayla birlikte paketleniyor mu. Paketlenmiş sesler Expo Go'da
   * çalışmaz, development build gerektirir.
   */
  bundled: boolean;
};

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'default',
    labelKey: 'sound.default',
    channelId: 'prayer-times-default',
    channelSound: 'default',
    contentSound: true,
    bundled: false,
  },
  {
    id: 'chime',
    labelKey: 'sound.chime',
    channelId: 'prayer-times-chime',
    channelSound: 'chime.wav',
    contentSound: 'chime.wav',
    bundled: true,
  },
  {
    id: 'silent',
    labelKey: 'sound.silent',
    channelId: 'prayer-times-silent',
    channelSound: null,
    contentSound: false,
    bundled: false,
  },
];

export function soundOption(id: SoundId): SoundOption {
  return SOUND_OPTIONS.find((option) => option.id === id) ?? SOUND_OPTIONS[0];
}
