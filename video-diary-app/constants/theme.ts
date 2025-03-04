export const COLORS = {
  primary: '#4285F4',
  primaryLight: '#a0c4ff',
  secondary: '#03A9F4',

  black: '#000',
  white: '#fff',

  background: '#fff',
  card: '#f9f9f9',

  text: {
    primary: '#333',
    secondary: '#666',
    light: '#888',
    accent: '#4285F4'
  },

  border: '#eee',
  danger: '#ff3b30',

  placeholderBackground: '#ddd'
};

export const SIZES = {
  // Global sizes
  base: 8,
  padding: 16,
  radius: 8,

  // Font sizes
  h1: 24,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 16,
  small: 14,

  // Component specific
  fabSize: 56,
  thumbnailWidth: 120,
  thumbnailHeight: 90,
  iconSize: 24,
  headerIconSize: 24
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  h4: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  body: {
    fontSize: SIZES.body,
  },
  small: {
    fontSize: SIZES.small,
  }
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
};

const theme = { COLORS, SIZES, FONTS, SHADOWS };

export default theme;
