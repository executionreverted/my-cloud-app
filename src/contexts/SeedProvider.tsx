import Hyperswarm from "hyperswarm"
import { createContext, useEffect, useState } from "react"
import { generateMnemonic, mnemonicToSeed } from "bip39"
import { useP2P } from "../hooks/useP2P"
import { SECRET_BEE_STORAGE_PATH, PROFILE_STORAGE_PATH, PROFILE_FILE_PATH, getAppKey } from "../config/storage"
import { SECRET_CHANNEL_ID } from "../config/constants"
import { generateTopicBySeed } from "../utils/generateTopicBySeed"
import useUser from "../hooks/useUser"
import { Profile } from "../types/identity.types"
import * as ethers from "ethers"
export type ISeedContext = {
    seedPhrase: string,
    temporarySeedPhrase: string[],
    setSeedPhrase: (seedPhrase: string) => void,
    createNewSeedPhrase: (len: number) => void,
    isSeedLoading: boolean,
    wallet: ethers.HDNodeWallet | null,
}

export const SeedContext = createContext<ISeedContext>({
    seedPhrase: "",
    temporarySeedPhrase: [""],
    setSeedPhrase: (_seedPhrase: string) => { },
    createNewSeedPhrase: (_len: number) => { },
    isSeedLoading: false,
    wallet: null,
})

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
    const { getBee, swarms, getCore, getRPC, getDrive, drives } = useP2P()
    const { getProfile, updateProfile, profile, setProfile, setWallet: userSetWallet } = useUser()
    const [seedPhrase, setSeedPhrase] = useState("")
    const [temporarySeedPhrase, setTemporarySeedPhrase] = useState<string[]>([])
    const [isSeedLoading, setIsSeedLoading] = useState(true)
    const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null)

    // WE INIT APP HERE
    useEffect(() => {
        if (!seedPhrase) {
            initApp()
            getAppKey()
        }
    }, [seedPhrase, wallet])

    async function initApp() {
        if (!seedPhrase) {
            console.log("initializing hypers")
            await initSeed()
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
            getMyPublicKey(finalSeed)
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
        })
        await swarm.join(topic)
        swarms[SECRET_CHANNEL_ID] = swarm
    }

    async function initProfileDrive() {
        if (!wallet || drives[PROFILE_STORAGE_PATH]) {
            return;
        }
        const profile = await getProfile()
        if (profile) {
            return profile
        }
        const initProfile: Profile = {
            name: "UnknownUser",
            status: "Chilling",
            image: "",
        }
        const updatedProfile = await updateProfile(initProfile)
        return updatedProfile
    }

    function createNewSeedPhrase(size: number = 20) {
        const entropy = ethers.randomBytes(32)
        const phrase = ethers.Mnemonic.fromEntropy(entropy).phrase
        setTemporarySeedPhrase(phrase.split(' '))
    }


    async function getMyPublicKey(seed: string) {
        const wallet = ethers.HDNodeWallet.fromPhrase(seed)
        setWallet(wallet)
        userSetWallet(wallet)
    }

    return (
        <SeedContext.Provider value={{ seedPhrase, temporarySeedPhrase, setSeedPhrase, createNewSeedPhrase, isSeedLoading, wallet }}>{children}</SeedContext.Provider>
    )
}
