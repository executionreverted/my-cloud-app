import { createContext, useEffect, useState } from "react"
import { generateMnemonic } from "bip39"


export const SeedContext = createContext({
    seedPhrase: "",
    temporarySeedPhrase: [""],
    setSeedPhrase: (_seedPhrase: string) => { },
    createNewSeedPhrase: (_len: number) => { }
})



export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
    const [seedPhrase, setSeedPhrase] = useState("")
    const [temporarySeedPhrase, setTemporarySeedPhrase] = useState<string[]>([])

    useEffect(() => {
        if (!seedPhrase) {
            // get seed phrase
        }
    }, [])

    function createNewSeedPhrase(size: number = 20) {
        const words = []
        for (let i = 0; i < size; i++) {
            words.push(generateMnemonic().split(" ")[0])
        }
        setTemporarySeedPhrase(words)
    }


    return (
        <SeedContext.Provider value={{ seedPhrase, temporarySeedPhrase, setSeedPhrase, createNewSeedPhrase }}>{children}</SeedContext.Provider>
    )
}
