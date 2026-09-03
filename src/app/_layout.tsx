// SDK 54'teki expo-router bu tema export'larını yeniden yayınlamıyor;
// altında zaten react-navigation olduğu için doğrudan oradan alınıyor.
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { initializeAds } from '@/lib/ads';
import { LocationProvider } from '@/lib/location-context';
import { NotificationProvider } from '@/lib/notifications-context';
import { PremiumProvider } from '@/lib/premium-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      // Splash zaten kapandıysa hata vermesi önemli değil.
    });
  }, []);

  useEffect(() => {
    // Onay akışı ve SDK başlatma; Expo Go'da sessizce atlanır.
    initializeAds();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PremiumProvider>
        <LocationProvider>
          {/* Hatırlatmalar konuma ve hesaplama yöntemine bağlı, bu yüzden
              LocationProvider'ın içinde. */}
          <NotificationProvider>
            <AppTabs />
          </NotificationProvider>
        </LocationProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
}
