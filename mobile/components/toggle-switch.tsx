import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
}

export function ToggleSwitch({ value, onToggle }: ToggleSwitchProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, !value && styles.activeLabel]}>Private</Text>
      <TouchableOpacity
        style={styles.track}
        onPress={() => onToggle(!value)}
        activeOpacity={0.8}
      >
        <View style={[styles.thumb, value && styles.thumbRight]} />
      </TouchableOpacity>
      <Text style={[styles.label, value && styles.activeLabel]}>Public</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  label: {
    fontFamily: YarnyFonts.body,
    fontSize: YarnySizes.body,
    color: YarnyColors.border,
  },
  activeLabel: {
    color: YarnyColors.textPrimary,
    fontFamily: YarnyFonts.bodySemiBold,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: YarnyColors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: YarnyColors.button,
  },
  thumbRight: {
    alignSelf: 'flex-end',
  },
});
