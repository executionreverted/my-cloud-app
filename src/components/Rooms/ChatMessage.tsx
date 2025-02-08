import { Text, Box, Button, VStack } from "@chakra-ui/react"
import { Avatar } from "../ui/avatar"
import { useColorModeValue } from "../ui/color-mode"
import { ChatMessage as ChatMessageType } from "../../types/chat.types"
import { useState, memo, useEffect } from "react"
import { BASE_AVATAR_URI } from "../../config/constants"
import { useSeed } from "../../hooks/useSeed"
import { Skeleton } from "../ui/skeleton"
import { useRoom } from "../../hooks/useRoom"
import useUser from "../../hooks/useUser"
import { Room } from "../../types/room.types"

export const ChatMessage = memo(({ isLoading, rowRef, message, style, }: { isLoading: boolean, rowRef: any, message: ChatMessageType, style: any, messageLength?: number }) => {
    const { wallet } = useSeed()
    const { profile } = useUser()
    const { getPeerIdentity, peerIdentities, joinRoomWithInvite } = useRoom()
    const isOwnMessage = message?.senderPublicKey === wallet?.publicKey


    // is invitation link

    const [isInvitation, setIsInvitation] = useState(false)
    const [invitationObject, setInvitationObject] = useState<Room>(null)

    const [senderProfile, setSenderProfile] = useState(null)
    useEffect(() => {
        if (!message) {
            return
        }
        getPeerIdentity(message?.senderPublicKey).then(v => setSenderProfile(v))

        try {
            const tryParseInvitation = JSON.parse(atob(message.content))
            if (tryParseInvitation) {
                setIsInvitation(true)
                setInvitationObject(tryParseInvitation)
            }
        } catch (error) {

        }
    }, [message?.senderPublicKey, Object.keys(peerIdentities).length])

    return (
        <div ref={rowRef} style={{
            width: "100%", marginLeft: isOwnMessage ? "auto" : 0, marginRight: isOwnMessage ? 0 : "auto",
            top: style.top, left: style.left, right: style.right, bottom: style.bottom, position: "absolute"
        }}>
            <Box
                bg={isOwnMessage ? useColorModeValue('gray.200', 'gray.700') : useColorModeValue('cyan.200', 'cyan.700')}
                w="max-content"
                maxWidth="80%"
                alignSelf={isOwnMessage ? "flex-end" : "flex-start"}
                display="flex"
                alignItems="center"
                padding={2}
                gap={2}
                ml={isOwnMessage ? "auto" : 0}
                mr={isOwnMessage ? 0 : "auto"}
                flexDirection={isOwnMessage ? "row-reverse" : "row"}
                position="relative"
            >
                <Avatar border={"1px solid #ddd"} size="sm" name="Unknown" src={`${BASE_AVATAR_URI}/${isOwnMessage ? profile?.image || 0 : senderProfile?.image || 0}.jpg`} />
                <Skeleton
                    width="100%" loading={isLoading}>
                    <VStack>
                        <Text textAlign={isOwnMessage ? "right" : "left"}>
                            {!isInvitation && message?.content}
                            {
                                isInvitation &&
                                <Button onClick={() => joinRoomWithInvite(message.content, "Wohoo! You've joined a room through a in-app invite. Enjoy your stay!")}
                                    variant={"solid"}>
                                    Join: {invitationObject.name}
                                </Button>
                            }
                        </Text>
                    </VStack>
                </Skeleton>
            </Box>
            <Box display={"flex"} flexDir={isOwnMessage ? "row-reverse" : "row"}>
                <Text w={"max-content"} px={2} textAlign={isOwnMessage ? "right" : "left"} fontSize={"xs"} color="gray.700" >{isOwnMessage ? profile?.name : senderProfile?.name}</Text>
                <Text w="max-content" textAlign={isOwnMessage ? "right" : "left"} fontSize={"xs"} color="gray.500" >{`${new Date(message?.timestamp).toLocaleDateString()} ${new Date(message?.timestamp).toLocaleTimeString()}`}</Text>
            </Box>
        </div>
    )
})