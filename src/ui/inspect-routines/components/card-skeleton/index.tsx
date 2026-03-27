import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export const CardSkeleton: React.FC = () => {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: Colors[theme].background }]}>
        {/* Left Side */}
        <View style={styles.leftSideContainer}>
          {/* Título da planta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={[styles.textPlaceholder, { backgroundColor: Colors[theme].grey, width: 80, height: 18 }]} />
            <View style={{ width: 8 }} />
            <View style={[styles.textPlaceholder, { backgroundColor: Colors[theme].grey, width: 100, height: 18 }]} />
          </View>

          {/* Distance */}
          <View style={styles.infoContainer}>
            <View style={[styles.circlePlaceholder, { backgroundColor: Colors[theme].grey }]} />
            <View style={styles.infoItemContainer}>
              <View style={[styles.textPlaceholderSmall, { backgroundColor: Colors[theme].grey, width: 120 }]} />
              <View style={[styles.textPlaceholderExtraSmall, { backgroundColor: Colors[theme].grey, width: 40 }]} />
            </View>
          </View>

          {/* Occurrences */}
          <View style={styles.infoContainer}>
            <View style={[styles.circlePlaceholder, { backgroundColor: Colors[theme].grey }]} />
            <View style={styles.infoItemContainer}>
              <View style={[styles.textPlaceholderSmall, { backgroundColor: Colors[theme].grey, width: 120 }]} />
              <View style={[styles.textPlaceholderExtraSmall, { backgroundColor: Colors[theme].grey, width: 40 }]} />
            </View>
          </View>
        </View>
        {/* Right Side */}
        <View style={styles.rightSideContainer}>
          <View style={[styles.buttonPlaceholder, { backgroundColor: Colors[theme].grey, borderTopRightRadius: 12 }]} />
        </View>
      </View>
    </View>
  );
};
