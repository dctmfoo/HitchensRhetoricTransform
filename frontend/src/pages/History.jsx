import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';

function History() {
  const [transformations, setTransformations] = useState([]);
  const [selectedTransformation, setSelectedTransformation] = useState(null);
  const toast = useToast();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalContentRef = useRef(null);

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    try {
      const response = await authFetch('/api/history');
      if (!response.ok) {
        throw new Error('Failed to fetch transformations');
      }
      const data = await response.json();
      setTransformations(data);
    } catch (error) {
      if (error.message === 'Unauthorized') {
        navigate('/login');
      }
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

  const handleScreenshot = async (transformation) => {
    try {
      const element = modalContentRef.current;
      
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
        link.download = `hitchens-transformation-${transformation.id}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Screenshot Saved',
          description: 'Your transformation has been saved as an image',
          status: 'success',
          duration: 2000
        });
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

  const handleView = (transformation) => {
    setSelectedTransformation(transformation);
    onOpen();
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
                <Box
                  position="relative"
                  bg="brand.agedParchment"
                  p={4}
                  borderRadius="md"
                  maxH="150px"
                  overflow="hidden"
                >
                  <Text noOfLines={3}>{transformation.input_text}</Text>
                </Box>
              </Box>

              <Box
                h="2px"
                bgGradient="linear(to-r, transparent, brand.antiqueGold, transparent)"
              />

              <Box>
                <Text fontWeight="bold" mb={2}>Hitchens' Version</Text>
                <Box
                  position="relative"
                  bg="brand.agedParchment"
                  p={4}
                  borderRadius="md"
                  maxH="150px"
                  overflow="hidden"
                >
                  <Text noOfLines={3}>{transformation.output_text}</Text>
                </Box>
              </Box>

              <HStack spacing={4} mt={2}>
                <Button
                  size="sm"
                  width="full"
                  onClick={() => handleView(transformation)}
                  colorScheme="blue"
                >
                  View Full
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text fontSize="lg" color="brand.oxfordBlue">
              Transformation Details
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTransformation && (
              <Box ref={modalContentRef} bg="white" p={6}>
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <HStack justify="space-between" mb={4}>
                      <Text fontSize="sm" fontStyle="italic" color="brand.forestGreen">
                        {new Date(selectedTransformation.created_at).toLocaleString()}
                      </Text>
                      <Badge colorScheme="purple">
                        Verbosity: {selectedTransformation.verbosity_level}
                      </Badge>
                    </HStack>

                    <Text fontWeight="bold" mb={2}>Original Text</Text>
                    <Box
                      position="relative"
                      bg="brand.agedParchment"
                      p={4}
                      borderRadius="md"
                      mb={4}
                    >
                      <Text whiteSpace="pre-wrap">{selectedTransformation.input_text}</Text>
                      <Button
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => handleCopy(selectedTransformation.input_text)}
                      >
                        Copy
                      </Button>
                    </Box>

                    <Box
                      h="2px"
                      bgGradient="linear(to-r, transparent, brand.antiqueGold, transparent)"
                      my={4}
                    />

                    <Text fontWeight="bold" mb={2}>Hitchens' Version</Text>
                    <Box
                      position="relative"
                      bg="brand.agedParchment"
                      p={4}
                      borderRadius="md"
                      mb={4}
                    >
                      <Text
                        whiteSpace="pre-wrap"
                        fontFamily="Georgia, serif"
                        fontSize="18px"
                        lineHeight="1.8"
                      >
                        {selectedTransformation.output_text}
                      </Text>
                      <Button
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => handleCopy(selectedTransformation.output_text)}
                      >
                        Copy
                      </Button>
                    </Box>

                    <Box
                      position="relative"
                      width="150px"
                      height="50px"
                      ml="auto"
                      mr={0}
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
                  </Box>

                  <Button
                    onClick={() => handleScreenshot(selectedTransformation)}
                    colorScheme="blue"
                    width="full"
                  >
                    Download as Image
                  </Button>
                </VStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default History;
