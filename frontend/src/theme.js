import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      accent: '#4A9EFF',
      border: '#333333'
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
          bg: 'brand.accent',
          color: 'brand.text',
          _hover: {
            bg: 'brand.accent',
            opacity: 0.9,
            transform: 'translateY(-1px)',
            boxShadow: 'lg'
          }
        },
        outline: {
          borderColor: 'brand.border',
          color: 'brand.accent',
          _hover: {
            bg: 'brand.accent',
            color: 'brand.text'
          }
        }
      }
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'brand.surface',
          border: '1px solid',
          borderColor: 'brand.border',
          color: 'brand.text',
          _hover: {
            bg: 'brand.surface',
          },
          _focus: {
            borderColor: 'brand.accent',
            boxShadow: '0 0 0 1px brand.accent'
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
        bg: 'brand.surface',
        borderRadius: 'lg',
        boxShadow: 'lg'
      }
    }
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text',
        lineHeight: 'tall'
      },
      'h1, h2, h3, h4, h5, h6': {
        color: 'brand.text',
        letterSpacing: 'wide'
      },
      a: {
        color: 'brand.accent',
        _hover: {
          opacity: 0.9,
          textDecoration: 'none'
        }
      }
    }
  }
});

export default theme;
