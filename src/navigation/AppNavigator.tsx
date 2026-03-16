// src/navigation/AppNavigator.tsx
import React, { useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import HistoryScreen from '../screens/HistoryScreen';

// Stack navigator — Auth ekranları için
const Stack = createNativeStackNavigator();

// Tab navigator — Giriş sonrası ekranlar için
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>{color === '#2563eb' ? '🏠' : '🏠'}</Text>,
        }}
      />
      <Tab.Screen
        name="Ölçüm Ekle"
        component={AddMeasurementScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Geçmiş"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

type Props = {
  session: Session | null;
  setIgnore: (val: boolean) => void;
};

export default function AppNavigator({ session, setIgnore }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            children={(props) => (
              <RegisterScreen {...props} setIgnore={setIgnore} />
            )}
          />
        </>
      )}
    </Stack.Navigator>
  );
}