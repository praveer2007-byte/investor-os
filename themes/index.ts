export type ThemeId = 'premium-light' | 'institutional-black' | 'zen-wealth';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSubtle: string;
  positive: string;
  negative: string;
  warning: string;
  chart: string[];
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  card: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  skeleton: string;
  skeletonHighlight: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingWeight: '700' | '600';
  bodyWeight: '400';
  monoFamily: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  zen: boolean;
}

const baseSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const baseRadius: ThemeRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const baseTypography: ThemeTypography = {
  fontFamily: 'System',
  headingWeight: '700',
  bodyWeight: '400',
  monoFamily: 'Courier New',
};

export const InstitutionalBlack: Theme = {
  id: 'institutional-black',
  name: 'Institutional Black',
  colors: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1F1F1F',
    border: '#2A2A2A',
    borderSubtle: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    accent: '#C9A84C',
    accentSubtle: '#4A4420',
    positive: '#2ECC71',
    negative: '#E74C3C',
    warning: '#F39C12',
    chart: ['#C9A84C', '#2ECC71', '#3498DB', '#9B59B6', '#E67E22'],
    tabBar: '#141414',
    tabBarBorder: '#2A2A2A',
    tabActive: '#C9A84C',
    tabInactive: '#666666',
    card: '#1A1A1A',
    cardBorder: '#2A2A2A',
    inputBackground: '#0F0F0F',
    inputBorder: '#2A2A2A',
    skeleton: '#1F1F1F',
    skeletonHighlight: '#2A2A2A',
  },
  typography: baseTypography,
  spacing: baseSpacing,
  radius: baseRadius,
  zen: false,
};

export const PremiumLight: Theme = {
  id: 'premium-light',
  name: 'Premium Light',
  colors: {
    background: '#F8F7F4',
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAF9',
    border: '#E5E3DF',
    borderSubtle: '#F0EFE8',
    text: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textMuted: '#8A8A8A',
    accent: '#1B2B4B',
    accentSubtle: '#E8EDF6',
    positive: '#27AE60',
    negative: '#C0392B',
    warning: '#E67E22',
    chart: ['#1B2B4B', '#27AE60', '#3498DB', '#8E44AD', '#E67E22'],
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E3DF',
    tabActive: '#1B2B4B',
    tabInactive: '#B0B0B0',
    card: '#FAFAF9',
    cardBorder: '#E5E3DF',
    inputBackground: '#FFFFFF',
    inputBorder: '#D5D3CF',
    skeleton: '#F0EFE8',
    skeletonHighlight: '#E5E3DF',
  },
  typography: baseTypography,
  spacing: baseSpacing,
  radius: baseRadius,
  zen: false,
};

export const ZenWealth: Theme = {
  id: 'zen-wealth',
  name: 'Zen Wealth',
  colors: {
    background: '#0D1117',
    surface: '#161B22',
    surfaceElevated: '#21262D',
    border: '#30363D',
    borderSubtle: '#1C2128',
    text: '#E6EDF3',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',
    accent: '#7B9E87',
    accentSubtle: '#3D4A42',
    positive: '#9CAF8F',
    negative: '#A89080',
    warning: '#B5A572',
    chart: ['#7B9E87', '#9CAF8F', '#8BA89C', '#A89080', '#B5A572'],
    tabBar: '#161B22',
    tabBarBorder: '#30363D',
    tabActive: '#7B9E87',
    tabInactive: '#6E7681',
    card: '#21262D',
    cardBorder: '#30363D',
    inputBackground: '#0D1117',
    inputBorder: '#30363D',
    skeleton: '#21262D',
    skeletonHighlight: '#30363D',
  },
  typography: baseTypography,
  spacing: baseSpacing,
  radius: baseRadius,
  zen: true,
};

export const THEMES = {
  [InstitutionalBlack.id]: InstitutionalBlack,
  [PremiumLight.id]: PremiumLight,
  [ZenWealth.id]: ZenWealth,
} as const;

export const DEFAULT_THEME_ID: ThemeId = 'institutional-black';
