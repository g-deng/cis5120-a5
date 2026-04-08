import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { YarnyColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: YarnyColors.button,
        tabBarInactiveTintColor: YarnyColors.border,
        tabBarStyle: {
          backgroundColor: YarnyColors.background,
          borderTopColor: YarnyColors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="demo"
        options={{
          title: 'Demo',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="science" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
