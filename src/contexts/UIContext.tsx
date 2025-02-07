import { createContext, useState } from "react"

export const UIContext = createContext({
    openEditProfile: false,
    setOpenEditProfile: (open: boolean) => { }
})

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [openEditProfile, setOpenEditProfile] = useState(false)
    return (
        <UIContext.Provider value={{ openEditProfile, setOpenEditProfile }}>
            {children}
        </UIContext.Provider>
    )
}
