import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      deepBurgundy: '#4A1625',
      agedParchment: '#F5E6D3',
      inkBlack: '#2B2B2B',
      oxfordBlue: '#002147',
      antiqueGold: '#BFA264',
      leatherBrown: '#8B4513',
      fadedSepia: '#D4C4B7',
      forestGreen: '#2B4C3F',
      mutedCrimson: '#7B323C'
    }
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif'
  },
  styles: {
    global: {
      body: {
        bg: 'brand.agedParchment',
        color: 'brand.inkBlack'
      }
    }
  }
});

export default theme;
