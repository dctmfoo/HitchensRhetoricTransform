import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await login(username, password);
    if (success) {
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
  };

  const handleUseDemoAccount = async () => {
    const success = await login('demo', 'demo123');
    if (success) {
      toast({
        title: 'Welcome to demo account!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
  };

  return (
    <Box 
      bg="white" 
      p={8} 
      borderRadius="lg" 
      boxShadow="md"
      border="1px"
      borderColor="brand.fadedSepia"
      position="relative"
      maxW="400px"
      mx="auto"
      mt={8}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: 0,
        bg: 'url("/static/images/paper-texture.svg")'
      }}
    >
      <VStack spacing={6} position="relative" zIndex={1}>
        <Box textAlign="center" w="100%" mb={2}>
          <Text
            fontSize="lg"
            fontWeight="medium"
            color="brand.deepBurgundy"
            mb={2}
          >
            Quick Access: Try Our Demo Account
          </Text>
          <Button
            onClick={handleUseDemoAccount}
            size="lg"
            width="100%"
            height="60px"
            fontSize="xl"
            bgGradient="linear(145deg, brand.antiqueGold, brand.leatherBrown)"
            color="white"
            _hover={{
              bgGradient: "linear(145deg, brand.leatherBrown, brand.antiqueGold)",
              transform: "translateY(-2px)",
              boxShadow: "lg"
            }}
            _active={{
              transform: "translateY(0)",
            }}
          >
            Try Demo Account
          </Button>
        </Box>

        <Box w="100%" h="2px" bgGradient="linear(to-r, transparent, brand.antiqueGold, transparent)" my={4} />

        <Heading textAlign="center" color="brand.oxfordBlue" size="lg">
          Login to Your Account
        </Heading>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                bg="brand.agedParchment"
                border="1px"
                borderColor="brand.leatherBrown"
                _focus={{
                  borderColor: 'brand.antiqueGold',
                  boxShadow: '0 0 0 1px brand.antiqueGold'
                }}
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                bg="brand.agedParchment"
                border="1px"
                borderColor="brand.leatherBrown"
                _focus={{
                  borderColor: 'brand.antiqueGold',
                  boxShadow: '0 0 0 1px brand.antiqueGold'
                }}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="Logging in..."
              bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
              color="white"
              _hover={{
                bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)"
              }}
              width="100%"
            >
              Login
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default Login;
