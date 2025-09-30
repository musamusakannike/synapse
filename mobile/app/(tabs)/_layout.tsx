import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { isAuthenticated, logout } from '../../lib/auth';
import { TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../styles/theme';
import { confirmations } from '../../components/ConfirmationDialog';

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await isAuthenticated();
      if (!ok) router.replace('/(auth)/sign-in');
    })();
  }, [router]);

  const handleLogout = async () => {
    confirmations.signOut(async () => {
      await logout();
      router.replace('/(auth)/sign-in');
    });
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          paddingTop: spacing[1],
          paddingBottom: spacing[2],
          height: 85,
          ...shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: spacing[1],
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral[200],
          ...shadows.sm,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              marginRight: spacing[2],
              borderRadius: borderRadius.base,
              backgroundColor: colors.neutral[100],
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
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
