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
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => (
  <Container maxW="container.xl" py={20}>
    <Stack spacing={12} align="center" textAlign="center">
      <Heading
        fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
        bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
        bgClip="text"
        letterSpacing="tight"
        mb={4}
      >
        Transform Your Writing into Hitchens' Style
      </Heading>

      <Text 
        fontSize={{ base: "xl", md: "2xl" }} 
        color="gray.700" 
        maxW="2xl"
        lineHeight="1.8"
      >
        Experience the power of AI-driven text transformation that captures the
        essence of Christopher Hitchens' distinctive writing style. Elevate your
        prose with intellectual depth and rhetorical brilliance.
      </Text>

      <Box
        w="full"
        maxW="3xl"
        p={10}
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="1px"
        borderColor="brand.fadedSepia"
      >
        <VStack spacing={8}>
          <Text 
            fontSize="2xl" 
            fontStyle="italic" 
            color="gray.800"
            fontFamily="Georgia, serif"
          >
            "The measure of a decent human being is how he or she treats the
            defenseless."
          </Text>
          <Text 
            fontSize="lg"
            fontWeight="semibold" 
            color="brand.deepBurgundy"
          >
            — Christopher Hitchens
          </Text>
        </VStack>
      </Box>

      <Stack 
        direction={{ base: "column", md: "row" }} 
        spacing={6}
        mt={6}
      >
        <Button
          as={RouterLink}
          to="/login"
          size="lg"
          fontSize="xl"
          py={8}
          px={12}
          bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
          color="white"
          _hover={{
            bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s"
        >
          Sign In to Transform
        </Button>
        <Button
          as={RouterLink}
          to="/register"
          size="lg"
          fontSize="xl"
          py={8}
          px={12}
          variant="outline"
          borderColor="brand.deepBurgundy"
          borderWidth="2px"
          color="brand.deepBurgundy"
          _hover={{
            bg: "brand.agedParchment",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s"
        >
          Create Account
        </Button>
      </Stack>
    </Stack>
  </Container>
);

const TextTransformer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [verbosity, setVerbosity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [lastTransformedText, setLastTransformedText] = useState("");
  const [typewriterEnabled, setTypewriterEnabled] = useState(true);
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
    setInputText("");
    setOutputText("");
    setLastTransformedText("");
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    toast({
      title: "Cleared",
      description: "Input and output fields have been reset",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top",
    });
  };

  const generateFilename = (text) => {
    console.log("Starting filename generation...");

    if (!text) {
      console.warn("No text provided for filename generation");
      return "hitchens-transformed.png";
    }

    const commonWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at",
      "to", "for", "of", "with", "by", "from", "up", "about",
      "into", "over", "after",
    ]);

    const textSample = text.split(".")[0].substring(0, 100);
    console.log("Text sample for filename:", textSample);

    const words = textSample
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !commonWords.has(word) &&
          !/^\d+$/.test(word),
      )
      .slice(0, 3);

    console.log("Selected words for filename:", words);

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]
      .substring(0, 12);

    const randomSuffix = Math.random().toString(36).substring(2, 6);

    const filename = `hitchens-${words.join("-")}-${timestamp}-${randomSuffix}.png`;
    console.log("Generated filename:", filename);

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
    setOutputText("");

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
        title: "Error",
        description: "Please enter some text to transform",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch("/api/transform", {
        method: "POST",
        body: JSON.stringify({
          text: inputText,
          verbosity: verbosity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastTransformedText(data.transformed_text);
        typewriterEffect(data.transformed_text);
      } else {
        throw new Error(
          data.error || "An error occurred during transformation",
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
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
      console.log("No output text available for screenshot");
      return;
    }

    try {
      console.log("Starting screenshot capture...");
      const element = outputRef.current;

      if (!element) {
        console.error("Output element reference not found");
        return;
      }

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: "#FFFFFF",
      });

      const filename = generateFilename(outputText);
      console.log("Generated filename:", filename);

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Screenshot saved",
        description: "The image has been downloaded successfully",
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        status: "error",
        duration: 2000,
        position: "top",
      });
    }
  };

  return (
    <Box
      bg="white"
      p={10}
      borderRadius="xl"
      boxShadow="lg"
      border="1px"
      borderColor="brand.fadedSepia"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: 0,
        bg: 'url("/static/images/paper-texture.svg")',
      }}
    >
      <VStack spacing={8} position="relative" zIndex={1}>
        <Heading 
          textAlign="center" 
          color="brand.oxfordBlue"
          fontSize={{ base: "3xl", md: "4xl" }}
          letterSpacing="tight"
        >
          Hitchens Style Transformer
        </Heading>

        <Flex w="100%" gap={10} direction={{ base: "column", md: "row" }}>
          <VStack flex={1} spacing={6} align="stretch">
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              color="brand.oxfordBlue"
            >
              Input Text
            </Text>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              minH="250px"
              bg="brand.agedParchment"
              border="2px"
              borderColor="brand.leatherBrown"
              fontSize="lg"
              p={4}
              _focus={{
                borderColor: "brand.antiqueGold",
                boxShadow: "0 0 0 1px brand.antiqueGold",
              }}
              _hover={{
                borderColor: "brand.antiqueGold",
              }}
            />

            <Select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value)}
              bg="white"
              size="lg"
              borderColor="brand.leatherBrown"
              _hover={{
                borderColor: "brand.antiqueGold",
              }}
            >
              <option value="1">Concise</option>
              <option value="2">Moderate</option>
              <option value="3">Verbose</option>
            </Select>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bg="white"
              p={4}
              borderRadius="md"
              border="1px"
              borderColor="brand.fadedSepia"
            >
              <FormLabel 
                htmlFor="typewriter-toggle" 
                mb="0"
                fontSize="lg"
                color="brand.oxfordBlue"
              >
                Typewriter Effect
              </FormLabel>
              <Switch
                id="typewriter-toggle"
                isChecked={typewriterEnabled}
                onChange={(e) => setTypewriterEnabled(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
            </FormControl>

            <HStack spacing={4}>
              <Button
                onClick={handleTransform}
                isLoading={isLoading}
                loadingText="Transforming..."
                flex="1"
                size="lg"
                fontSize="lg"
                py={6}
                bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
                color="white"
                _hover={{
                  bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                Transform
              </Button>
              <Button
                onClick={handleRetry}
                isDisabled={!lastTransformedText || isLoading}
                flex="1"
                size="lg"
                fontSize="lg"
                py={6}
                variant="outline"
                borderColor="brand.deepBurgundy"
                borderWidth="2px"
                color="brand.deepBurgundy"
                _hover={{
                  bg: "brand.agedParchment",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                Retry Transformation
              </Button>
              <Button
                onClick={handleClear}
                isDisabled={isLoading || (!inputText && !outputText)}
                flex="1"
                size="lg"
                fontSize="lg"
                py={6}
                variant="outline"
                borderColor="brand.deepBurgundy"
                borderWidth="2px"
                color="brand.deepBurgundy"
                _hover={{
                  bg: "brand.agedParchment",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                Clear
              </Button>
            </HStack>
          </VStack>

          <VStack flex={1} spacing={6} align="stretch">
            <Text 
              fontSize="lg" 
              fontWeight="bold"
              color="brand.oxfordBlue"
            >
              Transformed Text
            </Text>
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
                border="2px solid"
                borderColor="brand.fadedSepia"
                borderRadius="xl"
                mx="auto"
                position="relative"
                boxShadow="xl"
              >
                <Box
                  fontFamily="Georgia, serif"
                  fontSize="xl"
                  lineHeight="1.8"
                  color="gray.800"
                  whiteSpace="pre-wrap"
                  mb={12}
                  sx={{
                    "&::after": {
                      content: '"|"',
                      animation: "blink 1s step-end infinite",
                      display: isLoading ? "none" : "inline",
                    },
                    "@keyframes blink": {
                      "from, to": { opacity: 1 },
                      "50%": { opacity: 0 },
                    },
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
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "right bottom",
                      }}
                    />
                  </Box>
                )}
              </Box>
              <HStack 
                position="absolute" 
                top={4} 
                right={4} 
                spacing={3}
                bg="white"
                p={2}
                borderRadius="md"
                boxShadow="md"
              >
                <Button
                  size="md"
                  onClick={() => {
                    navigator.clipboard.writeText(outputText);
                    toast({
                      title: "Copied!",
                      status: "success",
                      duration: 2000,
                      position: "top",
                    });
                  }}
                  colorScheme="gray"
                  fontWeight="bold"
                >
                  Copy
                </Button>
                <Button
                  size="md"
                  onClick={handleScreenshot}
                  isDisabled={!outputText}
                  bgGradient="linear(145deg, brand.deepBurgundy, brand.mutedCrimson)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(145deg, brand.mutedCrimson, brand.deepBurgundy)",
                  }}
                  fontWeight="bold"
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
        <Text fontSize="xl" color="brand.oxfordBlue">
          Loading...
        </Text>
      </Container>
    );
  }

  return isAuthenticated ? <TextTransformer /> : <LandingPage />;
}

export default Home;