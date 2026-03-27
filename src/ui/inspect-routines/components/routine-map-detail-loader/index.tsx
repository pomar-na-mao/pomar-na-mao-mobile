import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ActivityIndicator, View } from 'react-native';

export const RoutineMapDetailLoader = () => {
  const theme = useColorScheme() ?? 'light';
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: Colors[theme].background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.02,
        borderRadius: 16,
        elevation: 4,
        overflow: 'hidden',
      }}
    >
      <ActivityIndicator animating={true} size={60} color={Colors[theme].tint} />
    </View>
  );
};
