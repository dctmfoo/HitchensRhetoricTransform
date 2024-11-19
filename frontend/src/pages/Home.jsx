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
  HStack
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [verbosity, setVerbosity] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const typewriterRef = useRef(null);
  const outputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, []);

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
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: element.offsetWidth,
        height: element.scrollHeight
      });

      const link = document.createElement('a');
      link.download = 'hitchens-response.png';
      link.href = dataUrl;
      link.click();
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

            <Button
              onClick={handleTransform}
              isLoading={isLoading}
              loadingText="Transforming..."
              bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
              color="white"
              _hover={{
                bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)"
              }}
            >
              Transform
            </Button>
          </VStack>

          <VStack flex={1} spacing={4} align="stretch">
            <Text fontWeight="bold">Transformed Text</Text>
            <Box position="relative">
              <Box
                ref={outputRef}
                data-screenshot="true"
                bg="white"
                p={16}
                minH="400px"
                width="100%"
                maxW="800px"
                mx="auto"
                position="relative"
                display="flex"
                flexDirection="column"
                borderRadius="md"
              >
                <Box
                  whiteSpace="pre-wrap"
                  fontFamily="'Times New Roman', serif"
                  color="black"
                  fontSize="20px"
                  lineHeight="1.8"
                  pb={16}
                  flex="1"
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
                    bottom={16}
                    right={16}
                    width="200px"
                    height="70px"
                  >
                    <Box
                      as="img"
                      src="/static/images/hitchens-signature.png"
                      alt="Christopher Hitchens Signature"
                      width="100%"
                      height="100%"
                      objectFit="contain"
                      objectPosition="right bottom"
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
}

export default Home;
