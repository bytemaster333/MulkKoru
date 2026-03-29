// MülkKoru Design System — Color Tokens
// Referans: #3525cd ana marka, Fintech/Bento-box UI

export const Colors = {
  // ── Brand ──────────────────────────────────
  brand: {
    50:      '#eeecfb',
    100:     '#d5d0f6',
    200:     '#aba1ed',
    300:     '#8172e4',
    400:     '#5748da',
    DEFAULT: '#3525cd',
    600:     '#2b1ea4',
    700:     '#21177c',
    800:     '#161053',
    900:     '#0b0829',
  },
  accent:    '#6d5ce7',
  accentLight: '#9d8ef0',

  // ── Semantic ────────────────────────────────
  success:   '#10b981',
  successBg: '#064e3b22',
  warning:   '#f59e0b',
  warningBg: '#78350f22',
  danger:    '#ef4444',
  dangerBg:  '#7f1d1d22',
  info:      '#3b82f6',
  infoBg:    '#1e3a5f22',
  error:     '#ba1a1a',
  tertiary:  '#005338',

  // ── Dark surfaces ───────────────────────────
  dark: {
    bg:       '#0f0f23',
    surface:  '#1a1a3e',
    card:     '#1e1e44',
    border:   '#2d2d5e',
    muted:    '#6b7280',
    text:     '#f1f5f9',
    subtext:  '#94a3b8',
  },

  // ── Light surfaces ──────────────────────────
  light: {
    bg:         '#f8fafc',
    surface:    '#faf8ff',
    container:  '#eaedff',
    onSurface:  '#131b2e',
    card:       '#ffffff',
    border:     '#e2e8f0',
    muted:      '#94a3b8',
    text:       '#0f172a',
    subtext:    '#64748b',
  },

  white:     '#ffffff',
  black:     '#000000',
  transparent: 'transparent',
} as const;

// Bento-box gradient pairs (from → to)
export const GradientPairs = {
  brand:   ['#3525cd', '#6d5ce7'] as const,
  success: ['#059669', '#10b981'] as const,
  warning: ['#d97706', '#f59e0b'] as const,
  danger:  ['#dc2626', '#ef4444'] as const,
  dark:    ['#1a1a3e', '#0f0f23'] as const,
} as const;
