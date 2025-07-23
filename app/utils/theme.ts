// Enhanced theme for Match & Settle React Native app
// Supports light/dark mode, Gluestack UI, and custom tokens

export const theme = {
  colors: {
    primary: '#6C63FF', // Main brand color
    secondary: '#00C4B4', // Accent color
    background: {
      light: '#FFFFFF',
      dark: '#1A1A1A',
    },
    surface: {
      light: '#F5F5F5',
      dark: '#2C2C2C',
    },
    text: {
      primary: {
        light: '#333333',
        dark: '#E0E0E0',
      },
      secondary: {
        light: '#666666',
        dark: '#A0A0A0',
      },
      disabled: {
        light: '#B0B0B0',
        dark: '#707070',
      },
    },
    error: '#FF4D4F',
    success: '#00C4B4',
    warning: '#FAAD14',
    info: '#1890FF',
    // Additional tokens for Gluestack/NativeWind
    card: {
      light: '#FFFFFF',
      dark: '#2C2C2C',
    },
    border: {
      light: '#E0E0E0',
      dark: '#333333',
    },
    input: {
      light: '#F0F2F5',
      dark: '#232323',
    },
    placeholder: {
      light: '#B0B0B0',
      dark: '#707070',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizes: {
      h1: 28,
      h2: 24,
      h3: 20,
      body: 16,
      caption: 14,
      small: 12,
    },
    fontWeights: {
      regular: "400",
      medium: "500",
      bold: "700",
    },
    weights: {
      normal: "400",
      medium: "500",
      bold: "700",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    none: 0,
    small: 4,
    medium: 8,
    large: 16,
    round: 9999,
    card: 12,
    input: 8,
    button: 10,
  },
  shadows: {
    light: {
      small: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
      medium: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
      large: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    },
    dark: {
      small: { shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
      medium: { shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
      large: { shadowColor: '#000', shadowOpacity: 0.40, shadowRadius: 8, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    },
  },
  // Useful for Gluestack/NativeWind
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
  },
};

// Theme context for React Native
export const ThemeContext = {
  light: {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: theme.colors.background.light,
      surface: theme.colors.surface.light,
      card: theme.colors.card.light,
      border: theme.colors.border.light,
      input: theme.colors.input.light,
      placeholder: theme.colors.placeholder.light,
      text: {
        primary: theme.colors.text.primary.light,
        secondary: theme.colors.text.secondary.light,
        disabled: theme.colors.text.disabled.light,
      },
      error: theme.colors.error,
      success: theme.colors.success,
      warning: theme.colors.warning,
      info: theme.colors.info,
    },
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows.light,
    zIndex: theme.zIndex,
  },
  dark: {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: theme.colors.background.dark,
      surface: theme.colors.surface.dark,
      card: theme.colors.card.dark,
      border: theme.colors.border.dark,
      input: theme.colors.input.dark,
      placeholder: theme.colors.placeholder.dark,
      text: {
        primary: theme.colors.text.primary.dark,
        secondary: theme.colors.text.secondary.dark,
        disabled: theme.colors.text.disabled.dark,
      },
      error: theme.colors.error,
      success: theme.colors.success,
      warning: theme.colors.warning,
      info: theme.colors.info,
    },
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows.dark,
    zIndex: theme.zIndex,
  },
};

// Utility function to get current theme
export const getTheme = (mode = 'light') => {
  return mode === 'dark' ? ThemeContext.dark : ThemeContext.light;
}; 