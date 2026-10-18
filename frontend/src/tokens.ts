/**
 * GraphGate CI — Central Design Tokens
 * Follows Garden Skills web-design-engineer specification:
 * Restrained data-first developer-security workbench.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    canvas: '#F5F6F4',
    surface: '#FFFFFF',
    surfaceSubtle: '#F9FAF9',
    surfaceHover: '#F0F2F0',
    surfaceActive: '#E8EBE9',

    // Text & Content
    textPrimary: '#17211F',
    textSecondary: '#64716C',
    textMuted: '#8A9691',
    textInverse: '#FFFFFF',

    // Structural Borders
    border: '#DFE5E1',
    borderSubtle: '#EDF1EE',
    borderStrong: '#C5CFC9',

    // Brand Accent (Deep Pine / Teal-Green)
    brand: '#286A61',
    brandHover: '#20554E',
    brandSubtle: '#EAF3F1',
    brandBorder: '#B2D5CE',

    // Semantic Status Tokens
    risk: {
      base: '#B42318',
      subtle: '#FEF3F2',
      border: '#FECDCA',
      text: '#912018',
    },
    warning: {
      base: '#A15C07',
      subtle: '#FEF7EC',
      border: '#FEDF89',
      text: '#824905',
    },
    success: {
      base: '#16794B',
      subtle: '#ECFDF3',
      border: '#A6F4C5',
      text: '#11613C',
    },
    neutral: {
      base: '#9BA7A1',
      subtle: '#F2F5F3',
      border: '#D3DDD7',
      text: '#505C57',
    },
  },

  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
  },

  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
} as const;
