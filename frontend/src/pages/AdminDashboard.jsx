import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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

function AdminDashboard() {
  const [transformations, setTransformations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTransformation, setSelectedTransformation] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transformationsResponse, usersResponse] = await Promise.all([
        authFetch('/api/admin/transformations'),
        authFetch('/api/admin/users')
      ]);

      if (!transformationsResponse.ok || !usersResponse.ok) {
        if (transformationsResponse.status === 403 || usersResponse.status === 403) {
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const transformationsData = await transformationsResponse.json();
      const usersData = await usersResponse.json();

      setTransformations(transformationsData);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleViewTransformation = (transformation) => {
    setSelectedTransformation(transformation);
    onOpen();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box p={6}>
      <Heading mb={8} color="brand.oxfordBlue">Admin Dashboard</Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Users</Tab>
          <Tab>All Transformations</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Admin</Th>
                  <Th>Created At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.is_admin ? 'Yes' : 'No'}</Td>
                    <Td>{formatDate(user.created_at)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={6}>
              {transformations.map((transformation) => (
                <Box
                  key={transformation.id}
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  border="1px"
                  borderColor="brand.antiqueGold"
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
                      <Text fontSize="sm" color="brand.forestGreen">
                        By: {transformation.username}
                      </Text>
                      <Badge colorScheme="purple">
                        Verbosity: {transformation.verbosity_level}
                      </Badge>
                    </Box>

                    <Text fontSize="sm" fontStyle="italic">
                      {formatDate(transformation.created_at)}
                    </Text>

                    <Box>
                      <Button
                        size="sm"
                        width="full"
                        onClick={() => handleViewTransformation(transformation)}
                        colorScheme="blue"
                      >
                        View Details
                      </Button>
                    </Box>
                  </VStack>
                </Box>
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transformation Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTransformation && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">User:</Text>
                  <Text>{selectedTransformation.username}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Created At:</Text>
                  <Text>{formatDate(selectedTransformation.created_at)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Verbosity Level:</Text>
                  <Text>{selectedTransformation.verbosity_level}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Original Text:</Text>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Text whiteSpace="pre-wrap">{selectedTransformation.input_text}</Text>
                  </Box>
                </Box>
                <Box>
                  <Text fontWeight="bold">Transformed Text:</Text>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Text whiteSpace="pre-wrap">{selectedTransformation.output_text}</Text>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AdminDashboard;
