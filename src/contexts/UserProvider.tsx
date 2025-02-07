import { createContext, useEffect, useState } from "react"
import { Profile } from "../types/identity.types"
import { useP2P } from "../hooks/useP2P"
import { PROFILE_STORAGE_PATH, PROFILE_FILE_PATH } from "../config/storage"

export interface IUserContext {
    getProfile: () => Promise<Profile>,
    updateProfile: (profile: Profile) => Promise<Profile>,
    profile: Profile,
    setProfile: (profile: Profile) => void
}

export const UserContext = createContext<IUserContext>({
    getProfile: () => Promise.resolve(null) as any,
    updateProfile: () => Promise.resolve() as any,
    profile: null as any,
    setProfile: () => { }
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { getDrive } = useP2P()
    const [profile, setProfile] = useState<Profile | null>(null)

    useEffect(() => {
        getProfile()
    }, [])

    async function getProfile() {
        const drive = await getDrive(PROFILE_STORAGE_PATH)
        const profile = await drive.get(PROFILE_FILE_PATH)
        if (profile) {
            try {
                const decoded = profile.toString("utf-8")
                setProfile(JSON.parse(decoded))
            } catch (error) {
                console.error(error)
                const initProfile: Profile = {
                    name: "UnknownUser",
                    status: "Chilling",
                    image: "",
                }
                setProfile(initProfile)
                updateProfile(initProfile)
            }
        }
        return profile
    }

    async function updateProfile(profile: Profile) {
        const updatedProfile = { ...profile }
        const drive = await getDrive(PROFILE_STORAGE_PATH)
        // @ts-ignore
        const toBuffer = Buffer.from(JSON.stringify(updatedProfile))
        await drive.put(PROFILE_FILE_PATH, toBuffer)
        setProfile(updatedProfile)
        return updatedProfile
    }

    return <UserContext.Provider value={{ getProfile, updateProfile, profile, setProfile }}>{children}</UserContext.Provider>
}