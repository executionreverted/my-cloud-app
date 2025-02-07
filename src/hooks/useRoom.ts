import { useContext } from "react"
import { RoomsContext } from "../contexts/RoomsProvider"

export function useRoom() {
    const room = useContext(RoomsContext)
    return room
}