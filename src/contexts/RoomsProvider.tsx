import { createContext, useEffect, useState, useRef } from "react"
import { Room } from "../types/room.types"
import { useP2P } from "../hooks/useP2P"
import { PEER_PROFILES_BEE, ROOMS_AUTOPASS_KEY, ROOMS_AUTOPASS_METADATA_KEY, ROOMS_AUTOPASS_PATH } from "../config/storage"
import { toaster } from "../components/ui/toaster"
import { deterministicHex } from "../utils/deterministicHex"
import Hyperswarm from "hyperswarm"
import { ChatMessage, RoomAutobaseMetadata } from "../types/chat.types"
import useUser from "../hooks/useUser"
import { Buffer } from "buffer"
import NotificationSound from "../assets/notification.mp3";
import { Profile } from "../types/identity.types"
import { useSeed } from "../hooks/useSeed"

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
    joinRoomWithInvite: (invitationKey: string, customGreeting?: string) => Promise<Room | null>
    getRoomMetadata: (roomId: string) => Promise<RoomAutobaseMetadata>
    getMessageFromRoom: (roomId: string, messageId: string) => Promise<ChatMessage | null>
    roomsMetadata: { [key: string]: RoomAutobaseMetadata }
    syncInProgress: { [key: string]: boolean }
    syncedRooms: { [key: string]: boolean },
    peersInRooms: { [key: string]: string[] },
    peerIdentities: { [key: string]: Profile },
    getPeerIdentity: (pubKey: string) => Promise<Profile>,
    deleteRoom: (roomId: string) => Promise<void>
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
    roomsMetadata: {},
    syncInProgress: {} as { [key: string]: boolean },
    syncedRooms: {} as { [key: string]: boolean },
    peersInRooms: {},
    peerIdentities: {},
    getPeerIdentity: () => Promise.resolve(null) as Promise<Profile>,
    deleteRoom: null
})

export const RoomsProvider = ({ children }: { children: React.ReactNode }) => {
    const { } = useSeed()
    const { getBee, getAutopass, swarms, encodeTopic, setActivePeers, getRPC, } = useP2P()
    const { getProfile, wallet } = useUser()
    const [rooms, setRooms] = useState<Room[]>([])
    const [roomsMetadata, setRoomsMetadata] = useState<{ [key: string]: RoomAutobaseMetadata }>({})
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [activeRoom, setActiveRoom] = useState<Room | null>(null)
    const [peersInRooms, setPeersInRooms] = useState<{ [key: string]: string[] }>({})
    const messageCaches = useRef<{ [key: string]: { [key: string]: ChatMessage } }>({})
    const syncedRooms = useRef<{ [key: string]: boolean }>({})
    const syncInProgress = useRef<{ [key: string]: boolean }>({})
    const audioPlayerRef = useRef(null)
    const [peerIdentities, setPeerIdentities] = useState<{ [key: string]: Profile }>({})
    const [roomLastSeensMessageIds, setRoomLastSeenMessageIds] = useState(0)

    useEffect(() => {
        if (!wallet) {
            return
        }
        getRoomsFromAutobase()
    }, [wallet])

    async function getPeerIdentity(pubKey: string) {
        const exists = Object.values(peerIdentities).find(v => v.pubKey == pubKey)
        if (exists) {
            return exists
        }
        const bee = await getBee(PEER_PROFILES_BEE)
        const profile = await bee.get(pubKey)
        if (profile && profile.value) {
            console.log("Peer: ", profile)
            const parsed = JSON.parse(profile.value)
            setPeerIdentities((p) => ({
                ...p,
                [pubKey]: parsed
            }))
            return parsed
        }
        return null
    }

    async function getRoomsFromAutobase() {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH, getRoomsFromAutobase)
        const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
        setRooms(rooms || [])
        for (const room of rooms || []) {
            const roomMetadata = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY + room.seed)
            joinRoom(room.seed)
            setRoomsMetadata(prev => ({
                ...prev,
                [room.seed]: roomMetadata
            }))
        }
        return rooms;
    }

    async function createRoom(room: Room, customGreeting?: string) {
        try {
            const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
            const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
            await roomAutopass.add(ROOMS_AUTOPASS_KEY, [...rooms || [], room])
            // Create autobase for room
            await roomAutopass.add(ROOMS_AUTOPASS_METADATA_KEY + room.seed, {
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
            setActiveRoom(room)
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

    async function attemptToSync(rpc: any, roomId: string, _myMessageLength: number, _peerMessageLength: number) {
        if (syncInProgress.current[roomId]) {
            return
        }
        syncInProgress.current[roomId] = true;
        let myMessageLength = _myMessageLength;
        let peerMessageLength = _peerMessageLength;
        while (myMessageLength < peerMessageLength) {
            try {
                const reply = await rpc.request("askMessage", Buffer.from(JSON.stringify({ messageId: myMessageLength })))
                const message = JSON.parse(reply)

                if (!message || !message.content || !message.senderPublicKey || !message.timestamp) {
                    myMessageLength++
                    continue
                }
                const existingMessage = await getMessageFromRoom(roomId, myMessageLength)
                if (existingMessage) {
                    myMessageLength++
                    await new Promise(resolve => setTimeout(resolve, 300))
                    continue
                } else {
                    await saveMessageToRoom(roomId, message, true, myMessageLength)
                    myMessageLength++
                }
                await new Promise(resolve => setTimeout(resolve, 300))
            } catch (error) {
                console.log("error", error)
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
        if (myMessageLength >= peerMessageLength) {
            const roomMeta = await getAutopass(ROOMS_AUTOPASS_PATH)
            roomMeta.add(ROOMS_AUTOPASS_METADATA_KEY + roomId, {
                messageLength: myMessageLength,
                lastActive: Date.now()
            })
            syncInProgress.current[roomId] = false
            syncedRooms.current[roomId] = true

            setRoomsMetadata(prev => ({
                ...prev,
                [roomId]: {
                    messageLength: myMessageLength.toString(),
                    lastActive: Date.now().toString()
                }
            }))

        } else {
            syncInProgress.current[roomId] = false
            attemptToSync(rpc, roomId, myMessageLength, peerMessageLength)
        }

    }

    async function deleteRoom(roomId: string) {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
        const meta: RoomAutobaseMetadata = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY + roomId)
        console.log("delete", meta)
        console.log(roomId)
        const messageLengthOfRoom = parseInt(meta.messageLength)
        for (let index = 0; index < messageLengthOfRoom; index++) {
            await roomAutopass.remove(roomId + index.toString())
            console.log('Deleted message of room:', roomId, index)
        }

        await roomAutopass.remove(ROOMS_AUTOPASS_METADATA_KEY + roomId)
        const allRooms: Room[] = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
        const newRooms = allRooms.filter(r => r.seed !== roomId)
        await roomAutopass.add(ROOMS_AUTOPASS_KEY, newRooms)
        setRooms(newRooms)
        if (activeRoom?.seed == roomId) {
            setActiveRoom(newRooms[0] || null)
        }
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



        swarm.on('connection', async (conn) => {
            const rpc = await getRPC(conn)
            const connId = conn.publicKey.toString("hex")
            rpc.respond('whoareyou', async req => {
                const profile = await getProfile()
                return Buffer.from(JSON.stringify(profile))
            })
            rpc.respond('updateProfile', async req => {
                const updatedProfile = JSON.parse(req as any)
                const bee = await getBee(PEER_PROFILES_BEE)
                await bee.put(updatedProfile.pubKey, JSON.stringify(updatedProfile))
                setPeerIdentities(p => ({
                    ...p,
                    [updatedProfile.pubKey]: updatedProfile
                }))
                setPeerIdentities(p => ({
                    ...p,
                    [connId]: updatedProfile
                }))
            })

            // rpc.respond('askRoomLength', async req => {
            //     const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
            //     const meta = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY + swarm.roomId)
            //     return Buffer.from(JSON.stringify(meta))
            // })

            rpc.respond('askMessage', async req => {
                if (!req) {
                    return null
                }
                const peerAskingForMessage = JSON.parse(req.toString())
                const messageId = peerAskingForMessage.messageId
                const message = await getMessageFromRoom(swarm.roomId, messageId)
                const stringifiedMessage = JSON.stringify(message)
                console.log("stringifiedMessage", stringifiedMessage)
                return Buffer.from(stringifiedMessage)
            })

            const whoIsThereResponse = await rpc.request('whoareyou')
            console.log("whoIsThereResponse", whoIsThereResponse.toString("utf8").trim())
            const whoIsThere = JSON.parse(whoIsThereResponse as any)
            const peersBee = await getBee(PEER_PROFILES_BEE)
            console.log("Updating bee profile: ", whoIsThere)
            await peersBee.put(whoIsThere.pubKey, JSON.stringify(whoIsThere))

            setPeerIdentities(p => ({
                ...p,
                [connId]: whoIsThere
            }))
            setPeerIdentities(p => ({
                ...p,
                [whoIsThere.pubKey]: whoIsThere
            }))
            console.log("whoIsThere", whoIsThere)


            setPeersInRooms((p) => ({
                ...p,
                [swarm.roomId]: [...p[swarm.roomId] || [], connId]
            }))
            conn.on('data', async (data) => {
                if (!data) {
                    return
                }
                try {
                    const payload = JSON.parse(data.toString())
                    if (payload.command === "message") {
                        const message = payload.message
                        console.log('received message from peer in room:', swarm.roomId, message)
                        await saveMessageToRoom(swarm.roomId, message)
                        if (window?.Notification) {
                            console.log(swarm.roomId, rooms)
                            const rooms$ = await getRoomsFromAutobase()
                            const room = rooms$.find(r => r.seed == swarm.roomId)
                            console.log(rooms$);
                            new Notification(`${room?.name || "Message from peer"}: ${payload.message.content}`, { silent: true })
                            audioPlayerRef.current.play();
                        }
                    }

                } catch (error) {
                    console.log("error", error)
                }
            })

            conn.on('error', e => {
                console.log(`Connection error: ${e}`)
                setPeersInRooms((p) => ({
                    ...p,
                    [swarm.roomId]: [...(peersInRooms[swarm.roomId] || [])].filter(m => m !== conn.remotePublicKey.toString("hex"))
                }))
            })

            // const peerMessageLengthResponse = await rpc.request('askRoomLength')
            // const peerRoomMetadata = (JSON.parse(peerMessageLengthResponse))
            // const peerMessageLength = parseInt(peerRoomMetadata.messageLength)
            // const myLocalRoomMetadata = await getRoomMetadata(swarm.roomId)
            // if (parseInt(myLocalRoomMetadata.messageLength) < peerMessageLength) {
            //     try {
            //         console.log("attempting to sync", myLocalRoomMetadata.messageLength, peerMessageLength)
            //         await attemptToSync(rpc, swarm.roomId, parseInt(myLocalRoomMetadata.messageLength), peerMessageLength)
            //     } catch (error) {
            //         console.log("error", error)
            //     }
            // } else {
            //     syncedRooms.current[swarm.roomId] = true
            // }
        })

        swarm.on('update', () => {
            setActivePeers(prev => ({
                ...prev,
                [roomId]: swarm.connections.size
            }))
        })
        await swarm.join(encodedTopic)
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

    const saveMessageToRoom = async (roomId: string, message: ChatMessage, disableMetaUpdate: boolean = false, messageId: number = undefined) => {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
        const meta = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY + roomId)
        const lastMessageId = meta.messageLength
        await roomAutopass.add(roomId + (messageId != undefined ? messageId.toString() : lastMessageId), message)
        const newLastMessageId = (parseInt(lastMessageId) + 1).toString()

        if (!disableMetaUpdate) {
            await roomAutopass.add(ROOMS_AUTOPASS_METADATA_KEY + roomId, {
                ...meta,
                messageLength: newLastMessageId,
                lastActive: Date.now(),
            })
        }
        setRoomsMetadata(prev => ({
            ...prev,
            [roomId]: {
                ...meta,
                lastActive: Date.now(),
                messageLength: parseInt(newLastMessageId)
            }
        }))
    }

    const getRoomMetadata = async (roomId: string) => {
        if (!roomId) return
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
        const roomMetadata = await roomAutopass.get(ROOMS_AUTOPASS_METADATA_KEY + roomId)
        if (!roomMetadata) {
            const meta = {
                lastActive: Date.now(),
                messageLength: 0
            }
            await roomAutopass.add(ROOMS_AUTOPASS_METADATA_KEY + roomId, meta)
            return meta
        }
        return roomMetadata
    }

    const getMessageFromRoom = async (roomId: string, messageId: number) => {
        if (!roomId) {
            return null
        }


        if (messageCaches.current[roomId] && messageCaches.current[roomId][messageId]) {
            return messageCaches.current[roomId][messageId]
        }

        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
        const message = await roomAutopass.get(roomId + messageId.toString())
        messageCaches.current[roomId] = messageCaches.current[roomId] || {}
        messageCaches.current[roomId][messageId] = message
        return message
    }

    return <RoomsContext.Provider value={{ peersInRooms, peerIdentities, getPeerIdentity, syncInProgress, syncedRooms, rooms, setRooms, currentRoom, setCurrentRoom, createRoom, joinRoom, activeRoom, setActiveRoom, prepareMessage, sendMessage, generateRoomInvitationCode, joinRoomWithInvite, getRoomMetadata, getMessageFromRoom, roomsMetadata, deleteRoom }}>
        <audio style={{ display: "none" }} ref={audioPlayerRef} src={NotificationSound} />
        {children}
    </RoomsContext.Provider>
}
