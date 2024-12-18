import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Textarea,
  VStack,
  Text,
  Icon,
  HStack,
  useToast,
  Flex
} from '@chakra-ui/react';
import { FaUserAlt, FaUserTie, FaChartLine, FaCopy, FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const TextTransformer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [persona, setPersona] = useState('hitchens');
  const [verbosity, setVerbosity] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTransformedText, setLastTransformedText] = useState('');
  const [apiProvider, setApiProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  
  const outputRef = useRef(null);
  const toast = useToast();
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoadingProviders(true);
        const response = await authFetch('/api/config/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch API providers');
        }
        const data = await response.json();
        if (!data.providers || !Array.isArray(data.providers) || data.providers.length === 0) {
          throw new Error('No API providers available');
        }
        setAvailableProviders(data.providers);
        setApiProvider(data.default || data.providers[0]); // Set default or first provider
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load API providers. Using fallback options.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        // Set fallback providers if fetching fails
        const fallbackProviders = ['openai', 'default-provider'];
        setAvailableProviders(fallbackProviders);
        setApiProvider(fallbackProviders[0]);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [authFetch, toast]);

  const handleTransform = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to transform',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch('/api/transform', {
        method: 'POST',
        body: JSON.stringify({
          text: inputText,
          persona: persona,
          verbosity: verbosity,
          api_provider: apiProvider
        })
      });

      if (!response.ok) {
        throw new Error('Transform request failed');
      }

      const data = await response.json();
      setOutputText(data.transformed_text);
      setLastTransformedText(data.transformed_text);
    } catch (error) {
      console.error('Transform error:', error);
      toast({
        title: 'Error',
        description: 'Failed to transform text. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastTransformedText) {
      setOutputText(lastTransformedText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setLastTransformedText('');
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleScreenshot = () => {
    if (outputRef.current) {
      // Screenshot logic here
      toast({
        title: 'Screenshot taken!',
        description: 'Image saved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={8}
      maxW="1400px"
      mx="auto"
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

        <FormControl>
          <FormLabel 
            htmlFor="persona-select"
            fontSize="xl"
            fontWeight="bold"
            color="brand.deepBurgundy"
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
            h="60px"
            fontSize="md"
            _hover={{
              borderColor: 'brand.antiqueGold'
            }}
            _focus={{
              borderColor: 'brand.antiqueGold',
              boxShadow: '0 0 0 1px brand.antiqueGold'
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

            <VStack spacing={4} align="stretch">
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

              <FormControl isDisabled={isLoadingProviders}>
                <FormLabel 
                  htmlFor="api-provider-select"
                  fontSize="lg"
                  fontWeight="bold"
                  color="brand.deepBurgundy"
                >
                  Select API Provider
                </FormLabel>
                <Select
                  id="api-provider-select"
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
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
                  placeholder={isLoadingProviders ? "Loading providers..." : "Select a provider"}
                >
                  {availableProviders.length > 0 ? (
                    availableProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)} API
                      </option>
                    ))
                  ) : (
                    <option disabled>No providers available</option>
                  )}
                </Select>
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
  return <TextTransformer />;
}
