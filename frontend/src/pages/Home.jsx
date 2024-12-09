import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Switch,
  Flex,
  Icon,
  Badge,
  Divider
} from '@chakra-ui/react';
import { FaUserTie, FaUserAlt, FaChartLine, FaCopy, FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import * as htmlToImage from 'html-to-image';


const TextTransformer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [persona, setPersona] = useState('hitchens');
  const [verbosity, setVerbosity] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [typewriterEnabled, setTypewriterEnabled] = useState(true);
  const [lastTransformedText, setLastTransformedText] = useState('');
  const [apiProvider, setApiProvider] = useState('openai');
  const [availableProviders, setAvailableProviders] = useState([]);
  const outputRef = useRef(null);
  const toast = useToast();

  const generateFilename = (text) => {
    if (!text) return 'transformed.png';
    
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/config/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch API providers');
        }
        const data = await response.json();
        setAvailableProviders(data.providers);
        setApiProvider(data.default);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load API providers',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    };
    fetchProviders();
  }, []);
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after'
    ]);

    const textSample = text.split('.')[0].substring(0, 100);
    const words = textSample
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word) && !/^\d+$/.test(word))
      .slice(0, 3);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]
      .substring(0, 12);

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `transformed-${words.join('-')}-${timestamp}-${randomSuffix}.png`;
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setLastTransformedText('');
  };

  const typewriterEffect = (text) => {
    if (!typewriterEnabled) {
      setOutputText(text);
      return;
    }

    setOutputText('');
    let index = 0;
    const speed = 30;

    const type = () => {
      if (index < text.length) {
        setOutputText(prev => prev + text.charAt(index));
        index++;
        setTimeout(type, speed);
      }
    };

    type();
  };

  const handleTransform = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to transform',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          persona: persona,
          verbosity_level: parseInt(verbosity),
          api_provider: apiProvider
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transform text');
      }

      const data = await response.json();
      setLastTransformedText(data.transformed_text);
      typewriterEffect(data.transformed_text);
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

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        title: 'Error',
        description: 'No text available to copy',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: 'Success',
        description: 'Text copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy text',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  };

  const handleScreenshot = async () => {
    if (!outputText) {
      toast({
        title: 'Error',
        description: 'No text available for screenshot',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    
    try {
      const element = outputRef.current;
      
      if (!element) {
        throw new Error('Output element reference not found');
      }
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: '#FFFFFF'
      });
      
      const filename = generateFilename(outputText);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: 'Success',
        description: 'Screenshot saved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: 'Error',
        description: 'Failed to capture screenshot',
        status: 'error',
        duration: 2000,
        isClosable: true
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
          <HStack spacing={4} width="100%">
            <Box flex="1">
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
                icon={<Icon as={
                  persona === 'personal' ? FaUserAlt :
                  persona === 'hitchens' ? FaUserTie :
                  persona === 'trump' ? FaUserAlt :
                  FaChartLine
                } />}
                iconSize={24}
              >
            <option value="personal">Personal - Professional & Clear Communication</option>
            <option value="hitchens">Christopher Hitchens - Intellectual & Literary Analysis</option>
            <option value="trump">Donald Trump - Bold & Direct Communication</option>
            <option value="friedman">Milton Friedman - Economic & Analytical Perspective</option>
          </Select>
        </Box>
        <Box flex="1">
          <FormLabel
            htmlFor="api-select"
            fontSize="lg"
            fontWeight="bold"
            color="brand.deepBurgundy"
            mb={2}
          >
            API Provider
          </FormLabel>
          <Select
            id="api-select"
            value={apiProvider}
            onChange={(e) => setApiProvider(e.target.value)}
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
          >
            {availableProviders.map(provider => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)} API
              </option>
            ))}
          </Select>
        </Box>
      </HStack>
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
                  onClick={handleRetry}
                  isDisabled={!lastTransformedText || isLoading}
                  flex="1"
                  variant="outline"
                  borderColor="brand.deepBurgundy"
                  color="brand.deepBurgundy"
                  _hover={{
                    bg: 'brand.agedParchment'
                  }}
                >
                  Retry Effect
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
          </VStack>

          <VStack flex={1} spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="lg">Transformed Text</Text>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FaCopy} />}
                  onClick={handleCopy}
                  isDisabled={!outputText}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                >
                  Copy
                </Button>
                <Button
                  leftIcon={<Icon as={FaCamera} />}
                  onClick={handleScreenshot}
                  isDisabled={!outputText}
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                >
                  Screenshot
                </Button>
              </HStack>
            </HStack>
            
            <Box position="relative">
              <Box
                ref={outputRef}
                data-screenshot="true"
                bg="white"
                p={8}
                width="100%"
                minHeight="200px"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                border="1px solid #e2e8f0"
                borderRadius="md"
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
                <Box
                  position="relative"
                  zIndex={1}
                  fontFamily="Georgia, serif"
                  fontSize="18px"
                  lineHeight="1.8"
                  color="black"
                  whiteSpace="pre-wrap"
                  mb={12}
                  sx={{
                    '& p': {
                      mb: 4
                    }
                  }}
                >
                  {outputText}
                </Box>
                {outputText && persona && persona !== 'personal' && (
                  <Box
                    position="absolute"
                    bottom={8}
                    right={8}
                    width="150px"
                    height="50px"
                    zIndex={1}
                  >
                    <img
                      src={`/static/images/${persona}-signature.png`}
                      alt={`${persona.charAt(0).toUpperCase() + persona.slice(1)} Signature`}
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
            </Box>
          </VStack>
        </Flex>
      </VStack>
    </Box>
  );
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  return <TextTransformer />;
}
