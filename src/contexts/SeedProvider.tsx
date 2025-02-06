import Hyperswarm from "hyperswarm"
import { createContext, useEffect, useState } from "react"
import { generateMnemonic } from "bip39"
import { useP2P } from "../hooks/useP2P"
import { SECRET_BEE_STORAGE_PATH } from "../config/storage"
import { SECRET_CHANNEL_ID } from "../config/constants"
import { generateTopicBySeed } from "../utils/generateTopicBySeed"


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
    const { getBee, swarms } = useP2P()
    const [seedPhrase, setSeedPhrase] = useState("")
    const [temporarySeedPhrase, setTemporarySeedPhrase] = useState<string[]>([])
    const [isSeedLoading, setIsSeedLoading] = useState(true)

    useEffect(() => {
        if (!seedPhrase) {
            console.log("initializing seed")
            initSeed().then(initPrivateChannel)
        }
    }, [])

    async function initSeed() {
        const bee = await getBee(SECRET_BEE_STORAGE_PATH)
        if (!bee) {
            setIsSeedLoading(false)
            return
        }

        const seed = await bee.get("seed")
        if (seed && seed.value) {
            console.log("seed", seed)
            const parsePhrase = JSON.parse(seed.value)
            console.log("parsePhrase", parsePhrase)
            const finalSeed = parsePhrase.seedPhrase.join(' ')
            console.log("finalSeed", finalSeed)
            setSeedPhrase(() => finalSeed)
            console.log("seedPhrase", seedPhrase)
            setIsSeedLoading(false)
            return finalSeed
        } else {
            console.log("no seed")
            setIsSeedLoading(false)
            return ""
        }
    }

    async function initPrivateChannel() {
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
