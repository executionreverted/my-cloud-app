import { createContext, useEffect, useState, useRef } from "react"
import { Room } from "../types/room.types"
import { useP2P } from "../hooks/useP2P"
import { ROOMS_AUTOPASS_KEY, ROOMS_AUTOPASS_METADATA_KEY, ROOMS_AUTOPASS_PATH } from "../config/storage"
import { toaster } from "../components/ui/toaster"
import { deterministicHex } from "../utils/deterministicHex"
import Hyperswarm from "hyperswarm"
import { ChatMessage, RoomAutobaseMetadata } from "../types/chat.types"
export interface RoomsContextType {
    rooms: Room[]
    setRooms: (rooms: Room[]) => void
    currentRoom: Room | null
    setCurrentRoom: (room: Room | null) => void
    createRoom: (room: Room) => Promise<Room>
    joinRoom: (roomTopic: string) => void
    activeRoom: Room | null
    setActiveRoom: (room: Room | null) => void
    prepareMessage: (message: ChatMessage) => string | null
    sendMessage: (roomId: string, message: ChatMessage) => Promise<boolean>
    generateRoomInvitationCode: (room: Room) => string
    joinRoomWithInvite: (invitationKey: string) => Promise<Room | null>
    getRoomMetadata: (roomId: string) => Promise<RoomAutobaseMetadata>
    getMessageFromRoom: (roomId: string, messageId: string) => Promise<ChatMessage | null>
    roomsMetadata: { [key: string]: RoomAutobaseMetadata }
}

export const RoomsContext = createContext<RoomsContextType>({
    rooms: [],
    setRooms: () => { },
    currentRoom: null,
    setCurrentRoom: () => { },
    createRoom: () => Promise.resolve(null) as Promise<Room>,
    joinRoom: () => { },
    activeRoom: null,
    setActiveRoom: () => { },
    prepareMessage: null as any,
    sendMessage: null as any,
    generateRoomInvitationCode: null as any,
    joinRoomWithInvite: null as any,
    getRoomMetadata: null as any,
    getMessageFromRoom: null as any,
    roomsMetadata: {}
})


export const RoomsProvider = ({ children }: { children: React.ReactNode }) => {
    const { getAutopass, swarms, encodeTopic, setActivePeers } = useP2P()
    const [rooms, setRooms] = useState<Room[]>([])
    const [roomsMetadata, setRoomsMetadata] = useState<{ [key: string]: RoomAutobaseMetadata }>({})
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [activeRoom, setActiveRoom] = useState<Room | null>(null)
    const messageCaches = useRef<{ [key: string]: { [key: string]: ChatMessage } }>({})
    useEffect(() => {
        getRoomsFromAutobase()
    }, [])

    async function getRoomsFromAutobase() {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH, getRoomsFromAutobase)
        const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
        console.log("rooms", rooms)
        setRooms(rooms || [])
        for (const room of rooms || []) {
            const roomDataAutopass = await getAutopass(ROOMS_AUTOPASS_PATH + `-${room.seed}`)
            const roomMetadata = await roomDataAutopass.get(ROOMS_AUTOPASS_METADATA_KEY)
            joinRoom(room.seed)
            setRoomsMetadata(prev => ({
                ...prev,
                [room.seed]: roomMetadata
            }))
        }
    }

    useEffect(() => {
        console.log("roomsMetadata", roomsMetadata)
    }, [roomsMetadata])

    async function createRoom(room: Room, customGreeting?: string) {
        try {
            console.log("creating room", room)
            const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
            console.log("roomAutopass", roomAutopass)
            const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
            console.log("rooms", rooms)
            await roomAutopass.add(ROOMS_AUTOPASS_KEY, [...rooms || [], room])
            console.log("rooms", rooms)
            // Create autobase for room
            const roomDataAutopass = await getAutopass(ROOMS_AUTOPASS_PATH + `-${room.seed}`)
            await roomDataAutopass.add(ROOMS_AUTOPASS_METADATA_KEY, {
                lastActive: Date.now(),
                messageLength: 0
            })

            toaster.success({
                title: "Your new room is created!",
                description: "You can now invite your peeriends to join the room",
                duration: 3000,
            })

            joinRoom(room.seed)
            const roomGreetMessage = await initRoomMessage(customGreeting)
            await saveMessageToRoom(room.seed, roomGreetMessage)
            return room
        } catch (error) {
            console.log("error", error)
            toaster.create({
                title: "Error",
                description: "Error creating room",
                type: "error",
                placement: "top"
            })
        }
    }

    async function joinRoomWithInvite(invitationKey: string, customGreeting?: string) {
        const room = JSON.parse(atob(invitationKey))
        if (!room.seed) {
            return
        }
        // check if room already exists
        const roomExists = rooms.find((r: Room) => r.seed === room.seed)
        if (roomExists) {
            toaster.create({
                title: "Room already exists",
                description: "You are already in this room",
                type: "error",
                placement: "top"
            })
            return roomExists
        }

        return await createRoom(room, customGreeting)
    }

    const generateRoomInvitationCode = (room: Room) => {
        const roomBase64 = btoa(JSON.stringify(room))
        return roomBase64
    }


    async function joinRoom(roomId: string): Promise<Hyperswarm.Discovery> {
        const topic = deterministicHex(roomId)
        const encodedTopic = await encodeTopic(topic)
        let swarm = swarms[roomId]

        if (swarm) {
            return swarm
        }

        swarm = new Hyperswarm()
        swarm.roomId = roomId

        swarm.on('connection', (conn) => {
            console.log("connection", conn)
        })

        swarm.on('update', () => {
            setActivePeers(prev => ({
                ...prev,
                [roomId]: swarm.connections.size
            }))
        })

        swarm.on('connection', (conn) => {
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)
            console.log('connection', conn)

            conn.on('data', async (data) => {
                const payload = JSON.parse(data.toString())
                if (payload.command === "message") {
                    const message = payload.message
                    console.log('received message from peer in room:', swarm.roomId, message)
                    await saveMessageToRoom(swarm.roomId, message)
                }
            })

            conn.on('error', e => console.log(`Connection error: ${e}`))
        })
        swarm.join(encodedTopic)

        swarms[roomId] = swarm
        return swarm
    }


    const prepareMessage = (message: ChatMessage) => {
        const sanitizedMessage = message.content.trim()
        if (sanitizedMessage.length === 0) {
            return null
        }

        const payload = {
            command: "message",
            message: {
                ...message,
                content: sanitizedMessage
            }
        }
        return JSON.stringify(payload)
    }


    const sendMessage = async (roomId: string, message: ChatMessage) => {
        const payload = prepareMessage(message)
        if (!payload) {
            return
        }
        const swarm = await joinRoom(roomId)
        const peers = [...swarm.connections]
        for (const peer of peers) peer.write(payload)

        await saveMessageToRoom(roomId, message)
        return true
    }

    const initRoomMessage = async (customGreeting?: string) => {
        return {
            content: customGreeting || "Welcome to your new room! Your pure p2p chat room is ready to use. Feel free to invite peers to join the room.",
            senderPublicKey: "0",
            timestamp: Date.now(),
            files: []
        }
    }

    const saveMessageToRoom = async (roomId: string, message: ChatMessage) => {
        console.log("saveMessageToRoom", roomId, message);
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH + `-${roomId}`)
        const meta = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY)
        console.log("meta", meta);
        const lastMessageId = meta.messageLength
        console.log("lastMessageId", lastMessageId);
        await roomAutopass.add(lastMessageId, message)
        const newLastMessageId = (parseInt(lastMessageId) + 1).toString()

        await roomAutopass.add(ROOMS_AUTOPASS_METADATA_KEY, {
            ...meta,
            messageLength: newLastMessageId,
            lastActive: Date.now(),
        })
        setRoomsMetadata(prev => ({
            ...prev,
            [roomId]: {
                ...meta,
                lastActive: Date.now(),
                messageLength: parseInt(newLastMessageId)
            }
        }))
        console.log("newLastMessageId", newLastMessageId);
    }

    const getRoomMetadata = async (roomId: string) => {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH + `-${roomId}`)
        const roomMetadata = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY)
        console.log("roomMetadata", roomId, roomMetadata);
        if (!roomMetadata) {
            const meta = {
                lastActive: Date.now(),
                messageLength: 0
            }
            await roomAutopass.add(ROOMS_AUTOPASS_METADATA_KEY, meta)
            return meta
        }
        return roomMetadata
    }

    const getMessageFromRoom = async (roomId: string, messageId: number) => {
        if (!roomId) {
            console.log("roomId is null", roomId);
            return null
        }


        if (messageCaches.current[roomId] && messageCaches.current[roomId][messageId]) {
            return messageCaches.current[roomId][messageId]
        }

        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH + `-${roomId}`)
        const message = await roomAutopass.get(messageId.toString())
        messageCaches.current[roomId] = messageCaches.current[roomId] || {}
        messageCaches.current[roomId][messageId] = message
        return message
    }

    return <RoomsContext.Provider value={{ rooms, setRooms, currentRoom, setCurrentRoom, createRoom, joinRoom, activeRoom, setActiveRoom, prepareMessage, sendMessage, generateRoomInvitationCode, joinRoomWithInvite, getRoomMetadata, getMessageFromRoom, roomsMetadata }}>{children}</RoomsContext.Provider>
}
