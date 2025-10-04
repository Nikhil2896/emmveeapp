export const Theme = {
  colors: {
    primaryDark: '#557B83',
    primaryColor: '#39AEA9',
    primaryLight: '#f0f6ddff',
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF4747',
    placeHolder: '#888888',
  },

  fonts: {
    extraLight: 'Montserrat-ExtraLight',
    thin: 'Montserrat-Thin',
    regular: 'Montserrat-Regular',
    light: 'Montserrat-Light',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extraBold: 'Montserrat-ExtraBold',
  },

  fontSize: {
    extraSmall: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 20,
    xLarge: 24,
    heading: 40,
  },
} as const;

export type ThemeType = typeof Theme;

export default Theme;
