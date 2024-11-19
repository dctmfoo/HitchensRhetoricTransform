import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      deepBurgundy: '#2C0A16',
      agedParchment: '#1A1A1A',
      inkBlack: '#121212',
      oxfordBlue: '#001529',
      antiqueGold: '#9B824F',
      leatherBrown: '#592D0D',
      fadedSepia: '#2A2522',
      forestGreen: '#1B2E26',
      mutedCrimson: '#4A1F24',
      textLight: '#E0D5C6',
      accentGold: '#BFA264',
      borderDark: '#333333'
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
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        _focus: {
          boxShadow: '0 0 0 3px rgba(191, 162, 100, 0.6)',
        },
        _active: {
          transform: 'scale(0.98)',
        }
      },
      variants: {
        solid: {
          bgGradient: 'linear(145deg, brand.deepBurgundy, brand.mutedCrimson)',
          color: 'brand.textLight',
          backdropFilter: 'blur(8px)',
          _hover: {
            bgGradient: 'linear(145deg, brand.mutedCrimson, brand.deepBurgundy)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
          _loading: {
            _hover: { transform: 'none' },
          }
        },
        outline: {
          borderColor: 'brand.antiqueGold',
          color: 'brand.accentGold',
          borderWidth: '2px',
          _hover: {
            bg: 'rgba(155, 130, 79, 0.15)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }
        },
        ghost: {
          color: 'brand.textLight',
          _hover: {
            bg: 'rgba(224, 213, 198, 0.1)',
            transform: 'translateY(-1px)',
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(42, 37, 34, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'rgba(155, 130, 79, 0.2)',
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }
        }
      }
    },
    Tooltip: {
      baseStyle: {
        bg: 'brand.inkBlack',
        color: 'brand.textLight',
        borderRadius: 'md',
        px: '3',
        py: '2',
        fontSize: 'sm',
        boxShadow: 'lg',
      }
    },
    IconButton: {
      baseStyle: {
        borderRadius: 'full',
      },
      variants: {
        ghost: {
          _hover: {
            bg: 'rgba(224, 213, 198, 0.1)',
            transform: 'scale(1.1)',
          },
          _active: {
            transform: 'scale(0.95)',
          }
        }
      }
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'rgba(18, 18, 18, 0.8)',
            borderColor: 'brand.borderDark',
            _hover: {
              bg: 'rgba(18, 18, 18, 0.9)',
            },
            _focus: {
              borderColor: 'brand.accentGold',
              bg: 'rgba(18, 18, 18, 0.95)',
            }
          }
        }
      }
    }
  },
  styles: {
    global: (props) => ({
      body: {
        bg: 'brand.agedParchment',
        color: 'brand.textLight',
        lineHeight: 'tall',
        backgroundImage: "url('/static/images/paper-texture.svg')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px',
      },
      ':focus:not(:focus-visible)': {
        boxShadow: 'none',
      },
      ':focus-visible': {
        boxShadow: '0 0 0 3px rgba(191, 162, 100, 0.6) !important',
        outline: 'none',
      },
      'h1, h2, h3, h4, h5, h6': {
        color: 'brand.accentGold',
        letterSpacing: 'wide',
        fontWeight: 'bold',
      },
      a: {
        color: 'brand.antiqueGold',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          color: 'brand.accentGold',
          textDecoration: 'none',
        },
        _focus: {
          boxShadow: '0 0 0 3px rgba(191, 162, 100, 0.6)',
          outline: 'none',
        }
      }
    })
  },
  layerStyles: {
    card: {
      bg: 'rgba(42, 37, 34, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: 'lg',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease-in-out',
    },
    glassmorphism: {
      bg: 'rgba(42, 37, 34, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'rgba(155, 130, 79, 0.2)',
    }
  },
  textStyles: {
    heading: {
      fontFamily: 'heading',
      fontWeight: 'bold',
      letterSpacing: 'wide',
    },
    body: {
      fontFamily: 'body',
      lineHeight: 'tall',
    }
  }
});

export default theme;
