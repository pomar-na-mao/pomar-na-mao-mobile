import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { AnimatedTabButton } from '@/ui/shared/components/AnimatedTabButton';
import { HapticTab } from '@/ui/shared/components/HapticTab';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 0.3,
          borderTopColor: Colors[colorScheme ?? 'light'].line,
          elevation: 0,
          shadowOpacity: 0,
          marginBottom: 5,
          paddingTop: 12,
          paddingBottom: 18,
          height: 120,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Feather size={28} name="home" color={color} />,
          tabBarButton: (props) => <AnimatedTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="my-farm"
        options={{
          title: 'Minha Fazenda',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="house-damage" color={color} />,
          tabBarButton: (props) => <AnimatedTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather size={28} name="user" color={color} />,
          tabBarButton: (props) => <AnimatedTabButton {...props} />,
        }}
      />
    </Tabs>
  );
}
