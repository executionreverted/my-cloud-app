import { createContext, useEffect, useState } from "react"
import { Room } from "../types/room.types"
import { useP2P } from "../hooks/useP2P"
import { ROOMS_AUTOPASS_KEY, ROOMS_AUTOPASS_PATH } from "../config/storage"
import { toaster } from "../components/ui/toaster"

export interface RoomsContextType {
    rooms: Room[]
    setRooms: (rooms: Room[]) => void
    currentRoom: Room | null
    setCurrentRoom: (room: Room | null) => void
    createRoom: (room: Room) => void
    joinRoom: (roomTopic: string) => void
    activeRoom: Room | null
    setActiveRoom: (room: Room | null) => void
}

export const RoomsContext = createContext<RoomsContextType>({
    rooms: [],
    setRooms: () => { },
    currentRoom: null,
    setCurrentRoom: () => { },
    createRoom: () => { },
    joinRoom: () => { },
    activeRoom: null,
    setActiveRoom: () => { },
})


export const RoomsProvider = ({ children }: { children: React.ReactNode }) => {
    const { getAutopass } = useP2P()
    const [rooms, setRooms] = useState<Room[]>([])
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [activeRoom, setActiveRoom] = useState<Room | null>(null)
    useEffect(() => {
        getRoomsFromAutobase()
    }, [])

    async function getRoomsFromAutobase() {
        const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
        const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
        console.log("rooms", rooms)
        setRooms(rooms || [])
    }

    async function createRoom(room: Room) {
        try {
            console.log("creating room", room)
            const roomAutopass = await getAutopass(ROOMS_AUTOPASS_PATH)
            console.log("roomAutopass", roomAutopass)
            const rooms = await roomAutopass.get(ROOMS_AUTOPASS_KEY)
            console.log("rooms", rooms)
            await roomAutopass.add(ROOMS_AUTOPASS_KEY, [...rooms || [], room])
            console.log("rooms", rooms)
            setRooms([...(rooms || []), room])

            toaster.success({
                title: "Your new room is created!",
                description: "You can now invite your peeriends to join the room",
                duration: 3000,
            })

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


    async function joinRoom(roomTopic: string) {
        // todo
    }

    return <RoomsContext.Provider value={{ rooms, setRooms, currentRoom, setCurrentRoom, createRoom, joinRoom, activeRoom, setActiveRoom }}>{children}</RoomsContext.Provider>
}
