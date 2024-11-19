import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function History() {
  const [transformations, setTransformations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransformations();
    }
  }, [user]);

  const fetchTransformations = async () => {
    try {
      const response = await fetch('/api/history', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        throw new Error('Failed to load transformation history');
      }

      const data = await response.json();
      setTransformations(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      status: 'success',
      duration: 2000
    });
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.deepBurgundy" />
        <Text mt={4}>Loading transformations...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading History
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading textAlign="center" mb={8} color="brand.oxfordBlue">
        Transformation Gallery
      </Heading>
      
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        gap={6}
      >
        {transformations.map((transformation) => (
          <Box
            key={transformation.id}
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="md"
            border="1px"
            borderColor="brand.antiqueGold"
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: 'lg'
            }}
          >
            <VStack align="stretch" spacing={4}>
              <Box
                borderBottom="2px"
                borderColor="brand.antiqueGold"
                pb={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="sm" fontStyle="italic" color="brand.forestGreen">
                  {new Date(transformation.created_at).toLocaleString()}
                </Text>
                <Badge colorScheme="purple">
                  Verbosity: {transformation.verbosity_level}
                </Badge>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Original Text</Text>
                <Box position="relative" bg="brand.agedParchment" p={4} borderRadius="md">
                  <Text>{transformation.input_text}</Text>
                  <Button
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => handleCopy(transformation.input_text)}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              <Box
                h="2px"
                bgGradient="linear(to-r, transparent, brand.antiqueGold, transparent)"
              />

              <Box>
                <Text fontWeight="bold" mb={2}>Hitchens' Version</Text>
                <Box position="relative" bg="brand.agedParchment" p={4} borderRadius="md">
                  <Text>{transformation.output_text}</Text>
                  <Button
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => handleCopy(transformation.output_text)}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>
            </VStack>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}

export default History;
