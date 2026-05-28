import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { NotificationService } from '../services/notification-service';
import { SMSMonitorService } from '../services/sms-scanner';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isDark } = useTheme();

  useEffect(() => {
    NotificationService.initialize();
    SMSMonitorService.initialize();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            presentation: 'modal',
            animation: 'fade'
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
