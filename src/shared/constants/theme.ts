import { Platform } from 'react-native';

/**
 * Stitch Design System - Terra Precision (Pomar na Mão)
 * React Native Theme Adjustment
 */

const tintColorLight = '#2b4c2c'; // Verde Floresta Principal
const tintColorDark = '#97D69B'; // Verde Claro para contraste no Dark Mode

export const Colors = {
  light: {
    text: '#1C1D1C',
    disabledText: '#747974',
    background: '#F8F9F8',
    navHeaderBackgroud: '#FFFFFF',
    tint: tintColorLight,
    secondary: '#8B4513', // Marrom Terroso
    icon: '#444744',
    tabIconDefault: '#747974',
    tabIconSelected: tintColorLight,
    line: '#DFE3DF',
    overlay: 'rgba(28, 29, 28, 0.4)',
    inputBackground: '#EBEEEB',
    inputBorder: '#C4C8C4',
    inputError: '#B91C1C',
    inputPlaceholder: '#747974',
    errorText: '#B91C1C',
    link: '#0369A1',
    confirmationButtonBackground: '#166534',
    cancelButtonBackground: '#E5E8E5',
    destructiveButtonBackground: '#B91C1C',
    neutralButtonBackground: '#F1F3F1',
    neutralButtonText: '#1C1D1C',
    card: '#FFFFFF',
    cardBorder: '#E5E8E5',
    danger: '#B91C1C',
    grey: '#DFE3DF',
    surface: '#FFFFFF',
    activeTrackColor: '#D1E2D2',
    deactiveTrackColor: '#DFE3DF',
    activeThumbColor: tintColorLight,
    deactiveThumbColor: '#F8F9F8',
    blue: '#0369A1',
    logoBackground: '#D1E2D2',
    mapRegionStrokeColor: '#2b4c2c',
    mapRegionFillColor: 'rgba(43, 76, 44, 0.2)',
    warning: '#D97706',
    iconBackground: '#E5E8E5',
    plantCircle: 'rgba(43, 76, 44, 1)',
  },
  dark: {
    text: '#F0F1F0',
    disabledText: '#949994',
    background: '#1C1D1C',
    navHeaderBackgroud: '#2E312E',
    tint: tintColorDark,
    secondary: '#A0522D', // Bronze Terroso
    icon: '#C4C8C4',
    tabIconDefault: '#949994',
    tabIconSelected: tintColorDark,
    line: '#444744',
    overlay: 'rgba(0, 0, 0, 0.6)',
    inputBackground: '#2E312E',
    inputBorder: '#444744',
    inputError: '#F87171',
    inputPlaceholder: '#949994',
    errorText: '#FCA5A5',
    link: '#60A5FA',
    confirmationButtonBackground: '#15803D',
    cancelButtonBackground: '#2E312E',
    destructiveButtonBackground: '#EF4444',
    neutralButtonBackground: '#2E312E',
    neutralButtonText: '#F0F1F0',
    card: '#2E312E',
    cardBorder: '#444744',
    danger: '#EF4444',
    grey: '#444744',
    surface: '#2E312E',
    activeTrackColor: '#3D5A3E',
    deactiveTrackColor: '#444744',
    activeThumbColor: tintColorDark,
    deactiveThumbColor: '#C4C8C4',
    blue: '#60A5FA',
    logoBackground: '#1A2408',
    mapRegionStrokeColor: '#97D69B',
    mapRegionFillColor: 'rgba(151, 214, 155, 0.25)',
    warning: '#FBBF24',
    iconBackground: '#2E312E',
    plantCircle: 'rgba(151, 214, 155, 1)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Manrope', // Ajustado para a fonte do sistema
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Manrope',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Manrope', system-ui, -apple-system, sans-serif",
    serif: "Times New Roman, 'Georgia', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});
