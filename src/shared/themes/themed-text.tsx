import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/shared/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'tabItem' | 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'cardInfo';
};

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text') as string;

  return (
    <Text
      style={[
        { color },
        type === 'tabItem' ? styles.tabItem : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'cardInfo' ? styles.cardInfo : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 32,
  },
  cardInfo: {
    fontSize: 12,
    fontWeight: 400,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
  },
  tabItem: {
    fontSize: 14,
    lineHeight: 24,
    color: '#6C757D',
  },
  default: {
    fontSize: 18,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 600,
  },
  link: {
    textDecorationLine: 'underline',
    lineHeight: 30,
    fontSize: 16,
    color: '#1A73E8',
  },
});
