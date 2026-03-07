export const APP_THEME_COLORS = {
  bgPrimary: "#0B0B0D",
  bgSecondary: "#15161A",
  surface: "#1C1D22",
  border: "#2A2D36",
  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B8",
  textMuted: "#6E6E73",
  accentPurple: "#7B61FF",
  accentBlue: "#4DA3FF",
  accentCyan: "#2ED3C6",
  accentOrange: "#FF9F4A",
  accentPink: "#FF5C8A",
  success: "#22C55E",
  danger: "#EF4444",
} as const;

export const APP_GRADIENTS = {
  surfaceDark: [APP_THEME_COLORS.bgPrimary, APP_THEME_COLORS.bgSecondary] as const,
  surfaceViolet: [APP_THEME_COLORS.bgSecondary, APP_THEME_COLORS.surface] as const,
  actionPrimary: [APP_THEME_COLORS.accentBlue, APP_THEME_COLORS.accentCyan] as const,
  actionSecondary: [APP_THEME_COLORS.accentPurple, APP_THEME_COLORS.accentBlue] as const,
  foreground: [APP_THEME_COLORS.textPrimary, APP_THEME_COLORS.textSecondary] as const,
  actionNeutral: [APP_THEME_COLORS.textMuted, APP_THEME_COLORS.textMuted] as const,
};

export const APP_COLORS = {
  surfacePrimary: APP_THEME_COLORS.bgPrimary,
  surfaceCard: APP_THEME_COLORS.bgSecondary,
  surfaceElevated: APP_THEME_COLORS.surface,
  textPrimary: APP_THEME_COLORS.textPrimary,
  textSecondary: APP_THEME_COLORS.textSecondary,
  textMuted: APP_THEME_COLORS.textMuted,
  border: APP_THEME_COLORS.border,
  actionPrimary: APP_THEME_COLORS.accentBlue,
  actionSecondary: APP_THEME_COLORS.accentPurple,
  actionNeutral: APP_THEME_COLORS.surface,
  success: APP_THEME_COLORS.success,
  danger: APP_THEME_COLORS.danger,
};

export const CATEGORY_COLOR_BY_NAME: Record<string, string> = {
  Salary: APP_THEME_COLORS.accentCyan,
  Freelance: APP_THEME_COLORS.accentBlue,
  Investments: APP_THEME_COLORS.accentPurple,
  Bonus: APP_THEME_COLORS.success,
  Refund: APP_THEME_COLORS.accentOrange,
  "Food & Dining": APP_THEME_COLORS.danger,
  Transport: APP_THEME_COLORS.accentOrange,
  Shopping: APP_THEME_COLORS.accentPurple,
  Bills: APP_THEME_COLORS.accentBlue,
  Entertainment: APP_THEME_COLORS.accentPink,
};
