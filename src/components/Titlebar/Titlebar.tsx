import { useState } from "react";
import { Box, Flex, Text, Button, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";


const NavBar = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
        <NavBarContainer {...props}>
            <p>LOGO</p>
            <MenuToggle toggle={toggle} isOpen={isOpen} />
            <MenuLinks isOpen={isOpen} />
        </NavBarContainer>
    );
};

const CloseIcon = () => (
    <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <title>Close</title>
        <path
            fill="white"
            d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
        />
    </svg>
);

const MenuIcon = () => (
    <svg
        width="24px"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
    >
        <title>Menu</title>
        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
    </svg>
);

const MenuToggle = ({ toggle, isOpen }: { toggle: () => void, isOpen: boolean }) => {
    return (
        <Box zIndex={99} p={2} display={{ base: "block", md: "none" }} onClick={toggle}>
            {isOpen ? <CloseIcon /> : <MenuIcon />}
        </Box>
    );
};

const MenuItem = ({ onClick = () => { }, children, isLast = false, to = "/", ...rest }: { onClick: () => any, children: React.ReactNode, isLast: boolean, to: string, rest: any }) => {
    return (
        <Text display="block" {...rest} onClick={onClick}>
            {children}
        </Text>
    );
};

const MenuLinks = ({ isOpen }: { isOpen: boolean }) => {
    const navigate = useNavigate()
    return (
        <Box
            display={{ base: isOpen ? "block" : "none", md: "block" }}
            flexBasis={{ base: "100%", md: "auto" }}
        >
            <Stack
                gap={8}
                align="center"
                justify={["center", "space-between", "flex-end", "flex-end"]}
                direction={["column", "row", "row", "row"]}
                pt={[4, 4, 0, 0]}
            >
                <MenuItem onClick={() => navigate("/")}>Home</MenuItem>
                <MenuItem onClick={() => navigate("/features")}>Features </MenuItem>
                <MenuItem onClick={() => navigate("/help")}>Help </MenuItem>
                <MenuItem onClick={() => navigate("/help")} isLast>
                    <Button
                        size="sm"
                        rounded="md"
                        color={["primary.500", "primary.500", "white", "white"]}
                        bg={["white", "white", "primary.500", "primary.500"]}
                        _hover={{
                            bg: ["primary.100", "primary.100", "primary.600", "primary.600"]
                        }}
                    >
                        Create Account
                    </Button>
                </MenuItem>
            </Stack>
        </Box>
    );
};

const NavBarContainer = ({ children, ...props }: { children: React.ReactNode, props: any }) => {
    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100%"
            mb={8}
            p={8}
            bg={["primary.500", "primary.500", "transparent", "transparent"]}
            color={["white", "white", "primary.700", "primary.700"]}
            {...props}
        >
            {children}
        </Flex>
    );
};

export default NavBar;