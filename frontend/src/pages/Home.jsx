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
  Stack,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
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
  const [styleIntensity, setStyleIntensity] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
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

  const generateFilename = (text) => {
    console.log('Starting filename generation...');
  
    if (!text) {
      console.warn('No text provided for filename generation');
      return 'hitchens-transformed.png';
    }

    // Common words to filter out for better filename creation
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after'
    ]);
  
    // Take first sentence or up to 100 characters for processing
    const textSample = text.split('.')[0].substring(0, 100);
    console.log('Text sample for filename:', textSample);
  
    // Process the text into clean words
    const words = textSample
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && // Keep words longer than 2 characters
        !commonWords.has(word) && // Remove common words
        !/^\d+$/.test(word) // Remove pure numbers
      )
      .slice(0, 3); // Take only first 3 meaningful words
  
    console.log('Selected words for filename:', words);
  
    // Generate timestamp in a more compact format
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]
      .substring(0, 12);
  
    // Create a short random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 6);
  
    // Combine elements into final filename
    const filename = `hitchens-${words.join('-')}-${timestamp}-${randomSuffix}.png`;
    console.log('Generated filename:', filename);
  
    return filename;
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
          verbosity: parseInt(verbosity),
          style_intensity: parseInt(styleIntensity)
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
    if (!outputText) {
      console.log('No output text available for screenshot');
      return;
    }
    
    try {
      console.log('Starting screenshot capture...');
      const element = outputRef.current;
      
      if (!element) {
        console.error('Output element reference not found');
        return;
      }
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: '#FFFFFF'
      });
      
      const filename = generateFilename(outputText);
      console.log('Generated filename:', filename);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: 'Screenshot saved',
        description: 'The image has been downloaded successfully',
        status: 'success',
        duration: 2000
      });
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

        <Flex w="100%" gap={8} direction={{ base: "column", md: "row" }}>
          <VStack flex={1} spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontWeight="bold">Input Text</FormLabel>
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
            </FormControl>

            <HStack spacing={4} align="flex-start">
              <FormControl flex={1}>
                <FormLabel fontWeight="medium" color="brand.oxfordBlue">
                  Verbosity Level
                </FormLabel>
                <Select
                  value={verbosity}
                  onChange={(e) => setVerbosity(e.target.value)}
                  bg="white"
                  borderColor="brand.leatherBrown"
                  size="md"
                  _hover={{
                    borderColor: 'brand.antiqueGold'
                  }}
                  _focus={{
                    borderColor: 'brand.antiqueGold',
                    boxShadow: '0 0 0 1px brand.antiqueGold'
                  }}
                >
                  <option value="1">Concise</option>
                  <option value="2">Moderate</option>
                  <option value="3">Verbose</option>
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontWeight="medium" color="brand.oxfordBlue">
                  Style Intensity
                </FormLabel>
                <Box pt={2}>
                  <Slider
                    id="style-intensity"
                    defaultValue={1}
                    min={1}
                    max={3}
                    step={1}
                    onChange={(v) => setStyleIntensity(v)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderTrack bg="brand.fadedSepia">
                      <SliderFilledTrack bg="brand.deepBurgundy" />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="brand.deepBurgundy"
                      color="white"
                      placement="top"
                      isOpen={showTooltip}
                      label={`${
                        styleIntensity === 1 ? 'Subtle' :
                        styleIntensity === 2 ? 'Balanced' : 'Pronounced'
                      }`}
                    >
                      <SliderThumb 
                        boxSize={6} 
                        bg="white"
                        borderColor="brand.deepBurgundy"
                        borderWidth="2px"
                      />
                    </Tooltip>
                  </Slider>
                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="sm" color="brand.oxfordBlue">Subtle</Text>
                    <Text fontSize="sm" color="brand.oxfordBlue">Balanced</Text>
                    <Text fontSize="sm" color="brand.oxfordBlue">Pronounced</Text>
                  </Flex>
                </Box>
              </FormControl>
            </HStack>

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