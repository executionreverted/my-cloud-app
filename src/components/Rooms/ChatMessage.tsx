import { Text, Box } from "@chakra-ui/react"
import { Avatar } from "../ui/avatar"
import { useColorModeValue } from "../ui/color-mode"
import { ChatMessage as ChatMessageType } from "../../types/chat.types"
import { useState, memo } from "react"
import { BASE_AVATAR_URI } from "../../config/constants"
import { useSeed } from "../../hooks/useSeed"
import { Skeleton } from "../ui/skeleton"
export const ChatMessage = memo(({ isLoading, rowRef, message, style, }: { isLoading: boolean, rowRef: any, message: ChatMessageType, style: any, messageLength?: number }) => {
    const { wallet } = useSeed()
    const isOwnMessage = message?.senderPublicKey === wallet?.publicKey
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
                <Avatar border={"1px solid #ddd"} size="sm" name="Unknown" src={`${BASE_AVATAR_URI}/0.jpg`} />
                <Skeleton
                    width="100%" loading={isLoading}>
                    <Text textAlign={isOwnMessage ? "right" : "left"}>{message?.content}</Text>
                </Skeleton>
            </Box>
            <Text w="100%" textAlign={isOwnMessage ? "right" : "left"} fontSize={"xs"} color="gray.500" >{new Date(message?.timestamp).toLocaleTimeString()}</Text>
        </div>
    )
})