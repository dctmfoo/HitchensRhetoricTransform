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
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bgGradient: 'linear(145deg, brand.deepBurgundy, brand.mutedCrimson)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(145deg, brand.mutedCrimson, brand.deepBurgundy)'
          }
        },
        outline: {
          borderColor: 'brand.antiqueGold',
          color: 'brand.oxfordBlue',
          _hover: {
            bg: 'brand.antiqueGold',
            color: 'white'
          }
        }
      }
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'brand.agedParchment',
          border: '1px solid',
          borderColor: 'brand.leatherBrown',
          _hover: {
            bg: 'brand.agedParchment',
          },
          _focus: {
            borderColor: 'brand.antiqueGold',
            boxShadow: '0 0 0 1px brand.antiqueGold'
          }
        }
      },
      defaultProps: {
        variant: 'filled'
      }
    },
    Container: {
      baseStyle: {
        maxW: 'container.xl'
      }
    }
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
