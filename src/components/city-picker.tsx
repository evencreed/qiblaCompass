import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cityLabel, searchCities, type City } from '@/lib/cities';
import { t } from '@/lib/i18n';
import { useLocationState } from '@/lib/location-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CityPicker({ visible, onClose }: Props) {
  const theme = useTheme();
  const { selectCity, refreshGps, source, label } = useLocationState();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCities(query), [query]);

  const choose = (city: City) => {
    selectCity(city);
    setQuery('');
    onClose();
  };

  const backToGps = async () => {
    onClose();
    setQuery('');
    await refreshGps();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <ThemedText type="subtitle">{t('location.title')}</ThemedText>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
              <ThemedText type="linkPrimary">{t('common.close')}</ThemedText>
            </Pressable>
          </View>

          <Pressable
            onPress={backToGps}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.gpsRow,
              {
                backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                borderColor: source === 'gps' ? '#3C87F7' : 'transparent',
              },
            ]}>
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{t('location.useAutomatic')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {source === 'gps' ? t('location.now', { name: label }) : t('location.detect')}
              </ThemedText>
            </View>
            {source === 'gps' && <ThemedText style={styles.check}>✓</ThemedText>}
          </Pressable>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('location.search')}
            placeholderTextColor={theme.textSecondary}
            autoCorrect={false}
            style={[
              styles.search,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
          />

          <FlatList
            data={results}
            keyExtractor={(city) => `${city.name}-${city.latitude}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {t('location.noResults', { query })}
              </ThemedText>
            }
            renderItem={({ item }) => {
              const selected = source === 'manual' && cityLabel(item) === label;
              return (
                <Pressable
                  onPress={() => choose(item)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.cityRow,
                    pressed && { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <View style={styles.rowText}>
                    <ThemedText>{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.region ? `${item.region}, ${item.country}` : item.country}
                    </ThemedText>
                  </View>
                  {selected && <ThemedText style={styles.check}>✓</ThemedText>}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, gap: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  search: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  list: { paddingBottom: Spacing.six },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  rowText: { flex: 1, gap: Spacing.half },
  check: { color: '#3C87F7', fontSize: 18, fontWeight: '700' },
  empty: { textAlign: 'center', paddingVertical: Spacing.five },
});
