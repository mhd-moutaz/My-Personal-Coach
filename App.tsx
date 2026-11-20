import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { FloatingTabBar } from './src/components/FloatingTabBar';
import { CoachProvider, useCoach } from './src/context/CoachContext';
import { ComingSoonScreen } from './src/screens/ComingSoonScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WorkoutsScreen } from './src/screens/WorkoutsScreen';
import { TabKey } from './src/types/coach';

function AppShell() {
  const {
    isReady,
    settings,
    palette,
    plan,
    isReeditingOnboarding,
  } = useCoach();
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  if (!isReady) {
    return (
      <View
        style={[
          styles.loadingRoot,
          { backgroundColor: palette.background },
        ]}
      >
        <ActivityIndicator size="large" color={palette.workout} />
      </View>
    );
  }

  const showOnboarding =
    !settings.onboardingCompleted || !plan || isReeditingOnboarding;

  return (
    <View style={[styles.shell, { backgroundColor: palette.background }]}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {showOnboarding ? (
        <OnboardingScreen />
      ) : (
        <View style={styles.shell}>
          {activeTab === 'home' && (
            <HomeScreen onOpenWorkouts={() => setActiveTab('workouts')} />
          )}
          {activeTab === 'workouts' && <WorkoutsScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
          {(activeTab === 'nutrition' || activeTab === 'progress') && (
            <ComingSoonScreen tab={activeTab} />
          )}

          <FloatingTabBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: '#0D0D12' }]}>
        <ActivityIndicator size="large" color="#FF5E36" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CoachProvider>
        <AppShell />
      </CoachProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
