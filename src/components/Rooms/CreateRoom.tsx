import { Button, Input, Textarea, Wrap, Image, VStack, Box } from "@chakra-ui/react"
import { useState } from "react"
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { BASE_AVATAR_URI } from "../../config/constants"
import useUI from "../../hooks/useUI"
import { deterministicHex } from "../../utils/deterministicHex"
import { generateMnemonic } from "bip39"
import { Room } from "../../types/room.types"
import { toaster } from "../ui/toaster"
import { useRoom } from "../../hooks/useRoom"
const CreateRoom = () => {
    const { isCreateRoomDialogOpen, setIsCreateRoomDialogOpen } = useUI()
    const { createRoom, setActiveRoom } = useRoom()
    const [selectedImage, setSelectedImage] = useState<string>("0")
    const [roomName, setRoomName] = useState<string>("")
    const [roomDescription, setRoomDescription] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)



    const handleCreateRoom = async () => {
        setIsLoading(true)
        let roomSeed = generateMnemonic()
        const seed = deterministicHex(roomSeed)
        const newRoom: Room = {
            seed,
            name: roomName,
            description: roomDescription,
            image: selectedImage,
        }

        const room = await createRoom(newRoom)

        setIsLoading(false)
        setIsCreateRoomDialogOpen(false)
        if (room) {
            setActiveRoom(room)
        }
    }

    return (
        <DialogRoot open={isCreateRoomDialogOpen} onOpenChange={(details) => setIsCreateRoomDialogOpen(details.open)} size="full" motionPreset="slide-in-bottom">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={4}>
                        <Field label="Room Name">
                            <Input onChange={(e) => setRoomName(e.target.value)} placeholder="slickers" />
                        </Field>
                        <Field label="Room Description">
                            <Textarea onChange={(e) => setRoomDescription(e.target.value)} maxLength={50} rows={4} placeholder="A room for slickers" />
                        </Field>
                        <Field label="Room Image">
                            <Wrap boxSizing={"border-box"} gap={2}>
                                {Array.from({ length: 5 }).map((_: any, i) => i).map((_: any, index) => (
                                    <Box transition={"0.2s ease"} onClick={() => setSelectedImage(_)}
                                        border={selectedImage === _ ? "2px solid green" : "none"}
                                        key={index} w={"100px"} h={"100px"} overflow={"hidden"}>
                                        <Image _hover={{
                                            transform: 'scale(1.1)',
                                        }} objectFit={"cover"}
                                            transition={"0.2s ease"} cursor={"pointer"}
                                            w={"100px"}
                                            h={"100px"} src={`${BASE_AVATAR_URI}/${_}.jpg`} />
                                    </Box>
                                ))}
                            </Wrap>
                        </Field>
                    </VStack>
                </DialogBody>
                <DialogFooter>
                    <DialogActionTrigger disabled={isLoading} asChild>
                        <Button onClick={() => setIsCreateRoomDialogOpen(false)} disabled={isLoading} variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                    <Button disabled={isLoading} loading={isLoading} onClick={handleCreateRoom}>Create {roomName.length > 20 ? roomName?.substring(0, 20) + '...' : roomName}</Button>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default CreateRoom