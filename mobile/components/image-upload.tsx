import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { YarnyColors, YarnyFonts, YarnySizes } from '@/constants/theme';

interface ImageUploadProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

export function ImageUpload({ imageUri, onImageSelected }: ImageUploadProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View>
      <Text style={styles.label}>Upload image</Text>
      <TouchableOpacity style={styles.area} onPress={pickImage} activeOpacity={0.7}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: YarnyFonts.bodySemiBold,
    fontSize: YarnySizes.body,
    color: YarnyColors.textPrimary,
    marginBottom: 8,
  },
  area: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: YarnyColors.border,
    height: 160,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: YarnyColors.border,
  },
});
