import { useContext } from "react"
import { UserContext } from "../contexts/UserProvider"

export function useUser() {
    const user = useContext(UserContext)
    return user
}

export default useUser