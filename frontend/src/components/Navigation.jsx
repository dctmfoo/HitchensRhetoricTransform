import { Box, Flex, Link as ChakraLink, Container, Button, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

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
                {user.is_admin && (
                  <ChakraLink
                    as={RouterLink}
                    to="/admin"
                    color="white"
                    _hover={{ color: 'brand.antiqueGold' }}
                  >
                    Admin Dashboard
                  </ChakraLink>
                )}
              </Flex>
            )}
          </Flex>
          <Flex align="center" gap={4}>
            {user ? (
              <>
                <Text color="white">Welcome, {user.username}!</Text>
                <Button
                  onClick={handleLogout}
                  colorScheme="whiteAlpha"
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ChakraLink
                  as={RouterLink}
                  to="/login"
                  color="white"
                  _hover={{ color: 'brand.antiqueGold' }}
                >
                  Login
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/register"
                  color="white"
                  _hover={{ color: 'brand.antiqueGold' }}
                >
                  Register
                </ChakraLink>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navigation;
