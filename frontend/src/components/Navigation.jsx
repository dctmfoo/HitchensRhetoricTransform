import { Box, Flex, Link as ChakraLink, Container, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box 
      as="nav" 
      bgGradient="linear(to-r, brand.deepBurgundy, brand.oxfordBlue)"
      borderBottom="2px"
      borderColor="brand.antiqueGold"
      boxShadow="md"
    >
      <Container maxW="container.xl">
        <Flex py={4} align="center" justify="space-between">
          <Flex align="center">
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
            {user && (
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
            )}
          </Flex>
          
          <Flex align="center">
            {user ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Logout
              </Button>
            ) : (
              location.pathname !== '/login' && (
                <ChakraLink
                  as={RouterLink}
                  to="/login"
                  color="white"
                  _hover={{ color: 'brand.antiqueGold' }}
                >
                  Login
                </ChakraLink>
              )
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navigation;
