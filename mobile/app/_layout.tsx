import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MarkoOne-Regular': require('@/assets/fonts/MarkoOne-Regular.ttf'),
    'Montserrat-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('@/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-project"
          options={{
            title: 'New Project',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="project/[id]/active"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="project/[id]/details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="demo/hello-world"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="demo/hello-styles"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
