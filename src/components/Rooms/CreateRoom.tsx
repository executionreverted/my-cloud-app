import { Button, Input, Textarea, Wrap, Image } from "@chakra-ui/react"
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
                    <Field label="Room Name">
                        <Input onChange={(e) => setRoomName(e.target.value)} placeholder="slickers" />
                    </Field>
                    <Field label="Room Description">
                        <Textarea onChange={(e) => setRoomDescription(e.target.value)} maxLength={50} rows={4} placeholder="A room for slickers" />
                    </Field>
                    <Field label="Room Image">
                        <Wrap gap={0}>
                            {Array.from({ length: 5 }).map((_: any, i) => i).map((_: any, index) => (
                                <Image cursor={"pointer"} border={selectedImage === _ ? "2px solid green" : "none"}
                                    onClick={() => setSelectedImage(_)}
                                    key={index}
                                    w={"40px"}
                                    h={"40px"} src={`${BASE_AVATAR_URI}/${_}.jpg`} />
                            ))}
                        </Wrap>
                    </Field>
                </DialogBody>
                <DialogFooter>
                    <DialogActionTrigger disabled={isLoading} asChild>
                        <Button onClick={() => setIsCreateRoomDialogOpen(false)} disabled={isLoading} variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                    <Button disabled={isLoading} loading={isLoading} onClick={handleCreateRoom}>Create {roomName}</Button>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default CreateRoom