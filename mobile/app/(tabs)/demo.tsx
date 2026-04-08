import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

export default function DemoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demo</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Implementation Prototypes</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/demo/hello-world')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="language" size={28} color={YarnyColors.textSecondary} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Hello World</Text>
            <Text style={styles.cardDesc}>Requirement 1</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/demo/hello-styles')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="palette" size={28} color={YarnyColors.textSecondary} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Hello Styles</Text>
            <Text style={styles.cardDesc}>Requirement 2</Text>
          </View>
        </TouchableOpacity>
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
    padding: 16,
  },
  subtitle: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textPrimary,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: YarnyColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: YarnyFonts.bodySemiBold,
    fontSize: YarnySizes.body,
    color: YarnyColors.textSecondary,
  },
  cardDesc: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.caption,
    color: YarnyColors.textSecondary,
    opacity: 0.8,
  },
});
