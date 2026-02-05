import React from 'react';
import { Box, Image, HStack, Stack, useColorModeValue } from '@chakra-ui/react';

const About = () => {
  // a short blurb about what this webapp is for
  const background = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.400', 'gray.600');

  return (
    <HStack
      spacing={4}
      flexDirection={{ base: 'column', md: 'row' }}
      align={{ base: 'center', md: 'flex-start' }}
      maxW="100%"
    >
      <Image
        borderRadius="full"
        boxSize={{ base: '200px', md: '350px' }}
        src="/alex.png"
        title="Eggy Weggs!"
        flexShrink={0}
      />
      <Box
        background={background}
        borderColor={borderColor}
        borderWidth="1px"
        maxW={{ base: '100%', md: 'sm' }}
        fontSize="md"
        borderRadius="lg"
        p={4}
        boxShadow="lg"
        ml={{ base: 0, md: 4 }}
      >
        <Stack spacing={2}>
          <Box>Howdy folks! 👋</Box>
          <Box>
            We don't mean to alarm you, but to be quite honest: we're not
            entirely sure if Neopets is going to last forever, and we love our
            pets dearly.
          </Box>
          <Box fontSize="sm">
            For this reason, you can simply start entering some pets' names in
            and we'll get their images all downloaded for you!
          </Box>
          <Box fontSize="xs">
            We do not harvest any pet names you may enter!
          </Box>
        </Stack>
      </Box>
    </HStack>
  );
};

export default About;
