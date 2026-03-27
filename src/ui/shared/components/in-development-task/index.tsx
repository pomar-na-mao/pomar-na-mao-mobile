import { images } from '@/shared/constants/images';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { Image, View } from 'react-native';

const InDevelopmentTask = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Image
          source={images.inProgress}
          style={{
            width: 120,
            height: 120,
          }}
        />
        <ThemedText
          type="defaultSemiBold"
          style={{
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          Trabalho em progresso
        </ThemedText>
        <ThemedText
          type="default"
          style={{
            textAlign: 'center',
          }}
        >
          Funcionalidade em desenvolvimento!
        </ThemedText>
      </View>
    </ThemedView>
  );
};

export default InDevelopmentTask;
