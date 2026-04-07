import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/hooks/use-user';
import { getUserStats, type UserStats } from '@/services/api';
import { StatCard } from '@/components/stat-card';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

export default function StatsScreen() {
  const { userId, loading: userLoading } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      (async () => {
        try {
          const data = await getUserStats(userId);
          setStats(data);
        } catch (err) {
          console.error('Failed to fetch stats:', err);
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
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <ActivityIndicator size="large" color={YarnyColors.button} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {stats ? (
          <>
            <StatCard
              title="Today"
              stats={[
                { label: 'rows', value: stats.rows.today },
                { label: 'yards of yarn', value: stats.yards.used },
              ]}
            />
            <StatCard
              title="All Time"
              stats={[
                { label: 'rows', value: stats.rows.all_time.toLocaleString() },
                { label: 'yards of yarn', value: stats.yards.used.toLocaleString() },
              ]}
            />

            <View style={styles.recordCard}>
              <Text style={styles.recordTitle}>Record</Text>
              <Text style={styles.placeholderText}>Activity timeline coming soon</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noData}>No stats yet. Start a project!</Text>
        )}
      </ScrollView>
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
    padding: 16,
  },
  recordCard: {
    backgroundColor: YarnyColors.card,
    borderRadius: 12,
    padding: 16,
  },
  recordTitle: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
    marginBottom: 12,
  },
  placeholderText: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
  },
  noData: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
});
