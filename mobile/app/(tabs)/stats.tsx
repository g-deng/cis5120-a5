import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/hooks/use-user';
import { getUserStats, getUserActivity, type UserStats, type ActivityEntry } from '@/services/api';
import { StatCard } from '@/components/stat-card';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function StatsScreen() {
  const { userId, loading: userLoading } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      (async () => {
        try {
          const [statsData, activityData] = await Promise.all([
            getUserStats(userId),
            getUserActivity(userId),
          ]);
          setStats(statsData);
          setActivity(activityData);
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
              <Text style={styles.recordTitle}>Recent Activity</Text>
              {activity.length === 0 ? (
                <Text style={styles.activityEmpty}>No activity yet</Text>
              ) : (
                activity.map((entry, i) => (
                  <View key={i} style={styles.activityRow}>
                    <Text style={styles.activityText}>
                      +{entry.rows_added} row{entry.rows_added !== 1 ? 's' : ''} on {entry.project_title}
                    </Text>
                    <Text style={styles.activityTime}>{formatTimeAgo(entry.logged_at)}</Text>
                  </View>
                ))
              )}
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
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  activityText: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.caption,
    color: YarnyColors.textSecondary,
    flex: 1,
  },
  activityTime: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.caption,
    color: YarnyColors.textSecondary,
    opacity: 0.7,
    marginLeft: 8,
  },
  activityEmpty: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
    opacity: 0.7,
  },
  noData: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
});
