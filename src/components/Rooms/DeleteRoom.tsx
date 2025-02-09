import { Button, Highlight, Input, Text, VStack } from "@chakra-ui/react"
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "../../components/ui/dialog"
import { Room } from "../../types/room.types"
import { useState } from "react"
import { Field } from "../ui/field"
import { useRoom } from "../../hooks/useRoom"

const DeleteRoom = ({ children, room, open, setIsOpen, setRoomToDelete }: { children?: any, onConfirmation?: any, room: Room, setRoomToDelete: any, open: any, setIsOpen: any }) => {
    const { deleteRoom } = useRoom()
    const [confirmationText, setConfirmationText] = useState("")
    const [isBusy, setIsBusy] = useState(false)
    return (
        <DialogRoot open={open && !!room} role="alertdialog">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={2}>
                        <Text w={"full"} textAlign={"left"}>
                            <Highlight styles={{ px: "0.5", bg: "red.muted" }} query={["permanently", "remove"]}>
                                {`This action cannot be undone. This will permanently delete room ${room.name.substring(0, 20)} and remove all your chat history from your system.`}
                            </Highlight>
                        </Text>
                        <Text w={"full"} textAlign={"left"}>
                            <Highlight styles={{ px: "0.5", bg: "red.muted" }} query={["DELETE"]}>
                                To confirm, please type DELETE below and press Delete.
                            </Highlight>
                        </Text>
                        <Field label={"Confirmation"}>
                            <Input value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)}></Input>
                        </Field>
                    </VStack>
                </DialogBody>
                <DialogFooter>
                    <DialogActionTrigger asChild>
                        <Button disabled={isBusy} onClick={() => {
                            setIsOpen(false)
                            setRoomToDelete(null)
                        }} variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                    <DialogActionTrigger asChild>
                        <Button loading={isBusy} onClick={async () => {
                            await deleteRoom(room.seed)
                            setIsOpen(false)
                            setRoomToDelete(null)
                        }} disabled={confirmationText !== "DELETE"} colorPalette="red">Delete</Button>
                    </DialogActionTrigger>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot >
    )
}


export default DeleteRoom