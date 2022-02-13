import React from 'react';
import {
    Box,
    Image,
    HStack,
    Container,
    Stack,
    useColorModeValue,
} from '@chakra-ui/react';

const About = () => {
    // a short blurb about what this webapp is for
    const background = useColorModeValue("white", "gray.700");

    return (
        <HStack>
            <Image
                borderRadius='full'
                boxSize='350px'
                src='/alex.png'
                title='Eggy Weggs!'
            />
            <Container
                background={background}
                borderColor={"gray.400"}
                borderWidth='1px'
                maxW='sm'
                fontSize="md"
                borderRadius='lg'
                p={2}
                boxShadow="lg">
                <Stack spacing={2}>
                    <Box>
                        Howdy folks! 👋
                    </Box>
                    <Box>
                        We don't mean to alarm you, but to be quite honest: we're not entirely sure if Neopets is going to last forever, and we love our pets dearly.
                    </Box>
                    <Box fontSize='sm'>
                        For this reason, you can simply start entering some pets' names in and we'll get their images all downloaded for you!
                    </Box>
                    <Box fontSize="xs">
                        We do not harvest any pet names you may enter!
                    </Box>
                </Stack>
            </Container>
        </HStack>
    );
}

export default About;