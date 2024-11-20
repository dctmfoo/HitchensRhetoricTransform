import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Textarea,
  VStack,
  Text,
  useToast,
  HStack,
  Container,
  Image,
  Stack
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => (
  <Container maxW="container.xl" py={20}>
    <Stack spacing={8} align="center" textAlign="center">
      <Heading
        fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
        bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
        bgClip="text"
      >
        Transform Your Writing into Hitchens' Style
      </Heading>
      
      <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="2xl">
        Experience the power of AI-driven text transformation that captures the essence
        of Christopher Hitchens' distinctive writing style. Elevate your prose with
        intellectual depth and rhetorical brilliance.
      </Text>

      <Box w="full" maxW="3xl" p={8} bg="white" borderRadius="lg" boxShadow="xl">
        <VStack spacing={6}>
          <Text fontSize="lg" fontStyle="italic" color="gray.700">
            "The measure of a decent human being is how he or she treats the defenseless."
          </Text>
          <Text fontWeight="bold" color="brand.deepBurgundy">
            — Christopher Hitchens
          </Text>
        </VStack>
      </Box>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        <Button
          as={RouterLink}
          to="/login"
          size="lg"
          bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
          color="white"
          _hover={{
            bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)"
          }}
        >
          Sign In to Transform
        </Button>
        <Button
          as={RouterLink}
          to="/register"
          size="lg"
          variant="outline"
          borderColor="brand.deepBurgundy"
          color="brand.deepBurgundy"
          _hover={{
            bg: 'brand.agedParchment'
          }}
        >
          Create Account
        </Button>
      </Stack>
    </Stack>
  </Container>
);

const TextTransformer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [verbosity, setVerbosity] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const typewriterRef = useRef(null);
  const outputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    toast({
      title: 'Cleared',
      description: 'Input and output fields have been reset',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  const handleTransform = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to transform',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch('/api/transform', {
        method: 'POST',
        body: JSON.stringify({
          text: inputText,
          verbosity: verbosity
        })
      });

      const data = await response.json();

      if (response.ok) {
        typewriterEffect(data.transformed_text);
      } else {
        throw new Error(data.error || 'An error occurred during transformation');
      }
    } catch (error) {
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

  const typewriterEffect = (text) => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    let index = 0;
    const textLength = text.length;
    setOutputText('');

    typewriterRef.current = setInterval(() => {
      setOutputText((prev) => {
        const nextIndex = prev.length;
        if (nextIndex >= textLength) {
          clearInterval(typewriterRef.current);
          return prev;
        }
        return prev + text[nextIndex];
      });

      index++;
      if (index >= textLength) {
        clearInterval(typewriterRef.current);
      }
    }, 30);
  };

  const handleScreenshot = async () => {
    if (!outputText) return;

    try {
      const element = outputRef.current;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await htmlToImage.toCanvas(element, {
        quality: 1,
        backgroundColor: '#FFFFFF',
        width: element.offsetWidth,
        height: Math.max(element.scrollHeight, element.offsetHeight),
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'hitchens-response.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: 'Error',
        description: 'Failed to capture screenshot',
        status: 'error',
        duration: 2000
      });
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
        <Heading textAlign="center" color="brand.oxfordBlue">
          Hitchens Style Transformer
        </Heading>

        <Flex w="100%" gap={8} direction={{ base: 'column', md: 'row' }}>
          <VStack flex={1} spacing={4} align="stretch">
            <Text fontWeight="bold">Input Text</Text>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              minH="200px"
              bg="brand.agedParchment"
              border="1px"
              borderColor="brand.leatherBrown"
              _focus={{
                borderColor: 'brand.antiqueGold',
                boxShadow: '0 0 0 1px brand.antiqueGold'
              }}
            />

            <Select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value)}
              bg="white"
            >
              <option value="1">Concise</option>
              <option value="2">Moderate</option>
              <option value="3">Verbose</option>
            </Select>

            <HStack spacing={4}>
              <Button
                onClick={handleTransform}
                isLoading={isLoading}
                loadingText="Transforming..."
                flex="1"
                bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
                color="white"
                _hover={{
                  bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)"
                }}
              >
                Transform
              </Button>
              <Button
                onClick={handleClear}
                isDisabled={isLoading || (!inputText && !outputText)}
                flex="1"
                variant="outline"
                borderColor="brand.deepBurgundy"
                color="brand.deepBurgundy"
                _hover={{
                  bg: 'brand.agedParchment'
                }}
              >
                Clear All
              </Button>
            </HStack>
          </VStack>

          <VStack flex={1} spacing={4} align="stretch">
            <Text fontWeight="bold">Transformed Text</Text>
            <Box position="relative">
              <Box
                ref={outputRef}
                data-screenshot="true"
                bg="white"
                p={8}
                width="600px"
                minHeight="auto"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                border="1px solid #e2e8f0"
                borderRadius="md"
                mx="auto"
                position="relative"
              >
                <Box
                  fontFamily="Georgia, serif"
                  fontSize="18px"
                  lineHeight="1.8"
                  color="black"
                  whiteSpace="pre-wrap"
                  mb={12}
                  sx={{
                    '&::after': {
                      content: '"|"',
                      animation: 'blink 1s step-end infinite',
                      display: isLoading ? 'none' : 'inline'
                    },
                    '@keyframes blink': {
                      'from, to': { opacity: 1 },
                      '50%': { opacity: 0 }
                    }
                  }}
                >
                  {outputText}
                </Box>
                
                {outputText && (
                  <Box
                    position="absolute"
                    bottom={8}
                    right={8}
                    width="150px"
                    height="50px"
                  >
                    <img
                      src="/static/images/hitchens-signature.png"
                      alt="Christopher Hitchens Signature"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'right bottom'
                      }}
                    />
                  </Box>
                )}
              </Box>
              <HStack position="absolute" top={2} right={2} spacing={2}>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(outputText);
                    toast({
                      title: 'Copied!',
                      status: 'success',
                      duration: 2000
                    });
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={handleScreenshot}
                  colorScheme="blue"
                  isDisabled={!outputText}
                >
                  Screenshot
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Flex>
      </VStack>
    </Box>
  );
};

function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Container centerContent py={20}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return isAuthenticated ? <TextTransformer /> : <LandingPage />;
}

export default Home;