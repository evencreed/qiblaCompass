import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/ad-banner';
import { CityPicker } from '@/components/city-picker';
import { NotificationSettings } from '@/components/notification-settings';
import { Paywall } from '@/components/paywall';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocationState } from '@/lib/location-context';
import { t } from '@/lib/i18n';
import {
  formatCountdown,
  formatDate,
  formatTime,
  getSchedule,
  METHODS,
  methodLabel,
} from '@/lib/prayer-times';

/** Geri sayım dakika hassasiyetinde; saniyede bir render etmeye gerek yok. */
const TICK_MS = 15000;

export default function PrayerTimesScreen() {
  const theme = useTheme();
  const { coordinates, label, source, timeZone, method, setMethod } = useLocationState();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const schedule = useMemo(
    () =>
      coordinates
        ? getSchedule(coordinates.latitude, coordinates.longitude, method, now)
        : null,
    [coordinates, method, now],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => setPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('location.changeA11y')}
            style={({ pressed }) => [
              styles.locationChip,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <ThemedText type="smallBold">{label}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {source === 'manual' ? t('location.manual') : t('location.gps')} ·{' '}
              {t('location.change')}
            </ThemedText>
          </Pressable>

          {!schedule ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.waiting}>
              {t('times.needLocation')}
            </ThemedText>
          ) : (
            <>
              <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
                {formatDate(now, timeZone)}
              </ThemedText>

              <ThemedView type="backgroundElement" style={styles.nextCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('times.next')}
                </ThemedText>
                <ThemedText type="title" style={styles.nextName}>
                  {schedule.next.label}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.nextTime}>
                  {formatTime(schedule.next.date, timeZone)}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.countdown}>
                  {t('times.remaining', {
                    time: formatCountdown(schedule.next.date.getTime() - now.getTime()),
                  })}
                </ThemedText>
              </ThemedView>

              <View style={styles.list}>
                {schedule.entries.map((entry) => {
                  const isNext = entry.key === schedule.next.key;
                  const isPast = entry.date.getTime() <= now.getTime();
                  return (
                    <View
                      key={entry.key}
                      style={[
                        styles.row,
                        {
                          backgroundColor: isNext ? theme.backgroundSelected : 'transparent',
                        },
                      ]}>
                      <ThemedText
                        type={isNext ? 'smallBold' : 'default'}
                        themeColor={isPast && !isNext ? 'textSecondary' : 'text'}>
                        {entry.label}
                      </ThemedText>
                      <ThemedText
                        type={isNext ? 'smallBold' : 'default'}
                        themeColor={isPast && !isNext ? 'textSecondary' : 'text'}>
                        {formatTime(entry.date, timeZone)}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>

              <View style={styles.methodSection}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('times.method')}
                </ThemedText>
                <View style={styles.methodRow}>
                  {METHODS.map((option) => {
                    const selected = option === method;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setMethod(option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.methodChip,
                          {
                            backgroundColor: selected
                              ? theme.backgroundSelected
                              : theme.backgroundElement,
                            borderColor: selected ? '#3C87F7' : 'transparent',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}>
                        <ThemedText type="small">{methodLabel(option)}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('times.methodNote')}
                </ThemedText>
              </View>

              <NotificationSettings />
            </>
          )}
        </ScrollView>

        <AdBanner onRemoveAds={() => setPaywallVisible(true)} />
      </SafeAreaView>

      <CityPicker visible={pickerVisible} onClose={() => setPickerVisible(false)} />
      <Paywall visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, alignSelf: 'stretch' },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  locationChip: {
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  waiting: { textAlign: 'center', paddingVertical: Spacing.five },
  date: { textAlign: 'center', textTransform: 'capitalize' },
  nextCard: {
    alignItems: 'center',
    borderRadius: Spacing.four,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  nextName: { fontSize: 36, lineHeight: 42 },
  nextTime: { fontSize: 28, lineHeight: 36 },
  countdown: { color: '#3C87F7' },
  list: { gap: Spacing.half },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  methodSection: { gap: Spacing.two, paddingTop: Spacing.two },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  methodChip: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
