import { Heading, VStack, Text, Button, HStack, Box, Grid, Input } from "@chakra-ui/react"
import { useSeed } from "../hooks/useSeed"
import { FiRotateCw } from "react-icons/fi"
import { useEffect, useState } from "react"
import { PiArrowRightFill } from "react-icons/pi"
import { useP2P } from "../hooks/useP2P"
import { Field } from "../components/ui/field"
import { toaster } from "../components/ui/toaster"
import { SECRET_BEE_STORAGE_PATH, SECRET_AUTOPASS_STORAGE_PATH } from "../config/storage"
import { useNavigate } from "react-router"

export default function Import() {
    const { getBee, getAutopass } = useP2P()
    const { seedPhrase } = useSeed()
    const [importedSeedPhrase, setImportedSeedPhrase] = useState<string[]>(Array(20).fill(""))
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        if (seedPhrase) {
            navigate("/")
        }
    }, [])

    async function handleComplete(force = false) {
        setIsLoading(true)
        try {
            console.log("created bee")
            const bee = await getBee(SECRET_BEE_STORAGE_PATH)
            if (!bee) {
                throw new Error("Bee not found")
            }
            console.log("putting seed", importedSeedPhrase)
            await bee.put("seed", JSON.stringify({
                seedPhrase: importedSeedPhrase
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
                onStatusChange: Pear.reload,
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

    function handleUserInput(index: number, value: string) {
        const result = [...importedSeedPhrase]
        result[index] = value
        setImportedSeedPhrase(result)
    }


    return (
        <VStack h={"100vh"} overflow={"hidden"} p={"36px"}>
            <Box gap={6} maxW={"70%"} h={"100%"} display={"flex"} flexDirection={"column"}>
                <Heading textAlign={"center"} size={"4xl"}>Create New Account</Heading>
                <Text textAlign={"left"}>
                    Fill in the seed phrase below to create a new account.
                </Text>
                <Text>

                </Text>
                <Grid m={"auto"} templateColumns="repeat(5, 1fr)" gap="6">
                    {importedSeedPhrase?.map((word, index) => (
                        <Field label={`${index + 1}.`} errorText={!importedSeedPhrase[index]}
                            invalid={!importedSeedPhrase[index]}>
                            <Input onPaste={(e) => {
                                e.preventDefault()
                                const text = e.clipboardData.getData('text/plain');
                                const sanitized = text.trim().toLowerCase()
                                console.log(sanitized);
                                const words = sanitized.split(" ")
                                console.log(words);
                                if (words.length == 20) {
                                    setImportedSeedPhrase(words)
                                }
                            }} size={"sm"} value={word} key={index} onChange={(e) => handleUserInput(index, e.target.value)} />
                        </Field>
                    ))
                    }
                </Grid>

                <HStack align={"center"} justifyContent={"center"} justifySelf={"flex-end"} mt={"auto"}>
                    <Button disabled={importedSeedPhrase.some(word => !word)} variant="outline" onClick={() => {
                        handleComplete()
                    }}> <PiArrowRightFill /> Continue</Button>
                </HStack>
            </Box>
        </VStack >
    )
}