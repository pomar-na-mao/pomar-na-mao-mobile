import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';

export const AnimatedTabButton = (props: BottomTabBarButtonProps) => {
  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={props.accessibilityState}
      accessibilityLabel={props.accessibilityLabel}
      testID={props.testID}
      android_ripple={{ color: 'transparent' }}
      style={props.style}
    >
      <View style={{ alignItems: 'center', width: '100%' }}>{props.children}</View>
    </Pressable>
  );
};
