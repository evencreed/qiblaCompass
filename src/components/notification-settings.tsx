import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { t, type TranslationKey } from '@/lib/i18n';
import { isExpoGo } from '@/lib/native-modules';
import { SOUND_OPTIONS } from '@/lib/notification-sounds';
import { useNotifications } from '@/lib/notifications-context';
import { NOTIFIABLE_PRAYERS } from '@/lib/notifications';

/** Sunulan hatırlatma zamanları, dakika cinsinden. */
const OFFSETS = [0, 5, 10, 15, 30];

export function NotificationSettings() {
  const theme = useTheme();
  const {
    settings,
    permissionDenied,
    scheduledCount,
    setEnabled,
    togglePrayer,
    setMinutesBefore,
    setSound,
  } = useNotifications();

  const selectedSound = SOUND_OPTIONS.find((option) => option.id === settings.sound);
  // Paketlenmiş sesler Expo Go'da sessiz kalır; kullanıcı sesi duymayınca
  // bunu hata sanmasın diye açıkça yazıyoruz.
  const soundNeedsBuild = isExpoGo && selectedSound?.bundled === true;

  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('notifications.title')}
      </ThemedText>

      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={styles.rowLabel}>
          {t('notifications.enable')}
        </ThemedText>
        <Switch value={settings.enabled} onValueChange={setEnabled} />
      </View>

      {permissionDenied && (
        <View style={styles.denied}>
          <ThemedText type="small" style={{ color: '#E5484D' }}>
            {t('notifications.denied')}
          </ThemedText>
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button" hitSlop={8}>
            <ThemedText type="linkPrimary">{t('notifications.openSettings')}</ThemedText>
          </Pressable>
        </View>
      )}

      {settings.enabled && !permissionDenied && (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            {t('notifications.which')}
          </ThemedText>
          <View style={styles.chips}>
            {NOTIFIABLE_PRAYERS.map((key) => {
              const selected = settings.prayers[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => togglePrayer(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: selected ? '#3C87F7' : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {t(`prayer.${key}` as TranslationKey)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            {t('notifications.timing')}
          </ThemedText>
          <View style={styles.chips}>
            {OFFSETS.map((minutes) => {
              const selected = settings.minutesBefore === minutes;
              return (
                <Pressable
                  key={minutes}
                  onPress={() => setMinutesBefore(minutes)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: selected ? '#3C87F7' : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {minutes === 0
                      ? t('notifications.atTime')
                      : t('notifications.minutesBefore', { minutes })}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            {t('notifications.sound')}
          </ThemedText>
          <View style={styles.chips}>
            {SOUND_OPTIONS.map((option) => {
              const selected = settings.sound === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSound(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: selected ? '#3C87F7' : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {t(option.labelKey)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {soundNeedsBuild && (
            <ThemedText type="small" style={styles.warning}>
              {t('notifications.soundNeedsBuild')}
            </ThemedText>
          )}

          {scheduledCount > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('notifications.scheduled', { count: scheduledCount })}
            </ThemedText>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two, paddingTop: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  rowLabel: { flex: 1 },
  subLabel: { paddingTop: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  denied: { gap: Spacing.one, paddingHorizontal: Spacing.one },
  warning: { color: '#D4A24C' },
});
