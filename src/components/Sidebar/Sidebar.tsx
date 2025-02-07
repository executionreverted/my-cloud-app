'use client'

import {
    IconButton,
    Box,
    Drawer,
    CloseButton,
    Flex,
    HStack,
    VStack,
    Icon,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    MenuItem,
} from '@chakra-ui/react'
import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiSettings,
    FiMenu,
    FiBell,
    FiChevronDown,
    FiX,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useColorModeValue } from '../ui/color-mode'
import { DrawerContent } from '../ui/drawer'
import { MenuContent, MenuRoot, MenuSeparator, MenuTrigger } from '../ui/menu'
import { Avatar } from '../ui/avatar'
import { IoChatbubble } from 'react-icons/io5'
import { useNavigate } from 'react-router'
import useUser from '../../hooks/useUser'
import useUI from '../../hooks/useUI'
import EditProfile from '../EditProfile/EditProfile'
import { BASE_AVATAR_URI } from '../../config/constants'
interface LinkItemProps {
    name: string
    icon: IconType
    path: string
}

interface NavItemProps extends FlexProps {
    icon: IconType
    children: React.ReactNode
}

interface MobileProps extends FlexProps {
    onOpen: () => void
}

interface SidebarProps extends BoxProps {
    open: boolean
    onClose: () => void
}

const LinkItems: Array<LinkItemProps> = [
    { name: 'Home', icon: FiHome, path: '/' },
    {
        name: 'Chat', icon: IoChatbubble, path: '/chat'
    },
    { name: 'Explore', icon: FiCompass, path: '/explore' },
    { name: 'Favourites', icon: FiStar, path: '/favourites' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
    { name: 'Home', icon: FiHome, path: '/' },
    {
        name: 'Chat', icon: IoChatbubble, path: '/chat'
    },
    { name: 'Explore', icon: FiCompass, path: '/explore' },
    { name: 'Favourites', icon: FiStar, path: '/favourites' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
    { name: 'Home', icon: FiHome, path: '/' },
    {
        name: 'Chat', icon: IoChatbubble, path: '/chat'
    },
    { name: 'Explore', icon: FiCompass, path: '/explore' },
    { name: 'Favourites', icon: FiStar, path: '/favourites' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
    { name: 'Home', icon: FiHome, path: '/' },
    {
        name: 'Chat', icon: IoChatbubble, path: '/chat'
    },
    { name: 'Explore', icon: FiCompass, path: '/explore' },
    { name: 'Favourites', icon: FiStar, path: '/favourites' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
]

const SidebarContent = ({ open, onClose, ...rest }: SidebarProps) => {
    const navigate = useNavigate()
    return (
        <Box
            transition="1s ease"
            bg={useColorModeValue('red.200', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 16 }}
            pos="fixed"
            h="full"
            // @ts-ignore
            style={{ "-webkit-app-region": "drag" }}
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Logo
                </Text>
                <CloseButton variant={"subtle"} display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            <Flex

                style={{
                    // @ts-ignore
                    "-webkit-app-region": "none",
                    scrollbarWidth: "none",
                    scrollBehavior: "smooth"
                }}
                overflow={"auto"}
                maxHeight={"90vh"}
                flexDirection={"column"} gap={"1em"} alignItems={"center"} justifyContent={"center"}>
                {LinkItems.map((link) => (
                    <NavItem key={link.name} icon={link.icon} onClick={() => navigate(link.path)}>
                        {""}
                    </NavItem>
                ))}
            </Flex>
        </Box>
    )
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
    return (
        <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            as="a"
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}>
            <Flex
                justifyContent={"center"}
                align="center"
                p="4"
                mx="auto"
                w={"12"}
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.300',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        size={"lg"}
                        fontSize="24"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Box>
    )
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
    const { profile } = useUser()
    const { openEditProfile, setOpenEditProfile } = useUI()
    return (
        <Flex
            ml={{ base: 0, md: 16 }}
            px={{ base: 4, md: 4 }}
            // @ts-ignore
            style={{ "-webkit-app-region": "drag" }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
            >
                <FiMenu />
            </IconButton>

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                Logo
            </Text>

            <HStack h={"100%"} gap={{ base: '0', md: '6' }}>
                <IconButton size="lg" variant="ghost" aria-label="open menu"  ><FiBell /></IconButton>
                <Flex style={{ "-webkit-app-region": "no-drag", "-webkit-user-drag": "none" }} h={"100%"} alignItems={'center'}>
                    <MenuRoot>
                        <MenuTrigger height={"100%"} asChild>
                            <HStack h={"100%"}>
                                <Avatar
                                    size={'sm'}
                                    objectFit={"cover"}
                                    src={
                                        typeof profile?.image === "string" ? `${BASE_AVATAR_URI}${profile?.image}.jpg` : 'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                                    }
                                />
                                <VStack h={"100%"} as={"button"}
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-start"
                                    justifyContent={"center"}
                                    gap="1px"
                                    ml="2" px="2">
                                    <Text fontSize="sm">{profile?.name || "Unknown User"}</Text>
                                    <Text fontSize="xs" color="gray.600">
                                        {profile?.status || "Unknown Status"}
                                    </Text>
                                </VStack>
                                <Box display={{ base: 'none', md: 'flex' }}>
                                    <FiChevronDown />
                                </Box>
                            </HStack>
                        </MenuTrigger>
                        <MenuContent
                            bg={useColorModeValue('white', 'gray.900')}
                            borderColor={useColorModeValue('gray.200', 'gray.700')}>
                            <MenuItem onClick={() => setOpenEditProfile(true)} value="Edit Profile">Edit Profile</MenuItem>
                            <MenuItem value="Settings">Settings</MenuItem>
                            <MenuItem value="Billing">Billing</MenuItem>
                            <MenuSeparator />
                            <MenuItem value="">{`About Us`}</MenuItem>
                        </MenuContent>
                    </MenuRoot>
                </Flex>
            </HStack >
        </Flex >
    )
}

const SidebarWithHeader = ({ children }: { children: React.ReactNode }) => {
    const { open, onOpen, onClose } = useDisclosure()

    return (
        <Box h="100vh" overflow={"hidden"} bg={useColorModeValue('gray.100', 'gray.900')}>
            <EditProfile />
            <SidebarContent open={open} onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
            <Drawer.Root
                open={open}
                placement="start"
                onOpenChange={onClose}
                restoreFocus={true}
                onFocusOutside={onClose}
                size="full">
                <DrawerContent>
                    <VStack minH={"100vh"} h={"100vh"} >
                        <Drawer.CloseTrigger p={"10px"} asChild>
                            <IconButton backgroundColor={"darkgrey"} rounded={"full"} mx={"auto"} mb={"1em"} mt={"auto"} alignSelf={"flex-end"} justifySelf={"flex-end"} variant={"ghost"} aria-label="">
                                <FiX />
                            </IconButton>
                        </Drawer.CloseTrigger>
                    </VStack>
                </DrawerContent>
            </Drawer.Root>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 16 }} p="4">
                {children}
            </Box>
        </Box>
    )
}

export default SidebarWithHeader