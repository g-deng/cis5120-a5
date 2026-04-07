import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { YarnyColors, YarnyFonts } from '@/constants/theme';

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ percent, size = 48, strokeWidth = 4 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={YarnyColors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={YarnyColors.button}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.label, { fontSize: size * 0.22 }]}>{Math.round(percent)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    fontFamily: YarnyFonts.bodySemiBold,
    color: YarnyColors.textPrimary,
  },
});
