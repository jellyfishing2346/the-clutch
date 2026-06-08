import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  )
}
