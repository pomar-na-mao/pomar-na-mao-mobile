import { Platform } from 'react-native';

const tintColorLight = '#4F46E5'; // Índigo vibrante
const tintColorDark = '#818CF8'; // Índigo suave/pastel

export const Colors = {
  light: {
    text: '#111827', // Quase preto, confortável para leitura
    disabledText: '#9CA3AF',
    background: '#F9FAFB', // Off-white moderno e limpo
    navHeaderBackgroud: '#FFFFFF', // Header limpo
    tint: tintColorLight,
    secondary: '#F59E0B', // Âmbar vibrante para detalhes
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    line: '#E5E7EB', // Bordas sutis
    overlay: 'rgba(17, 24, 39, 0.4)', // Overlay escurecido elegante
    inputBackground: '#F3F4F6',
    inputBorder: '#E5E7EB',
    inputError: '#EF4444',
    inputPlaceholder: '#9CA3AF',
    errorText: '#DC2626',
    link: '#2563EB', // Azul clássico para links
    confirmationButtonBackground: '#10B981', // Verde esmeralda moderno
    cancelButtonBackground: '#F3F4F6', // Fundo sutil para cancelar
    destructiveButtonBackground: '#EF4444',
    neutralButtonBackground: '#F3F4F6',
    neutralButtonText: '#374151',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    danger: '#EF4444',
    grey: '#E5E7EB',
    surface: '#FFFFFF',
    activeTrackColor: '#A5B4FC',
    deactiveTrackColor: '#E5E7EB',
    activeThumbColor: tintColorLight,
    deactiveThumbColor: '#FAFAFA',
    blue: '#3B82F6',
    logoBackground: '#EEF2FF', // Fundo índigo super claro
    mapRegionStrokeColor: '#4F46E5',
    mapRegionFillColor: 'rgba(79, 70, 229, 0.2)',
    warning: '#F59E0B',
    iconBackground: '#F3F4F6',
    plantCircle: 'rgba(76, 175, 80, 1)',
  },
  dark: {
    text: '#F8FAFC', // Off-white para não "estourar" na tela escura
    disabledText: '#64748B',
    background: '#0F172A', // Slate escuro (Azul acinzentado super premium)
    navHeaderBackgroud: '#0F172A',
    tint: tintColorDark,
    secondary: '#FBBF24', // Âmbar pastel para contraste
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    line: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.6)',
    inputBackground: '#1E293B', // Superfícies elevadas
    inputBorder: '#334155',
    inputError: '#F87171',
    inputPlaceholder: '#64748B',
    errorText: '#FCA5A5',
    link: '#60A5FA',
    confirmationButtonBackground: '#059669',
    cancelButtonBackground: '#1E293B',
    destructiveButtonBackground: '#EF4444',
    neutralButtonBackground: '#1E293B',
    neutralButtonText: '#CBD5E1',
    card: '#1E293B',
    cardBorder: '#334155',
    danger: '#EF4444',
    grey: '#334155',
    surface: '#1E293B',
    activeTrackColor: '#3730A3',
    deactiveTrackColor: '#334155',
    activeThumbColor: tintColorDark,
    deactiveThumbColor: '#94A3B8',
    blue: '#60A5FA',
    logoBackground: '#312E81',
    mapRegionStrokeColor: '#818CF8',
    mapRegionFillColor: 'rgba(129, 140, 248, 0.25)',
    warning: '#FBBF24',
    iconBackground: '#1E293B',
    plantCircle: 'rgba(128, 221, 131, 1)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Times New Roman, 'Georgia', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
