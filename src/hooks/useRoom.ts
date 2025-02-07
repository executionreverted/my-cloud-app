import { useContext } from "react"
import { RoomsContext } from "../contexts/RoomsProvider"

export function useRoom() {
    const { rooms, setCurrentRoom, createRoom, joinRoom, activeRoom, setActiveRoom } = useContext(RoomsContext)
    return { rooms, setCurrentRoom, createRoom, joinRoom, activeRoom, setActiveRoom }
}