import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { isAuthenticated, logout } from '../../lib/auth';
import { TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await isAuthenticated();
      if (!ok) router.replace('/(auth)/sign-in');
    })();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { backgroundColor: '#fff' },
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace('/(auth)/sign-in');
            }}
            style={{ paddingHorizontal: 12 }}
          >
            <Ionicons name="log-out-outline" size={22} color="#111827" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: 'Topics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="websites"
        options={{
          // Hidden from tab bar but accessible via navigation
          href: null,
          title: 'Websites',
        }}
      />
      <Tabs.Screen
        name="wikipedia"
        options={{
          href: null,
          title: 'Wikipedia',
        }}
      />
    </Tabs>
  );
}
