import { BASE_AVATAR_URI } from "../../config/constants"
import { useRoom } from "../../hooks/useRoom"
import { Avatar, AvatarGroup, Box, Status, VStack } from "@chakra-ui/react"
import { Tooltip } from "../ui/tooltip"
export default function PeersInRoom() {
    const { peerIdentities, peersInRooms, activeRoom } = useRoom()
    console.log({ peerIdentities, peersInRooms })
    return <Box ml={"auto"}>
        <AvatarGroup size="md" stacking="last-on-top">
            {peersInRooms[activeRoom?.seed]?.map((peerId) => (
                <Tooltip key={peerId} ids={{ trigger: peerId }} content={peerIdentities[peerId]?.name || "Unknown"}>
                    <VStack position={"relative"}>
                        <Avatar.Root ids={{ root: peerId }}>
                            <Avatar.Fallback name={peerIdentities[peerId]?.name || `0x${peerId.substring(0, 6)}`} />
                            <Avatar.Image src={`${BASE_AVATAR_URI}${peerIdentities[peerId]?.image}.jpg` || "/0.jpg"} />
                        </Avatar.Root>
                        <Status.Root position={"absolute"} bottom={"-4px"} left={"50%"} colorPalette="green">
                            <Status.Indicator />
                        </Status.Root>
                    </VStack>
                </Tooltip>
            ))}
            <VStack>
                {peersInRooms[activeRoom?.seed]?.length > 3 && <Tooltip ids={{ trigger: "onlineCount" }} content={`${(peersInRooms[activeRoom?.seed]?.length || 0)} Peers online`}>
                    <Avatar.Root ids={{ root: "onlineCount" }}>
                        <Avatar.Fallback>+{peersInRooms[activeRoom?.seed]?.length || 0}</Avatar.Fallback>
                    </Avatar.Root>
                </Tooltip>}
            </VStack>
        </AvatarGroup>
    </Box>
}