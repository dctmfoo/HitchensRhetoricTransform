import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      deepBurgundy: '#2C0A16', // Darker burgundy
      agedParchment: '#1A1A1A', // Dark background
      inkBlack: '#121212', // Deeper black
      oxfordBlue: '#001529', // Darker oxford blue
      antiqueGold: '#9B824F', // Muted gold
      leatherBrown: '#592D0D', // Richer brown
      fadedSepia: '#2A2522', // Dark sepia
      forestGreen: '#1B2E26', // Darker forest green
      mutedCrimson: '#4A1F24', // Darker crimson
      textLight: '#E0D5C6', // Light text for dark background
      accentGold: '#BFA264', // Bright accent for highlights
      borderDark: '#333333' // Dark borders
    }
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif'
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bgGradient: 'linear(145deg, brand.deepBurgundy, brand.mutedCrimson)',
          color: 'brand.textLight',
          _hover: {
            bgGradient: 'linear(145deg, brand.mutedCrimson, brand.deepBurgundy)',
            transform: 'translateY(-1px)',
            boxShadow: 'lg'
          }
        },
        outline: {
          borderColor: 'brand.antiqueGold',
          color: 'brand.accentGold',
          _hover: {
            bg: 'brand.antiqueGold',
            color: 'brand.inkBlack'
          }
        }
      }
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'brand.inkBlack',
          border: '1px solid',
          borderColor: 'brand.borderDark',
          color: 'brand.textLight',
          _hover: {
            bg: 'brand.inkBlack',
          },
          _focus: {
            borderColor: 'brand.accentGold',
            boxShadow: '0 0 0 1px brand.accentGold'
          }
        }
      },
      defaultProps: {
        variant: 'filled'
      }
    },
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        px: { base: 4, md: 6 }
      }
    },
    Card: {
      baseStyle: {
        bg: 'brand.fadedSepia',
        borderRadius: 'lg',
        boxShadow: 'lg'
      }
    }
  },
  styles: {
    global: {
      body: {
        bg: 'brand.agedParchment',
        color: 'brand.textLight',
        lineHeight: 'tall'
      },
      'h1, h2, h3, h4, h5, h6': {
        color: 'brand.accentGold',
        letterSpacing: 'wide'
      },
      a: {
        color: 'brand.antiqueGold',
        _hover: {
          color: 'brand.accentGold',
          textDecoration: 'none'
        }
      }
    }
  }
});

export default theme;
