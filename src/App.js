import React from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  Input,
  theme,
  Image,
  Button,
  HStack,
  Container,
  Progress,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import axios from 'axios';
import * as zip from "@zip.js/zip.js";

const EMOTIONS = {
  happy: 1,
  sad: 2,
  angry: 3,
  sick: 4,
  peeled: 5
}

const SIZES = {
  icon: 1,
  small: 2,
  smallcropped: 3,
  medium: 4,
  large: 5,
  face: 6,
  largest: 7,
  // there is no 8, weird isn't it
  cropped: 9,
}

function About() {

  const background = useColorModeValue("white", "gray.700");

  return (
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
          All of the work is done in your browser, we do not harvest any pet names you may enter!
        </Box>
      </Stack>
    </Container>
  )
}

function App() {
  const [petName, setPetName] = React.useState('');
  const [error, setError] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [downloadedCount, setDownloadedCount] = React.useState(0);

  const makeZip = async (name, sci) => {
    let zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"));

    let promises = []; // whee

    try {
      for (const [emo_name, emo_value] of Object.entries(EMOTIONS)) {
        for (const [size_name, size_value] of Object.entries(SIZES)) {
          promises.push(
            fetch(`http://localhost:8080/http://pets.neopets.com/cp/${sci}/${emo_value}/${size_value}.png`)
              .then(async (response) => {
                const path = `${size_name}/${emo_name}.png`;
                const blob = await response.blob();
                await zipWriter.add(path, new zip.BlobReader(blob))
                setDownloadedCount(previous => previous + 1);
              })
          );
        };
      }
      await Promise.all(promises); // Grab 'em all!
    } catch (error) {
      alert(error);
    }

    const dataURI = URL.createObjectURL(await zipWriter.close());

    const anchor = document.createElement("a");
    const clickEvent = new MouseEvent("click");
    anchor.href = dataURI;
    anchor.download = `${name}-${sci}.zip`;
    anchor.dispatchEvent(clickEvent);
  };

  const getSci = async () => {
    setInProgress(true);
    try {
      const response = await axios.head(`http://localhost:8080/http://pets.neopets.com/cpn/${petName}/1/1.png`);
      setError(false);
      setDone(true);

      await makeZip(petName, response.headers['x-final-url'].split('/')[4]);

    } catch (error) {
      // alert(error);
      setError(true);
      setDone(true);
    }
  };

  const handlePetNameChange = (event) => {
    let name = event.target.value;
    setPetName(name);
    setDone(false);
    setInProgress(false);
    setError(false);
    setDownloadedCount(0);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <HStack>
              <Image
                borderRadius='full'
                boxSize='350px'
                src='/alex.png'
                title='Eggy Weggs!'
              />
              <About />
            </HStack>
            <Input
              value={petName}
              isInvalid={error && petName}
              onChange={handlePetNameChange}
              placeholder="Enter a Neopet's name" />
            <Button
              disabled={error || !petName || done || inProgress}
              onClick={getSci}>
              Do the thing
            </Button>
            <Progress
              hasStripe
              value={100 * (downloadedCount / (Object.keys(EMOTIONS).length * Object.keys(SIZES).length))}
              size='md'
              width={inProgress ? 'full' : null}
            />
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
