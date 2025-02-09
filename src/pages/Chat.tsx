import {
    Box,
    Flex,
    VStack,
    HStack,
    IconButton,
    Text,
    Button,
    Textarea,
    Input
} from '@chakra-ui/react';
import {
    MenuTrigger,
    MenuItem,
    MenuRoot,
    MenuContent,
} from "../components/ui/menu"
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react"
import { IoAdd, IoSearch } from 'react-icons/io5';
import { Avatar } from '../components/ui/avatar';
import { useColorModeValue } from '../components/ui/color-mode';
import { useRoom } from '../hooks/useRoom';
import CreateRoom from '../components/Rooms/CreateRoom';
import useUI from '../hooks/useUI';
import { BASE_AVATAR_URI } from '../config/constants';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, ChatRoom } from '../types/chat.types';
import { useSeed } from '../hooks/useSeed';
import { toaster } from '../components/ui/toaster';
import { FiSend, FiUserPlus } from 'react-icons/fi';
import { PiDotsThreeCircle, PiVideoConferenceThin } from 'react-icons/pi';
import MessageList from '../components/Rooms/MessageList';
import { FiFolderPlus, FiSmile } from 'react-icons/fi';
import { DialogActionTrigger, DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogCloseTrigger } from '../components/ui/dialog';
import { Field } from '../components/ui/field';
import { useP2P } from '../hooks/useP2P';
import PeersInRoom from '../components/Rooms/PeersInRoom';
import useClickOutside from '../hooks/useOnClickOutside';
import DeleteRoom from '../components/Rooms/DeleteRoom';
import AudioCall from '../components/Rooms/AudioCall';
const App = () => {
    const { seedPhrase, wallet } = useSeed()
    const { activePeers } = useP2P()
    const { syncInProgress, syncedRooms, rooms, roomsMetadata, activeRoom, setActiveRoom, sendMessage, generateRoomInvitationCode, getRoomMetadata, joinRoomWithInvite } = useRoom()
    const { setIsCreateRoomDialogOpen, isJoinRoomDialogOpen, setIsJoinRoomDialogOpen } = useUI()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [invitationCode, setInvitationCode] = useState("")

    const [roomToDelete, setRoomToDelete] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [voiceChatRoom, setVoiceChatRoom] = useState("")

    const emojiPickerContainerRef = useClickOutside(() => setShowEmojiPicker(false))
    const messageCount = useMemo(() => {
        if (!activeRoom) {
            return 0
        }
        return parseInt(roomsMetadata[activeRoom.seed]?.messageLength || "0")
    }, [activeRoom?.seed, roomsMetadata])

    const sendInRoom = async () => {
        if (!activeRoom || !wallet) {
            return
        }
        const message: ChatMessage = {
            content: newMessage,
            senderPublicKey: wallet?.publicKey,
            timestamp: Date.now(),
            files: []
        }

        const success = await sendMessage(activeRoom?.seed || "", message)
        // toaster.create({
        //     title: "Message sent",
        //     description: "Message sent successfully",
        //     type: "success"
        // })

        setNewMessage("")
        setFiles([])
    }

    const createRoomInvitation = async () => {
        if (!activeRoom) {
            return
        }
        const code = await generateRoomInvitationCode(activeRoom)
        navigator.clipboard.writeText(code)
        toaster.create({
            title: "Invitation code copied to clipboard",
            description: `Share this code with your friends to invite them to ${activeRoom.name}`,
            type: "success"
        })
    }

    useEffect(() => {
        if (activeRoom) {
            getRoomMetadata(activeRoom.seed).then((metadata) => {
            })
        }
    }, [activeRoom])

    const handleJoinRoom = async () => {
        if (invitationCode.length === 0) {
            return
        }
        try {
            const room = await joinRoomWithInvite(invitationCode, "Wohooo! You've just joined the room!")
            if (room) {
                setActiveRoom(room)
            }
            setIsJoinRoomDialogOpen(false)
        } catch (error) {
            console.error(error)
            toaster.create({
                title: "Error joining room",
                description: "Please try again",
            })
        }
    }

    return (
        <Flex height="calc(100vh - 100px)" direction="row">
            <CreateRoom />
            {(isDeleteOpen && roomToDelete) && <DeleteRoom setIsOpen={setIsDeleteOpen} setRoomToDelete={setRoomToDelete} room={roomToDelete} open={isDeleteOpen}>
                Delete Room
            </DeleteRoom>}
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
                            onClick={() => setIsCreateRoomDialogOpen(true)}
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
                        gap={2}
                    >
                        {rooms.map(room => (
                            <HStack
                                cursor={"pointer"}
                                key={room.seed}
                                justify="space-between"
                                p={2}
                                borderRadius="md"
                                userSelect="none"
                                bg={activeRoom?.seed == room.seed ? 'gray.500' : ""}
                                _hover={{ bg: 'gray.700' }}
                                gap={4}
                                w={"full"}
                            >
                                <HStack
                                    maxW={"80%"}
                                    onClick={() => setActiveRoom(room)}
                                    justify={"space-between"}>
                                    <Avatar name={room.name?.substring(0, 10)} src={`${BASE_AVATAR_URI}/${room.image}.jpg`} />
                                    <Box flex="1" textAlign="left">
                                        <Text fontSize={"sm"} fontWeight="bold">{room.name.length > 14 ? room.name?.substring(0, 14) + '...' : room.name}</Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {activePeers[room.seed] || 0} online
                                        </Text>
                                    </Box>
                                </HStack>
                                <MenuRoot onSelect={(f) => {
                                    if (f.value == "delete") {
                                        setIsDeleteOpen(true)
                                        setRoomToDelete(room)
                                    }
                                }} positioning={{ placement: "right-start" }}>
                                    <MenuTrigger asChild>
                                        <IconButton colorPalette={"gray"} variant="ghost" size="xs">
                                            <PiDotsThreeCircle />
                                        </IconButton>
                                    </MenuTrigger>
                                    <MenuContent>
                                        <MenuItem value="delete">
                                            Delete
                                        </MenuItem>
                                    </MenuContent>
                                </MenuRoot>
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
                        <DialogRoot
                            key={"join-room-dialog"}
                            placement={"center"}
                            motionPreset="slide-in-bottom"
                            open={isJoinRoomDialogOpen}
                            onOpenChange={(e) => setIsJoinRoomDialogOpen(e.open)}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Join Room</DialogTitle>
                                </DialogHeader>
                                <DialogBody>
                                    <p>
                                        Use the invitation code to join a room
                                    </p>
                                    <Field label="Invitation Code">
                                        <Input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="Invitation Code" />
                                    </Field>
                                </DialogBody>
                                <DialogFooter>
                                    <DialogActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogActionTrigger>
                                    <Button onClick={handleJoinRoom}>Join</Button>
                                </DialogFooter>
                                <DialogCloseTrigger />
                            </DialogContent>
                        </DialogRoot>
                        <IconButton onClick={() => setIsJoinRoomDialogOpen(true)} colorScheme="teal" variant="outline">
                            <FiFolderPlus />
                        </IconButton>
                    </HStack>
                </VStack>
            </Box>

            {/* Right Panel */}
            <Box gap={"1em"} ml={2} flex="1" bg={useColorModeValue('white', 'gray.900')} height="100%" display="flex" flexDirection="column">
                <Box
                    flexGrow={1}
                    bg="teal.500"
                    p={4}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <HStack>
                        <Avatar name="General" src="/path/to/general-avatar.jpg" />
                        <Text fontSize="xl" fontWeight="bold">
                            # {activeRoom?.name || "Join a room to start chatting"}
                        </Text>
                    </HStack>
                    {
                        activeRoom && <>
                            <AudioCall />
                            
                            <PeersInRoom></PeersInRoom>
                            <IconButton size={"md"} disabled={!activeRoom} onClick={createRoomInvitation} rounded={"full"} colorScheme="teal">
                                <FiUserPlus />
                            </IconButton></>
                    }
                </Box>

                <Box
                    flexGrow={20}
                    bg={useColorModeValue('gray.100', 'gray.800')}
                    p={4}
                    h={"100%"}
                    maxHeight="calc(80% - 72px)"
                    overflow={"hidden"}
                    boxShadow="md"
                >
                    <VStack overflow={"hidden"} h={"100%"} gap={4} align="start">
                        <MessageList roomId={activeRoom?.seed || ""} messageLength={messageCount} />
                    </VStack>
                </Box>

                {/* Input Box */}
                <HStack position={"relative"} flexGrow={1} mt={"auto"} opacity={activeRoom ? 1 : 0} gap={4} align="flex-start" justifyContent={"space-between"}>
                    {showEmojiPicker &&
                        <Box ref={emojiPickerContainerRef} position={"absolute"} right={"0"} top={"-450px"}>
                            <EmojiPicker theme={Theme.AUTO} emojiStyle={EmojiStyle.NATIVE} onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} />
                        </Box>}
                    <Textarea
                        resize={"none"}
                        h={"100%"}
                        rows={3}
                        placeholder="Type a message..."
                        size="lg"
                        width="100%"
                        value={newMessage}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                if (newMessage.length === 0 || syncInProgress[activeRoom?.seed || ""]) {
                                    return
                                }
                                e.preventDefault()
                                sendInRoom()
                            }
                        }}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <VStack>
                        <IconButton disabled={newMessage.length === 0 || syncInProgress[activeRoom?.seed || ""]} rounded={"full"} my={"auto"} alignSelf={"center"} justifySelf={"flex-start"} onClick={sendInRoom} colorScheme="teal" size="lg">
                            <FiSend />
                        </IconButton>
                        <IconButton rounded={"full"} my={"auto"} alignSelf={"center"} justifySelf={"flex-start"} onClick={() => setShowEmojiPicker(true)} colorScheme="teal" size="lg">
                            <FiSmile />
                        </IconButton>
                    </VStack>
                </HStack>
            </Box>
        </Flex >
    );
};

export default App;
