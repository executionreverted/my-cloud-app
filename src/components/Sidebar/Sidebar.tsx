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
    FiX
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useColorModeValue } from '../ui/color-mode'
import { DrawerContent } from '../ui/drawer'
import { MenuContent, MenuRoot, MenuSeparator, MenuTrigger } from '../ui/menu'
import { Avatar } from '../ui/avatar'
interface LinkItemProps {
    name: string
    icon: IconType
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
    { name: 'Home', icon: FiHome },
    { name: 'Trending', icon: FiTrendingUp },
    { name: 'Explore', icon: FiCompass },
    { name: 'Favourites', icon: FiStar },
    { name: 'Settings', icon: FiSettings },
]

const SidebarContent = ({ open, onClose, ...rest }: SidebarProps) => {
    console.log(open)
    return (
        <Box
            transition="1s ease"
            bg={useColorModeValue('gray.900', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Logo
                </Text>
                <CloseButton variant={"subtle"} display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    )
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
    return (
        <Box
            as="a"
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.400',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
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
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
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
                <Flex h={"100%"} border={"1px solid red"} alignItems={'center'}>
                    <MenuRoot>
                        <MenuTrigger height={"100%"} asChild>
                            <HStack h={"100%"}>
                                <Avatar
                                    size={'sm'}
                                    src={
                                        'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                                    }
                                />
                                <VStack h={"100%"} as={"button"}
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-start"
                                    justifyContent={"center"}
                                    gap="1px"
                                    ml="2" px="2">
                                    <Text fontSize="sm">Justina Clark</Text>
                                    <Text fontSize="xs" color="gray.600">
                                        Admin
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
                            <MenuItem value="Profile">Profile</MenuItem>
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
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    )
}

export default SidebarWithHeader