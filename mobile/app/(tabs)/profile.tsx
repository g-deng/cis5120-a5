import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/hooks/use-user';
import { getUser, type User } from '@/services/api';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

export default function ProfileScreen() {
  const { userId, loading: userLoading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      (async () => {
        try {
          const data = await getUser(userId);
          setUser(data);
        } catch (err) {
          console.error('Failed to fetch user:', err);
        } finally {
          setLoading(false);
        }
      })();
    }, [userId])
  );

  if (userLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <ActivityIndicator size="large" color={YarnyColors.button} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username ?? 'Unknown'}</Text>
        {user?.created_at && (
          <Text style={styles.memberSince}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YarnyColors.background,
  },
  header: {
    backgroundColor: YarnyColors.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: YarnyColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.title,
    color: YarnyColors.textSecondary,
  },
  username: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textPrimary,
    marginBottom: 4,
  },
  memberSince: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
  },
});
