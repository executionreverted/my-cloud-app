import { useContext } from "react"
import { IPeer2PeerContext, Peer2PeerProviderState } from "../contexts/Peer2PeerProvider"

export const useP2P = () => {
    const p2pContext = useContext<IPeer2PeerContext>(Peer2PeerProviderState)

    if (!p2pContext) {
        throw new Error("useP2P must be used within a Peer2PeerProvider")
    }

    return p2pContext
}