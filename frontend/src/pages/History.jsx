import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  useToast as chakraToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

function History() {
  const [transformations, setTransformations] = useState([]);
  const toast = chakraToast();

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setTransformations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transformation history',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
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
