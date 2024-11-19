import { Box, Flex, Link as ChakraLink, Container } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Navigation() {
  return (
    <Box 
      as="nav" 
      bgGradient="linear(to-r, brand.deepBurgundy, brand.oxfordBlue)"
      borderBottom="2px"
      borderColor="brand.antiqueGold"
      boxShadow="md"
    >
      <Container maxW="container.xl">
        <Flex py={4} align="center">
          <ChakraLink
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            color="white"
            _hover={{ textDecoration: 'none', color: 'brand.antiqueGold' }}
          >
            Hitchens Transformer
          </ChakraLink>
          <Flex ml={8} gap={4}>
            <ChakraLink
              as={RouterLink}
              to="/"
              color="white"
              _hover={{ color: 'brand.antiqueGold' }}
            >
              Home
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/history"
              color="white"
              _hover={{ color: 'brand.antiqueGold' }}
            >
              History
            </ChakraLink>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navigation;
