import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { t } from '@/lib/i18n';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      labelStyle={{ selected: { color: colors.text } }}>
      {/* iOS SF Symbol kullanır; Android'de karşılığı olmadığı için PNG veriliyor. */}
      <NativeTabs.Trigger name="index">
        <Label>{t('tab.qibla')}</Label>
        <Icon
          sf="location.north.line.fill"
          androidSrc={require('@/assets/images/tabIcons/home.png')}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <Label>{t('tab.map')}</Label>
        <Icon sf="map.fill" androidSrc={require('@/assets/images/tabIcons/map.png')} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="times">
        <Label>{t('tab.times')}</Label>
        <Icon sf="clock.fill" androidSrc={require('@/assets/images/tabIcons/explore.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
