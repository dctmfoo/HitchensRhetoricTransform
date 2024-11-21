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
  Switch,
  FormControl,
  FormLabel,
  Icon,
  Divider,
  Badge,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import { FaUserTie, FaUserAlt, FaChartLine, FaQuoteLeft } from 'react-icons/fa';

const PersonaCard = ({ icon, title, description, quote, color }) => (
  <Box
    bg={useColorModeValue('white', 'gray.800')}
    p={6}
    borderRadius="lg"
    boxShadow="xl"
    border="1px"
    borderColor="brand.fadedSepia"
    transition="all 0.3s"
    _hover={{
      transform: 'translateY(-5px)',
      boxShadow: '2xl',
    }}
  >
    <VStack spacing={4} align="start">
      <Icon as={icon} boxSize={8} color={color} />
      <Heading size="md" color={color}>
        {title}
      </Heading>
      <Text color="gray.600">{description}</Text>
      <Box pt={4}>
        <Flex align="start">
          <Icon as={FaQuoteLeft} boxSize={6} color={color} mr={2} />
          <Text fontStyle="italic" color="gray.700">
            {quote}
          </Text>
        </Flex>
      </Box>
    </VStack>
  </Box>
);

const LandingPage = () => (
  <Container maxW="container.xl" py={20}>
    <Stack spacing={12} align="center" textAlign="center">
      <Box>
        <Heading
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
          bgClip="text"
          mb={4}
        >
          Transform Your Writing Style
        </Heading>
        <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="2xl">
          Experience the power of AI-driven text transformation that captures the essence
          of three distinct writing styles. Choose your persona and elevate your prose.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
        <PersonaCard
          icon={FaUserTie}
          title="Christopher Hitchens"
          description="Transform your text into the intellectual and literary style of Christopher Hitchens. Perfect for essays, critiques, and analytical pieces."
          quote="The measure of a decent human being is how he or she treats the defenseless."
          color="brand.deepBurgundy"
        />
        <PersonaCard
          icon={FaUserAlt}
          title="Donald Trump"
          description="Convert your message into Trump's distinctive, direct communication style. Ideal for impactful, attention-grabbing statements."
          quote="Nobody knows the system better than me, which is why I alone can fix it."
          color="brand.mutedCrimson"
        />
        <PersonaCard
          icon={FaChartLine}
          title="Milton Friedman"
          description="Adopt the analytical and economic perspective of Milton Friedman. Excellent for policy discussions and economic analysis."
          quote="If you put the federal government in charge of the Sahara Desert, in 5 years there'd be a shortage of sand."
          color="brand.oxfordBlue"
        />
      </SimpleGrid>

      <Box 
        w="full" 
        maxW="3xl" 
        p={8} 
        bg="white" 
        borderRadius="lg" 
        boxShadow="xl"
        border="1px"
        borderColor="brand.fadedSepia"
      >
        <VStack spacing={6}>
          <Heading size="lg" color="brand.deepBurgundy">
            Ready to Transform Your Writing?
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Sign in or create an account to access our powerful text transformation tools.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
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
        </VStack>
      </Box>
    </Stack>
  </Container>
);

const TextTransformer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [verbosity, setVerbosity] = useState('1');
  const [persona, setPersona] = useState('hitchens');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTransformedText, setLastTransformedText] = useState('');
  const [typewriterEnabled, setTypewriterEnabled] = useState(false);
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
    setLastTransformedText('');
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

  const typewriterEffect = (text) => {
    if (!typewriterEnabled) {
      setOutputText(text);
      return;
    }

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
          verbosity: verbosity,
          persona: persona
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLastTransformedText(data.transformed_text);
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

  const handleRetry = () => {
    if (lastTransformedText) {
      typewriterEffect(lastTransformedText);
    }
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
        <Heading textAlign="center" color="brand.oxfordBlue" mb={4}>
          Style Transformer
        </Heading>

        <FormControl 
          mb={6}
          p={4}
          bg="brand.agedParchment"
          borderRadius="lg"
          border="2px"
          borderColor="brand.leatherBrown"
          _hover={{
            borderColor: 'brand.antiqueGold'
          }}
        >
          <FormLabel 
            htmlFor="persona-select"
            fontSize="xl"
            fontWeight="bold"
            color="brand.deepBurgundy"
            mb={4}
          >
            Choose Your Writing Persona
          </FormLabel>
          <Select
            id="persona-select"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            size="lg"
            bg="white"
            border="2px"
            borderColor="brand.leatherBrown"
            h="70px"
            fontSize="lg"
            _hover={{
              borderColor: 'brand.antiqueGold'
            }}
            _focus={{
              borderColor: 'brand.antiqueGold',
              boxShadow: '0 0 0 2px brand.antiqueGold'
            }}
            icon={<Icon as={persona === 'hitchens' ? FaUserTie : persona === 'trump' ? FaUserAlt : FaChartLine} />}
            iconSize={24}
          >
            <option value="hitchens" style={{padding: '12px', fontSize: '16px'}}>
              Christopher Hitchens - Intellectual & Literary Analysis
            </option>
            <option value="trump" style={{padding: '12px', fontSize: '16px'}}>
              Donald Trump - Bold & Direct Communication
            </option>
            <option value="friedman" style={{padding: '12px', fontSize: '16px'}}>
              Milton Friedman - Economic & Analytical Perspective
            </option>
          </Select>
          <Box mt={2}>
            {persona === 'hitchens' && (
              <Badge colorScheme="purple" p={2} borderRadius="md">
                <Icon as={FaUserTie} mr={2} /> Intellectual Style
              </Badge>
            )}
            {persona === 'trump' && (
              <Badge colorScheme="red" p={2} borderRadius="md">
                <Icon as={FaUserAlt} mr={2} /> Direct Style
              </Badge>
            )}
            {persona === 'friedman' && (
              <Badge colorScheme="blue" p={2} borderRadius="md">
                <Icon as={FaChartLine} mr={2} /> Analytical Style
              </Badge>
            )}
          </Box>
        </FormControl>

        <Flex w="100%" gap={8} direction={{ base: 'column', md: 'row' }}>
          <VStack flex={1} spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="lg">Input Text</Text>
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

            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel 
                  htmlFor="verbosity-select"
                  fontSize="lg"
                  fontWeight="bold"
                  color="brand.deepBurgundy"
                >
                  Response Length
                </FormLabel>
                <Select
                  id="verbosity-select"
                  value={verbosity}
                  onChange={(e) => setVerbosity(e.target.value)}
                  size="lg"
                  bg="white"
                  border="2px"
                  borderColor="brand.leatherBrown"
                  _hover={{
                    borderColor: 'brand.antiqueGold'
                  }}
                  _focus={{
                    borderColor: 'brand.antiqueGold',
                    boxShadow: '0 0 0 1px brand.antiqueGold'
                  }}
                  h="60px"
                  fontSize="md"
                >
                  <option value="1">Concise - Brief Response</option>
                  <option value="2">Moderate - Balanced Length</option>
                  <option value="3">Verbose - Detailed Analysis</option>
                </Select>
              </FormControl>

              <Divider my={2} borderColor="brand.leatherBrown" />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel 
                  htmlFor="typewriter-toggle" 
                  mb="0"
                  fontSize="lg"
                  fontWeight="bold"
                  color="brand.deepBurgundy"
                >
                  Typewriter Effect
                </FormLabel>
                <Switch
                  id="typewriter-toggle"
                  isChecked={typewriterEnabled}
                  onChange={(e) => setTypewriterEnabled(e.target.checked)}
                  colorScheme="green"
                  size="lg"
                />
              </FormControl>

              <HStack spacing={4}>
                <Button
                  onClick={handleTransform}
                  isLoading={isLoading}
                  loadingText="Transforming..."
                  colorScheme="blue"
                  size="lg"
                  flex={1}
                >
                  Transform
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  flex={1}
                >
                  Clear
                </Button>
              </HStack>
            </VStack>
          </VStack>

          <VStack flex={1} spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="lg">Transformed Output</Text>
            <Box
              ref={outputRef}
              data-screenshot="true"
              bg="brand.agedParchment"
              p={8}
              borderRadius="md"
              minH="200px"
              border="1px"
              borderColor="brand.leatherBrown"
              position="relative"
              width="100%"
            >
              <Box
                fontFamily="Georgia, serif"
                fontSize="18px"
                lineHeight="1.8"
                color="black"
                whiteSpace="pre-wrap"
                mb={12}
              >
                {outputText}
              </Box>
              {outputText && (
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
                    colorScheme="blue"
                    onClick={handleScreenshot}
                  >
                    Download as Image
                  </Button>
                </HStack>
              )}
            </Box>
          </VStack>
        </VStack>
      </Box>
    );
  };

  return isAuthenticated ? <TextTransformer /> : <LandingPage />;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <TextTransformer /> : <LandingPage />;
}