import { createContext, useState } from "react"

export const UIContext = createContext({
    openEditProfile: false,
    setOpenEditProfile: (open: boolean) => { },
    isCreateRoomDialogOpen: false,
    setIsCreateRoomDialogOpen: (open: boolean) => { }
})

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [openEditProfile, setOpenEditProfile] = useState(false)

    const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)
    return (
        <UIContext.Provider value={{ openEditProfile, setOpenEditProfile, isCreateRoomDialogOpen, setIsCreateRoomDialogOpen }}>
            {children}
        </UIContext.Provider>
    )
}
