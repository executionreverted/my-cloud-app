import { createContext, useCallback, useEffect, useState } from "react"
import { Profile } from "../types/identity.types"
import { useP2P } from "../hooks/useP2P"
import { PROFILE_STORAGE_PATH, PROFILE_FILE_PATH, PROFILE_FILE_FOLDER } from "../config/storage"
import { HDNodeWallet, } from "ethers"

export interface IUserContext {
    getProfile: () => Promise<Profile>,
    updateProfile: (profile: Profile) => Promise<Profile>,
    profile: Profile,
    setProfile: (profile: Profile) => void
    setWallet: (wallet: HDNodeWallet) => void,
    wallet: HDNodeWallet
}

export const UserContext = createContext<IUserContext>({
    getProfile: () => Promise.resolve(null) as any,
    updateProfile: () => Promise.resolve() as any,
    profile: null as any,
    setProfile: () => { },
    setWallet: () => { },
    wallet: null
})
const initProfile: Profile = {
    name: "UnknownUser",
    status: "Chilling",
    image: "0",
}
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { drives, getDrive } = useP2P()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [wallet, setWallet] = useState(null)

    async function initializeProfile() {
        const drive = await getDrive(PROFILE_STORAGE_PATH)
        const exists = await drive.exists(PROFILE_FILE_PATH)
        if (exists) return getProfile()
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
        console.log("FIRST TIME!!!!!! INSTALL PROFILE DOC")
    }

    useEffect(() => {
        if (!wallet || drives[PROFILE_STORAGE_PATH]) {
            return
        }
        initializeProfile()
    }, [wallet, drives[PROFILE_STORAGE_PATH]])


    const getProfile = async () => {
        if (!wallet || !drives[PROFILE_STORAGE_PATH]) {
            setProfile({ ...initProfile, pubKey: wallet.publicKey })
            return initProfile
        }

        const profile$ = await (await getDrive(PROFILE_STORAGE_PATH)).get(PROFILE_FILE_PATH)
        if (profile$) {
            const decoded = profile$.toString()
            console.log({ decoded })
            console.log({ decoded })
            console.log({ decoded })
            console.log({ decoded })
            console.log({ decoded })
            setProfile(JSON.parse(decoded))
            return { ...JSON.parse(decoded), pubKey: wallet.publicKey }
        }

        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        console.log('CANT FIND PROFILE SO SERVE DEFAULT !!!!')
        setProfile({ ...initProfile, pubKey: wallet.publicKey })
        return { ...initProfile, pubKey: wallet.publicKey }
    }

    async function updateProfile(_profile: Profile) {
        const updatedProfile = { ..._profile }
        const drive = await getDrive(PROFILE_STORAGE_PATH)
        // @ts-ignore
        const toBuffer = Buffer.from(JSON.stringify(updatedProfile))
        await drive.put(PROFILE_FILE_PATH, toBuffer)
        console.log('UPDATE PROFILE... ', updatedProfile)
        console.log('UPDATE PROFILE... ', updatedProfile)
        console.log('UPDATE PROFILE... ', updatedProfile)
        console.log('UPDATE PROFILE... ', updatedProfile)
        console.log('UPDATE PROFILE... ', updatedProfile)
        setProfile(updatedProfile)
        return updatedProfile
    }


    return <UserContext.Provider value={{ wallet, setWallet, getProfile, updateProfile, profile, setProfile }}>{children}</UserContext.Provider>
}