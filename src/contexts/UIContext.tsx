import { createContext, useState } from "react"

export const UIContext = createContext({
    openEditProfile: false,
    setOpenEditProfile: (open: boolean) => { },
    isCreateRoomDialogOpen: false,
    setIsCreateRoomDialogOpen: (open: boolean) => { },
    isJoinRoomDialogOpen: false,
    setIsJoinRoomDialogOpen: (open: boolean) => { }
})

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [openEditProfile, setOpenEditProfile] = useState(false)
    const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)
    const [isJoinRoomDialogOpen, setIsJoinRoomDialogOpen] = useState(false)
    return (
        <UIContext.Provider value={{ openEditProfile, setOpenEditProfile, isCreateRoomDialogOpen, setIsCreateRoomDialogOpen, isJoinRoomDialogOpen, setIsJoinRoomDialogOpen }}>
            {children}
        </UIContext.Provider>
    )
}
