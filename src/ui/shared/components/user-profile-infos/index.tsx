import { images } from '@/shared/constants/images';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import React from 'react';
import { Image, View } from 'react-native';
import { styles } from './styles';

interface UserProfileInfosProps {
  name: string;
  avatarUrl: string;
  email: string;
}

const UserProfileInfos: React.FC<UserProfileInfosProps> = ({ name, avatarUrl, email }) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].card }]}>
      <View style={styles.imageWrapper}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        ) : (
          <Image source={images.emptyUser} style={styles.image} />
        )}
      </View>
      <ThemedText type="defaultSemiBold" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.email}>
        {email}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.userType}>
        Funcionário
      </ThemedText>
    </View>
  );
};

export default UserProfileInfos;
