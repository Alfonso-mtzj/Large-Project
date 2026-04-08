import React from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  CrimsonText_400Regular,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import { COLORS, FONTS } from '../skilltree-shared/theme';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a1a' },
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 220, 80, 0.2)',
        },
        headerTintColor: COLORS.primary.gold,
        headerTitleStyle: {
          fontFamily: FONTS.decorative,
          fontSize: 18,
          fontWeight: '700',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { token, loading } = useAuth();

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {token ? <DashboardStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function AppContent() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    CrimsonText_400Regular,
    CrimsonText_600SemiBold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

export default function App() {
  return <AppContent />;
}
