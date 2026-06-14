import { loadFont } from '@remotion/google-fonts/Inter'

const { fontFamily } = loadFont('normal', {
  weights: ['400', '600', '700'],
  subsets: ['latin'],
})

export type ThemeMode = 'light' | 'dark'

export type AppTheme = {
  mode: ThemeMode
  fontFamily: string
  bg: string
  bgMuted: string
  bgElevated: string
  bgAccent: string
  primary: string
  primaryHover: string
  text: string
  textMuted: string
  textSubtle: string
  success: string
  successBg: string
  border: string
  borderAccent: string
  shadow: string
  shadowSoft: string
  primaryGlow: string
  heroGlow: string
  navBg: string
  radiusButton: number
  radiusPanel: number
  swishGreen: string
  statusOpenBorder: string
  statusOpenBg: string
  statusOpenText: string
}

const shared = {
  fontFamily,
  radiusButton: 8,
  radiusPanel: 12,
  swishGreen: '#0B5C2A',
} as const

export const lightTheme: AppTheme = {
  mode: 'light',
  ...shared,
  bg: '#ffffff',
  bgMuted: '#f8fafc',
  bgElevated: '#ffffff',
  bgAccent: '#eff6ff',
  primary: '#1a73e8',
  primaryHover: '#1656cb',
  text: '#1c2b39',
  textMuted: '#5f6b7a',
  textSubtle: '#94a3b8',
  success: '#34a853',
  successBg: '#e8f5e9',
  border: '#e2e8f0',
  borderAccent: '#bfdbfe',
  shadow: 'rgba(28, 43, 57, 0.06)',
  shadowSoft: 'rgba(28, 43, 57, 0.04)',
  primaryGlow: 'rgba(26, 115, 232, 0.25)',
  heroGlow: 'rgba(26, 115, 232, 0.04)',
  navBg: 'rgba(255, 255, 255, 0.9)',
  statusOpenBorder: '#a7f3d0',
  statusOpenBg: '#ecfdf5',
  statusOpenText: '#047857',
}

export const darkTheme: AppTheme = {
  mode: 'dark',
  ...shared,
  bg: '#0f1419',
  bgMuted: '#1a2332',
  bgElevated: '#1c2b39',
  bgAccent: '#1e3a5f',
  primary: '#4a9eff',
  primaryHover: '#6bb0ff',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  success: '#4ade80',
  successBg: '#14532d',
  border: '#2d3e50',
  borderAccent: '#1e40af',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowSoft: 'rgba(0, 0, 0, 0.2)',
  primaryGlow: 'rgba(74, 158, 255, 0.3)',
  heroGlow: 'rgba(74, 158, 255, 0.08)',
  navBg: 'rgba(15, 20, 25, 0.9)',
  statusOpenBorder: 'rgba(74, 222, 128, 0.35)',
  statusOpenBg: 'rgba(20, 83, 45, 0.5)',
  statusOpenText: '#4ade80',
}

export function getTheme(mode: ThemeMode): AppTheme {
  return mode === 'dark' ? darkTheme : lightTheme
}
