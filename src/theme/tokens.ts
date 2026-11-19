import { ThemeMode } from '../types/coach';

export interface ThemePalette {
  mode: ThemeMode;
  background: string;
  card: string;
  cardElevated: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  workout: string;
  workoutSoft: string;
  nutrition: string;
  nutritionSoft: string;
  water: string;
  waterSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  tabBarBg: string;
  tabBarBorder: string;
  inputBg: string;
  overlay: string;
}

export const DARK_PALETTE: ThemePalette = {
  mode: 'dark',
  background: '#0D0D12',
  card: '#1A1A24',
  cardElevated: '#222230',
  border: '#2B2B3B',
  text: '#F8F9FE',
  textMuted: '#A1A3B5',
  textSubtle: '#707388',
  workout: '#FF5E36',
  workoutSoft: 'rgba(255, 94, 54, 0.14)',
  nutrition: '#00E676',
  nutritionSoft: 'rgba(0, 230, 118, 0.14)',
  water: '#38BDF8',
  waterSoft: 'rgba(56, 189, 248, 0.14)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.14)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  tabBarBg: '#161620',
  tabBarBorder: '#292938',
  inputBg: '#13131C',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const LIGHT_PALETTE: ThemePalette = {
  mode: 'light',
  background: '#F8F9FE',
  card: '#FFFFFF',
  cardElevated: '#F1F3FA',
  border: '#E5E7F0',
  text: '#11121A',
  textMuted: '#5C5F73',
  textSubtle: '#8B8E9F',
  workout: '#FF5E36',
  workoutSoft: 'rgba(255, 94, 54, 0.11)',
  nutrition: '#00B85C',
  nutritionSoft: 'rgba(0, 184, 92, 0.12)',
  water: '#0284C7',
  waterSoft: 'rgba(2, 132, 199, 0.11)',
  warning: '#D97706',
  warningSoft: 'rgba(217, 119, 6, 0.12)',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.11)',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E5E7F0',
  inputBg: '#F3F4FA',
  overlay: 'rgba(17, 18, 26, 0.45)',
};

export const RADIUS = {
  card: 16,
  button: 14,
  input: 12,
  pill: 999,
};

export const FONTS = {
  regular: 'Cairo_400Regular',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
};

export function getPalette(mode: ThemeMode): ThemePalette {
  return mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}
