import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

export default function HelloStylesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={24} color={YarnyColors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hello Styles</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {/* Row 1: Colors */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.cellWide, { backgroundColor: YarnyColors.background }]}>
            <Text style={styles.cellLabel}>Background</Text>
            <Text style={styles.cellHex}>#AEC9D7</Text>
          </View>
          <View style={[styles.cell, { backgroundColor: YarnyColors.card }]}>
            <Text style={[styles.cellLabel, { color: '#fff' }]}>Card</Text>
            <Text style={[styles.cellHex, { color: '#fff' }]}>#457C99</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cell, { backgroundColor: YarnyColors.button }]}>
            <Text style={[styles.cellLabel, { color: '#fff' }]}>Button</Text>
            <Text style={[styles.cellHex, { color: '#fff' }]}>#0F374E</Text>
          </View>
          <View style={[styles.cell, styles.cellWide, { backgroundColor: '#fff', borderWidth: 1, borderColor: YarnyColors.border }]}>
            <Text style={[styles.cellLabel, { color: YarnyColors.textPrimary }]}>White</Text>
            <Text style={[styles.cellHex, { color: YarnyColors.textPrimary }]}>#FFFFFF</Text>
          </View>
        </View>

        {/* Row 2: Fonts */}
        <View style={[styles.cell, styles.cellFull, { backgroundColor: YarnyColors.card }]}>
          <Text style={{ fontFamily: 'MarkoOne-Regular', fontSize: 28, color: '#fff', marginBottom: 4 }}>
            Marko One
          </Text>
          <Text style={{ fontFamily: 'MarkoOne-Regular', fontSize: 16, color: '#fff' }}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.cell, { backgroundColor: YarnyColors.button }]}>
            <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#fff' }}>
              Montserrat Regular
            </Text>
          </View>
          <View style={[styles.cell, { backgroundColor: YarnyColors.button }]}>
            <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#fff' }}>
              Montserrat SemiBold
            </Text>
          </View>
        </View>

        <View style={[styles.cell, styles.cellFull, { backgroundColor: YarnyColors.button }]}>
          <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#fff' }}>
            Montserrat Bold — ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </Text>
        </View>

        {/* Row 3: Material Icons */}
        <View style={[styles.cell, styles.cellFull, { backgroundColor: YarnyColors.card }]}>
          <Text style={[styles.cellLabel, { color: '#fff', marginBottom: 8 }]}>Material Icons</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <MaterialIcons name="favorite" size={32} color="#fff" />
              <Text style={styles.iconLabel}>favorite</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcons name="visibility" size={32} color="#fff" />
              <Text style={styles.iconLabel}>visibility</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcons name="palette" size={32} color="#fff" />
              <Text style={styles.iconLabel}>palette</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcons name="home" size={32} color="#fff" />
              <Text style={styles.iconLabel}>home</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcons name="search" size={32} color="#fff" />
              <Text style={styles.iconLabel}>search</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcons name="person" size={32} color="#fff" />
              <Text style={styles.iconLabel}>person</Text>
            </View>
          </View>
        </View>

        {/* Bento-style design label */}
        <View style={[styles.cell, styles.cellFull, { backgroundColor: YarnyColors.button }]}>
          <Text style={{ fontFamily: 'MarkoOne-Regular', fontSize: 20, color: '#fff', textAlign: 'center' }}>
            Bento-Style Design Language
          </Text>
          <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#fff', textAlign: 'center', marginTop: 4 }}>
            Cards of varying sizes arranged in a grid layout
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: YarnyColors.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: YarnyFonts.header,
    fontSize: YarnySizes.subtitle,
    color: YarnyColors.textSecondary,
  },
  grid: {
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    minHeight: 80,
  },
  cellWide: {
    flex: 2,
  },
  cellFull: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    minHeight: 80,
  },
  cellLabel: {
    fontFamily: YarnyFonts.bodySemiBold,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
  },
  cellHex: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.caption,
    color: YarnyColors.textPrimary,
    marginTop: 4,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconItem: {
    alignItems: 'center',
    gap: 4,
  },
  iconLabel: {
    fontFamily: YarnyFonts.body,
    fontSize: 11,
    color: '#fff',
  },
});
