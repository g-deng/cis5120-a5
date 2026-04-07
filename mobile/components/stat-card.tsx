import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

interface StatCardProps {
  title: string;
  stats: { label: string; value: string | number }[];
}

export function StatCard({ title, stats }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {stats.map((stat, i) => (
        <Text key={i} style={styles.stat}>
          {stat.value} {stat.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: YarnyColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
    marginBottom: 8,
  },
  stat: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
    lineHeight: 26,
  },
});
