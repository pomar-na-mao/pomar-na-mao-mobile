import { images } from '@/shared/constants/images';
import { ThemedText } from '@/shared/themes/themed-text';
import React from 'react';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { styles } from './styles';

interface EmptyListProps {
  title: string;
  subtitle: string;
}

export const EmptyList: React.FC<EmptyListProps> = ({ title, subtitle }) => {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Image source={images.emptyData} style={styles.image} resizeMode="contain" />
      <ThemedText style={{ textAlign: 'center' }} type="title">
        {title}
      </ThemedText>
      <ThemedText style={{ textAlign: 'center' }} type="subtitle">
        {subtitle}
      </ThemedText>
    </ScrollView>
  );
};
