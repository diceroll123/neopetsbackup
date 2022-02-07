import { 
    Box, 
    ButtonGroup, 
    Divider, 
    Heading, 
    Icon, 
    IconButton, 
    Link, 
    Stack, 
    Text, 
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { FaGithub } from 'react-icons/fa';

const links = [
    {
        icon: FaGithub,
        label: "GitHub",
        href: "https://github.com/diceroll123/neopetsbackup",
    },
];

const Logo = () => {
    return (
        <Stack direction="row">
            <Box as="img" src={null} height="1.5em" width="1.5em" />
            <Heading
                as="h1"
                fontFamily="heading"
                fontWeight="bold"
                fontSize="xl"
            >
                Save Neopets!
            </Heading>
        </Stack>
    );
};

const Copyright = (props) => {
    return (
        <Text fontSize="sm" {...props}>
            Website, design, and code &copy; groupname.domain
            <br />
            This is an unofficial Neopets fansite with no affiliation/endorsement with Neopets.
            <br /> Images/Names &copy; Neopets, Inc. All rights reserved. Used With Permission.
        </Text>
    );
};

const FooterButton = (props) => {
    const { icon, href, label } = props;
    return (
        <Tooltip label={label} aria-label={label}>
            <IconButton 
                as={Link}
                href={href}
                isExternal
                fontSize="xl"
                icon={<Icon as={icon} />}
            />
        </Tooltip>
    );
};

const FooterButtons = (props) => {
    return (
        <ButtonGroup variant="ghost" color="gray.600" {...props}>
            {links.map((link) => (
                <FooterButton key={link.href} {...link} />
            ))}
        </ButtonGroup>
    );
};

export const Footer = () => {
    return (
        <Box
            bg={useColorModeValue('gray.50', 'gray.900')}
            marginTop="16px"
            as="footer" 
            role="contentinfo" 
            mx="auto" 
            maxW="full" 
            width="full"
            py="12" 
            px={{ base: '4', md: '8' }}
        >
            <Stack>
                <Stack 
                    direction="row" 
                    spacing="4" 
                    align="center" 
                    justify="space-between"
                >
                    <Logo />
                    <FooterButtons />
                </Stack>
                <Copyright alignSelf={{base: "center", sm: "start"}} />
            </Stack>
        </Box>
    );
};

export default Footer;