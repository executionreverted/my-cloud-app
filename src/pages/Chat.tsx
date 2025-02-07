import {
    Box,
    Flex,
    VStack,
    HStack,
    IconButton,
    Text,
    Button,
    Input
} from '@chakra-ui/react';
import { IoAdd, IoSearch } from 'react-icons/io5';
import { Avatar } from '../components/ui/avatar';
import { useColorModeValue } from '../components/ui/color-mode';
const rooms = [
    { id: 1, name: 'General', avatar: '/path/to/general-avatar.jpg', online: 24 },
    { id: 2, name: 'Development', avatar: '/path/to/dev-avatar.jpg', online: 12 },
    { id: 3, name: 'Random', avatar: '/path/to/random-avatar.jpg', online: 8 },
    { id: 1, name: 'General', avatar: '/path/to/general-avatar.jpg', online: 24 },
    { id: 2, name: 'Development', avatar: '/path/to/dev-avatar.jpg', online: 12 },
    { id: 3, name: 'Random', avatar: '/path/to/random-avatar.jpg', online: 8 },
    { id: 1, name: 'General', avatar: '/path/to/general-avatar.jpg', online: 24 },
    { id: 2, name: 'Development', avatar: '/path/to/dev-avatar.jpg', online: 12 },
    { id: 3, name: 'Random', avatar: '/path/to/random-avatar.jpg', online: 8 },
    { id: 1, name: 'General', avatar: '/path/to/general-avatar.jpg', online: 24 },
    { id: 2, name: 'Development', avatar: '/path/to/dev-avatar.jpg', online: 12 },
    { id: 3, name: 'Random', avatar: '/path/to/random-avatar.jpg', online: 8 },

];

const App = () => {

    return (
        <Flex height="calc(100vh - 80px)" direction="row">
            {/* Left Panel */}
            <Box
                width="250px"
                bg={useColorModeValue('white', 'gray.900')}
                color="white"
                py={4}
                boxShadow="xl"
                height="100%"
            >
                <VStack h={"100%"} p={4} gap={4} align="start">
                    <HStack width="100%" justify="space-between">
                        <Text fontSize="2xl" fontWeight="bold">
                            Rooms
                        </Text>
                        <IconButton
                            aria-label="Create Room"
                            bg="teal.500"
                            color="white"
                        >
                            <IoAdd />
                        </IconButton>
                    </HStack>
                    {/* Room List */}
                    <Box
                        width="100%"
                        bg={useColorModeValue('gray.100', 'gray.800')}
                        borderRadius="md"
                        scrollbar={"hidden"}
                        p={2}
                        minH={"calc(100% - 120px)"}
                        maxHeight="60vh"
                        overflowY="scroll"
                    >
                        {rooms.map(room => (
                            <HStack
                                cursor={"pointer"}
                                key={room.id}
                                width="100%"
                                justify="space-between"
                                p={2}
                                borderRadius="md"
                                _hover={{ bg: 'gray.700' }}
                                gap={4}
                            >
                                {/* Room Avatar and Info */}
                                <Avatar name={room.name} src={room.avatar} />
                                <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold">{room.name}</Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {room.online} online
                                    </Text>
                                </Box>
                            </HStack>
                        ))}
                    </Box>
                    {/* Utilities */}
                    <HStack mt={"auto"} width="100%" justify="space-between">
                        <IconButton
                            aria-label="Search"
                            bg="transparent"
                            color="white"
                        >
                            <IoSearch />
                        </IconButton>
                        <Button colorScheme="teal" variant="outline">
                            Settings
                        </Button>
                    </HStack>
                </VStack>
            </Box>

            {/* Right Panel */}
            <Box ml={2} flex="1" bg={useColorModeValue('white', 'gray.900')} height="100%" display="flex" flexDirection="column">
                <Box
                    bg="teal.500"
                    p={4}
                    color="white"
                    mb={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <HStack>
                        <Avatar name="General" src="/path/to/general-avatar.jpg" />
                        <Text fontSize="xl" fontWeight="bold">
                            # General
                        </Text>
                    </HStack>
                    <Text color="whiteAlpha.800">24 online</Text>
                </Box>

                {/* Chat Messages */}
                <Box
                    flex="1"
                    bg={useColorModeValue('gray.100', 'gray.800')}
                    p={4}
                    mb={4}
                    overflowY="scroll"
                    boxShadow="md"
                >
                    <VStack gap={4} align="start">
                        <Box
                            p={3}
                            bg={useColorModeValue('gray.700', 'gray.200')}
                            width="100%"
                            maxWidth="80%"
                            alignSelf="flex-start"
                            display="flex"
                            alignItems="center"
                        >
                            <Avatar size="sm" name="User1" src="/path/to/user1-avatar.jpg" mr={2} />
                            <Text>User1: Hello, how are you?</Text>
                        </Box>
                        <Box
                            p={3}
                            bg={useColorModeValue('gray.100', 'gray.800')}
                            width="100%"
                            maxWidth="80%"
                            alignSelf="flex-end"
                            display="flex"
                            alignItems="center"
                        >
                            <Text>User2: I'm good, thanks! How about you?</Text>
                            <Avatar size="sm" name="User2" src="/path/to/user2-avatar.jpg" ml={2} />
                        </Box>
                        {/* More messages */}
                    </VStack>
                </Box>

                {/* Input Box */}
                <HStack gap={4} align="center">
                    <Input
                        placeholder="Type a message..."
                        size="lg"
                        borderRadius="md"
                        width="80%"
                    />
                    <Button colorScheme="teal" size="lg" borderRadius="md">
                        Send
                    </Button>
                </HStack>
            </Box>
        </Flex>
    );
};

export default App;
