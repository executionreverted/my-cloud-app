import { useContext } from "react"

import { SeedContext } from "../contexts/SeedProvider"

export const useSeed = () => {
    const state = useContext(SeedContext)
    return state
}