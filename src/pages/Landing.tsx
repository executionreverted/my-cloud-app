import { Heading, VStack, Text, Button, HStack, Box } from "@chakra-ui/react"
import { FiRotateCw } from "react-icons/fi"
import { IoSync } from "react-icons/io5"
import { CiImport } from "react-icons/ci"
import { useNavigate } from "react-router"
export default function Landing() {
    const navigate = useNavigate()

    const handleImport = () => {
        navigate("/import")
    }

    function handleSync() {
        navigate("/sync")
    }

    function handleCreate() {
        navigate("/generate-seed")
    }

    return (
        <VStack h={"100vh"} overflow={"hidden"} p={"36px"}>
            <Box gap={6} maxW={"70%"} h={"100%"} display={"flex"} flexDirection={"column"}>
                <Heading textAlign={"center"} size={"4xl"}>Welcome to Pearzone</Heading>
                <Text textAlign={"left"}>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos animi ab explicabo consectetur rem laborum facilis aliquam velit quam commodi sit sint optio, eligendi esse dolore modi quae tenetur. Esse?
                </Text>
                <Text>
                    This is a welcome message.
                </Text>
            </Box>
            <Box>

            </Box>
            <HStack justifySelf={"flex-end"} mt={"auto"}>
                <Button variant="outline" onClick={handleImport}> <CiImport /> Import Seed Phrase</Button>
                <Button variant="outline" onClick={handleCreate}> <FiRotateCw /> Create New Account</Button>
                <Button variant="outline" onClick={handleSync}> <IoSync /> Sync</Button>
            </HStack>
        </VStack>
    )
}