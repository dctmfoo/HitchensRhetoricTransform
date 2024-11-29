import { Box, Text } from '@chakra-ui/react';

const fontStyles = {
  hitchens: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '24px',
    fontStyle: 'italic',
    color: '#1a365d',
    letterSpacing: '1px'
  },
  trump: {
    fontFamily: '"Arial", sans-serif',
    fontSize: '26px',
    fontStyle: 'normal',
    color: '#b71c1c',
    letterSpacing: '2px',
    fontWeight: 'bold'
  },
  friedman: {
    fontFamily: '"Times New Roman", serif',
    fontSize: '22px',
    fontStyle: 'italic',
    color: '#1b5e20',
    letterSpacing: '0.8px'
  }
};

const signatures = {
  hitchens: 'Christopher Hitchens',
  trump: 'Donald J. Trump',
  friedman: 'Milton Friedman'
};

const StyledSignature = ({ persona = 'hitchens' }) => {
  return (
    <Box
      width="150px"
      height="50px"
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
    >
      <Text
        sx={fontStyles[persona] || fontStyles.hitchens}
        transform="rotate(-5deg)"
        textShadow="1px 1px 2px rgba(0,0,0,0.1)"
      >
        {signatures[persona] || signatures.hitchens}
      </Text>
    </Box>
  );
};

export default StyledSignature;
