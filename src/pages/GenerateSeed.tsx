import { Heading, VStack, Text, Button, HStack, Box, Highlight, Grid, Input } from "@chakra-ui/react"
import { useSeed } from "../hooks/useSeed"
import { FiRotateCw } from "react-icons/fi"
import { useState } from "react"
import { PiArrowRightFill } from "react-icons/pi"
import { Checkbox } from "../components/ui/checkbox"
import { GiCelebrationFire } from "react-icons/gi"
import { Field } from "../components/ui/field"
import { useP2P } from "../hooks/useP2P"
import { SECRET_BEE_STORAGE_PATH, SECRET_AUTOPASS_STORAGE_PATH } from "../config/storage"
import { toaster } from "../components/ui/toaster"

export default function GenerateSeed() {
    const { getBee, getAutopass } = useP2P()
    const { temporarySeedPhrase, createNewSeedPhrase } = useSeed()
    const [confirmSeedPhrase, setConfirmSeedPhrase] = useState(false)
    const [alteredSeedPhrase, setAlteredSeedPhrase] = useState<string[]>([])
    const [accepted, setAccepted] = useState(false)
    const [alteredIndexes, setAlteredIndexes] = useState<number[]>([])
    const [userInput, setUserInput] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const isValid = accepted ? alteredIndexes.every((index) => userInput[index] == temporarySeedPhrase[index]) : false

    function handleCreate() {
        createNewSeedPhrase(20)
    }

    async function handleComplete(force = false) {

        if (!isValid && !force) {
            return
        }

        setIsLoading(true)
        try {
            console.log("created bee")
            const bee = await getBee(SECRET_BEE_STORAGE_PATH)
            if (!bee) {
                throw new Error("Bee not found")
            }
            console.log("putting seed", temporarySeedPhrase)
            await bee.put("seed", JSON.stringify({
                seedPhrase: temporarySeedPhrase
            }))
            console.log("putting seed done")
            console.log("creating secret autopass")
            await getAutopass(SECRET_AUTOPASS_STORAGE_PATH)
            console.log("creating secret autopass done")

            toaster.create({
                title: "Account Created",
                description: "Your seed phrase has been saved and private databases are ready to use. Reloading...",
                type: "success",
                placement: "top",
                onStatusChange: Pear.reload
            })
        } catch (error) {
            console.error(error)
            toaster.create({
                title: "Error",
                description: "An error occurred while creating your account. Please try again.",
                type: "error",
                placement: "top"
            })
            setIsLoading(false)
        }
    }

    function handleProof() {
        let indexes: number[] = [];
        while (indexes.length < 3) {
            let randomIndex = Math.floor(Math.random() * temporarySeedPhrase.length);
            if (!indexes.includes(randomIndex)) {
                indexes.push(randomIndex);
            }
        }

        const result = [...temporarySeedPhrase]
        // Seçilen indexlerdeki elemanları boşalt
        indexes.forEach(index => {
            result[index] = "";
        });
        setAlteredIndexes(indexes)
        setAlteredSeedPhrase(result)
        setConfirmSeedPhrase(true)
    }

    function handleUserInput(index: number, value: string) {
        const result = [...userInput]
        result[index] = value
        setUserInput(result)
    }




    if (accepted && confirmSeedPhrase) return (
        <VStack h={"100vh"} overflow={"hidden"} p={"36px"}>
            <Box gap={6} maxW={"70%"} h={"100%"} display={"flex"} flexDirection={"column"}>
                <Heading textAlign={"center"} size={"4xl"}>Confirm Seed Phrase</Heading>
                <Text textAlign={"left"}>
                    Please prove that you have saved your seed phrase by completing the missing words from the list below.
                </Text>

                <Grid m={"auto"} templateColumns="repeat(5, 1fr)" gap="6">
                    {alteredSeedPhrase?.map((word, index) => (
                        word ? <Text key={index}><span style={{ userSelect: "none" }}>{index + 1}. </span>{word}</Text> :
                            <Field errorText={userInput[index] != temporarySeedPhrase[index] ? "mismatch" : ""}
                                invalid={userInput[index] != temporarySeedPhrase[index]}>
                                <Input size={"sm"} key={index} onChange={(e) => handleUserInput(index, e.target.value)} />
                            </Field>
                    ))
                    }
                </Grid>

                <HStack align={"center"} justifyContent={"center"} justifySelf={"flex-end"} mt={"auto"}>
                    <Button variant="outline" onClick={() => {
                        setAccepted(false)
                        setConfirmSeedPhrase(false)
                    }}> <FiRotateCw /> Back</Button>
                    <Button loading={isLoading} loadingText={"Creating Account"} disabled={!isValid} variant="outline" onClick={() => {
                        setAccepted(true)

                        handleComplete()
                    }}> <GiCelebrationFire /> Continue </Button>
                </HStack>
            </Box>
        </VStack >
    )


    return (
        <VStack h={"100vh"} overflow={"hidden"} p={"36px"}>
            <Box gap={6} maxW={"70%"} h={"100%"} display={"flex"} flexDirection={"column"}>
                <Heading textAlign={"center"} size={"4xl"}>Create New Account</Heading>
                <Text textAlign={"left"}>
                    Please click the button below to generate a new seed phrase.
                </Text>
                <Text>
                    In order to keep your account and storage safe, please save this seed phrase in a secure location.
                    <Highlight styles={{ px: "0.5", bg: "red.subtle", color: "red.fg" }}
                        query={["lose", "not"]}>
                        If you lose your seed phrase, you will not be able to pair your device with it.
                    </Highlight>
                </Text>
                <Grid m={"auto"} templateColumns="repeat(5, 1fr)" gap="6">
                    {
                        temporarySeedPhrase?.map((word, index) => (
                            <Text key={index}><span style={{ userSelect: "none" }}>{index + 1}. </span>{word}</Text>
                        ))
                    }
                </Grid>
                {
                    temporarySeedPhrase?.length > 0 && <Checkbox onChange={() => setAccepted(!accepted)}>
                        <Text>
                            <Highlight styles={{ px: "0.5", bg: "green.subtle", color: "green.fg" }} query={["secure", "saved", "understand"]}>
                                I have saved my seed phrase in a secure location, and I understand
                            </Highlight>
                            <Highlight styles={{ px: "0.5", bg: "red.subtle", color: "red.fg" }}
                                query={["lose", "not"]}>
                                that I will not be able to recover my account if I lose it.
                            </Highlight>
                        </Text>
                    </Checkbox>
                }
                <HStack align={"center"} justifyContent={"center"} justifySelf={"flex-end"} mt={"auto"}>
                    <Button variant="outline" onClick={handleCreate}> <FiRotateCw /> Generate Seed Phrase</Button>
                    <Button disabled={temporarySeedPhrase.length == 0 || !accepted} variant="outline" onClick={() => {
                        handleProof()
                    }}> <PiArrowRightFill /> Continue</Button>

                    <Button variant="outline" onClick={() => {
                        handleComplete(true)
                    }}> <FiRotateCw /> DEV</Button>
                </HStack>
            </Box>
        </VStack >
    )
}