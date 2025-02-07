import Hyperswarm from "hyperswarm"
import { createContext, useEffect, useState } from "react"
import { generateMnemonic } from "bip39"
import { useP2P } from "../hooks/useP2P"
import { SECRET_BEE_STORAGE_PATH, PROFILE_STORAGE_PATH, PROFILE_FILE_PATH } from "../config/storage"
import { SECRET_CHANNEL_ID } from "../config/constants"
import { generateTopicBySeed } from "../utils/generateTopicBySeed"
import Hyperdrive from "hyperdrive"
import useUser from "../hooks/useUser"
import { Profile } from "../types/identity"
export type ISeedContext = {
    seedPhrase: string,
    temporarySeedPhrase: string[],
    setSeedPhrase: (seedPhrase: string) => void,
    createNewSeedPhrase: (len: number) => void,
    isSeedLoading: boolean
}

export const SeedContext = createContext<ISeedContext>({
    seedPhrase: "",
    temporarySeedPhrase: [""],
    setSeedPhrase: (_seedPhrase: string) => { },
    createNewSeedPhrase: (_len: number) => { },
    isSeedLoading: false
})

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
    const { getBee, swarms, getCore, getRPC, getDrive } = useP2P()
    const { getProfile, updateProfile, profile, setProfile } = useUser()
    const [seedPhrase, setSeedPhrase] = useState("")
    const [temporarySeedPhrase, setTemporarySeedPhrase] = useState<string[]>([])
    const [isSeedLoading, setIsSeedLoading] = useState(true)


    // WE INIT APP HERE
    useEffect(() => {
        if (!seedPhrase) {
            initApp()
        }
    }, [])

    async function initApp() {
        if (!seedPhrase) {
            console.log("initializing hypers")
            await initSeed()
            await initProfileDrive()
            await initPrivateChannel()
        }
    }

    async function initSeed() {
        console.log("initializing seed")
        const bee = await getBee(SECRET_BEE_STORAGE_PATH)
        if (!bee) {
            setIsSeedLoading(false)
            return
        }

        const seed = await bee.get("seed")
        if (seed && seed.value) {
            const parsePhrase = JSON.parse(seed.value)
            const finalSeed = parsePhrase.seedPhrase.join(' ')
            console.log("finalSeed", finalSeed)
            setSeedPhrase(() => finalSeed)
            setIsSeedLoading(false)
            return finalSeed
        } else {
            console.log("no seed")
            setIsSeedLoading(false)
            return ""
        }
    }

    async function initPrivateChannel() {
        console.log("initializing private channel")
        let phrase = seedPhrase
        if (!phrase) {
            console.log("refetch seed")
            phrase = await initSeed()
        }
        if (!phrase) {
            console.log("no phrase, please create account")
            setIsSeedLoading(false)
            return
        }

        const topic = generateTopicBySeed(phrase)
        const swarm = new Hyperswarm()
        swarm.on('connection', (conn) => {
            console.log('connection', conn)
        })


        await swarm.join(topic)
        swarms[SECRET_CHANNEL_ID] = swarm
    }

    async function initProfileDrive() {
        console.log("initializing profile drive")
        const profile = await getProfile()
        if (profile) {
            console.log("profile", profile)
            return profile
        }
        console.log("no profile")
        const initProfile: Profile = {
            name: "UnknownUser",
            status: "Chilling",
            image: "",
        }
        const updatedProfile = await updateProfile(initProfile)
        console.log("updatedProfile", updatedProfile)
        return updatedProfile
    }

    function createNewSeedPhrase(size: number = 20) {
        const words = []
        for (let i = 0; i < size; i++) {
            words.push(generateMnemonic().split(" ")[0])
        }
        setTemporarySeedPhrase(words)
    }


    return (
        <SeedContext.Provider value={{ seedPhrase, temporarySeedPhrase, setSeedPhrase, createNewSeedPhrase, isSeedLoading }}>{children}</SeedContext.Provider>
    )
}
