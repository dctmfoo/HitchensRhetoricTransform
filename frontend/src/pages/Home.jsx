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
import html2canvas from 'html2canvas';

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
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for layout

      const canvas = await html2canvas(element, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: true,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
        width: element.scrollWidth,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-screenshot="true"]');
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.minHeight = element.scrollHeight + 'px';
          }
        }
      });

      // Convert and download
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
                p={8}
                minH="300px"
                width="100%"
                maxW="800px"
                mx="auto"
                position="relative"
                display="flex"
                flexDirection="column"
                borderRadius="md"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <Box
                  whiteSpace="pre-wrap"
                  fontFamily="Georgia, serif"
                  color="black"
                  fontSize="16px"
                  lineHeight="1.8"
                  pb={12}
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
                    bottom={8}
                    right={8}
                    width="150px"
                    height="50px"
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
