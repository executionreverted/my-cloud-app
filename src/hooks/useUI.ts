import { useContext } from "react"
import { UIContext } from "../contexts/UIContext"

export function useUI() {
    const ui = useContext(UIContext)
    return ui
}

export default useUI
