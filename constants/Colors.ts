export const Colors = {
  // Primary Gradient Anchors
  primary: '#6366F1',       // Indigo
  primaryLight: '#818CF8',  // Lighter indigo
  primaryDark: '#4F46E5',   // Deeper indigo
  accent: '#3B82F6',        // Blue accent

  // Gradient Definitions (start, end)
  gradientPrimary: ['#6366F1', '#3B82F6'] as [string, string],
  gradientSubtle: ['#EEF2FF', '#E0F2FE'] as [string, string],
  gradientDark: ['#1E293B', '#0F172A'] as [string, string],
  gradientLight: ['#FFFFFF', '#F8FAFC'] as [string, string],

  // Backgrounds
  background: '#FAFBFC',     // Warm off-white
  surface: '#FFFFFF',        // Card surfaces
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',  // Slightly tinted surface
  tabBar: '#F1F5F9',         // Tab background

  // Text
  text: '#0F172A',           // Near-black slate
  textSecondary: '#475569',  // Medium slate
  textMuted: '#94A3B8',      // Muted / placeholder
  textOnPrimary: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Semantic — Risk
  success: '#10B981',        // Emerald
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#F59E0B',        // Amber
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#EF4444',         // Rose-red
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',

  info: '#3B82F6',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadowColor: '#0F172A',
};
