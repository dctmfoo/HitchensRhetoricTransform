import {
  Box,
  Button,
  Flex,
  HStack,
  Select,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as htmlToImage from 'html-to-image';
// Landing page import removed as it doesn't exist in the current directory

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [verbosityLevel, setVerbosityLevel] = useState('medium');
  const [selectedPersona, setSelectedPersona] = useState('hitchens');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authFetch } = useAuth();
  const toast = useToast();
  const outputRef = useRef(null);

  const handleTransform = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to transform',
        status: 'error',
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          verbosity: verbosityLevel,
          persona: selectedPersona,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutputText(data.transformed_text);
      } else {
        throw new Error(data.error || 'Failed to transform text');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transform text',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
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
        const filename = `transformed-${Date.now()}.png`;
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'Image downloaded successfully',
          status: 'success',
          duration: 2000,
        });
      }, 'image/png', 1.0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image',
        status: 'error',
        duration: 2000,
      });
    }
  };

  const TextTransformer = () => (
    <Box maxW="1200px" mx="auto" p={4}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={6}
        align="stretch"
        justify="space-between"
      >
        <VStack flex={1} spacing={4} align="stretch">
          <Text fontWeight="bold" fontSize="lg">Input Text</Text>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to transform..."
            size="lg"
            minH="200px"
            resize="vertical"
          />
          
          <VStack spacing={4}>
            <Select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              mb={2}
            >
              <option value="hitchens">Christopher Hitchens</option>
              <option value="trump">Donald Trump</option>
              <option value="friedman">Milton Friedman</option>
            </Select>
            <Select
              value={verbosityLevel}
              onChange={(e) => setVerbosityLevel(e.target.value)}
            >
              <option value="low">Concise</option>
              <option value="medium">Moderate</option>
              <option value="high">Verbose</option>
            </Select>

            <HStack width="100%">
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
          <HStack justify="flex-end" spacing={2} mb={2}>
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
              isDisabled={!outputText}
            >
              Copy
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleScreenshot}
              isDisabled={!outputText}
            >
              Download as Image
            </Button>
          </HStack>
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
          </Box>
        </VStack>
      </Flex>
    </Box>
  );

  return isAuthenticated ? <TextTransformer /> : (
    <Box p={8} textAlign="center">
      <Text>Please log in to use the text transformer.</Text>
    </Box>
  );
}