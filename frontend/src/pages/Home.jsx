cription: error.message,
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
            <Text fontWeight="bold" fontSize="lg">Transformed Text</Text>
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
                    '& p': {
                      mb: 4
                    }
                  }}
                >
                  {outputText}
                </Box>
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
  return isAuthenticated ? <TextTransformer /> : <LandingPage />;
}