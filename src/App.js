import React from 'react';
import {
  Box,
  VStack,
  Grid,
  Input,
  Image,
  Button,
  HStack,
  Container,
  Progress,
  Stack,
  useColorModeValue,
  Divider,
  SkeletonCircle,
  useToast,
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
  const [alreadySavedPets, setAlreadySavedPets] = React.useState([]);
  const toast = useToast();

  const addPetToState = (petName, error) => {
    setAlreadySavedPets(existingArray => {
      const petIndex = existingArray.findIndex(pet => pet.petName === petName);
      const newPet = {
        error,
        petName,
        downloaded: 0,
        done: false,
      };
      return [newPet, ...existingArray.filter((_, i) => i !== petIndex)]
    });
  };

  const updatePetInState = (petName, data) => {   
    setAlreadySavedPets(existingArray => {
      const petIndex = Math.max(0, existingArray.findIndex(pet => pet.petName === petName));
      const existingPet = existingArray[petIndex];
      const newPet = { // a neoPet, in a way
        ...existingPet,
        ...data,
      };
      return [...existingArray.slice(0, petIndex), newPet, ...existingArray.slice(petIndex+1)]
    });
  };

  const incrementDownloadedForPet = (petName) => {
    setAlreadySavedPets(existingArray => {
      const petIndex = Math.max(0, existingArray.findIndex(pet => pet.petName === petName));
      const existingPet = existingArray[petIndex];
      const newPet = {
        ...existingPet,
        downloaded: (existingPet?.downloaded ?? 0) + 1,
      };
      return [...existingArray.slice(0, petIndex), newPet, ...existingArray.slice(petIndex+1)]
    });
  }

  const makeZip = async (name, sci) => {
    let zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"));

    let promises = []; // whee
    let error = undefined;

    try {
      for (const [emo_name, emo_value] of Object.entries(EMOTIONS)) {
        for (const [size_name, size_value] of Object.entries(SIZES)) {
          promises.push(
            fetch(`http://localhost:8080/http://pets.neopets.com/cp/${sci}/${emo_value}/${size_value}.png`)
              .then(async (response) => {
                const path = `${size_name}/${emo_name}.png`;
                const blob = await response.blob();
                await zipWriter.add(path, new zip.BlobReader(blob))
                incrementDownloadedForPet(name);
              })
          );
        };
      }
      await Promise.all(promises); // Grab 'em all!
    } catch (e) {
      error = e;
      toast({
        id: name,
        status: 'error',
        title: `Error downloading ${name}'s images: ${e}`,
        isClosable: true
      });
    }

    const dataURI = URL.createObjectURL(await zipWriter.close());

    const anchor = document.createElement("a");
    const clickEvent = new MouseEvent("click");
    anchor.href = dataURI;
    anchor.download = `${name}-${sci}.zip`;
    anchor.dispatchEvent(clickEvent);
    URL.revokeObjectURL(dataURI);

    updatePetInState(petName, {error, done: true});
  };

  const getSci = async (petName) => {
    if (petName === "") { return; }
    try {
      // TODO: use fetch for this request + remove axios dependency
      addPetToState(petName, false);
      setPetName("");
      const response = await axios.head(`http://localhost:8080/http://pets.neopets.com/cpn/${petName}/1/1.png`);
      await makeZip(petName, response.headers['x-final-url'].split('/')[4]);

    } catch (error) {
      toast({
        id: 'getSci',
        status: 'error',
        title: `Error downloading ${petName}'s images - make sure you spelled their name correctly.`,
        isClosable: true
      });
      updatePetInState(petName, {error: true});
    }
  };

  const handlePetNameChange = (event) => {
    let name = event.target.value;
    setPetName(name);
  };

  const green = useColorModeValue('green.300', 'green.500');

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid p={3} >
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8} divider={<Divider maxW='3xl' />}>
          <HStack>
            <Image
              borderRadius='full'
              boxSize='350px'
              src='/alex.png'
              title='Eggy Weggs!'
            />
            <About />
          </HStack>
          <HStack>
            <Image
              src={`http://pets.neopets.com/cpn/${petName}/1/6.png`}
              title={petName}
              fallback={
                <SkeletonCircle
                  boxSize='70px'
                />
              }
              borderRadius='full'
              boxSize='70px'
            />
            <Stack
              as={Box}
              minWidth={'xl'}
              spacing={4}>
              <HStack>
                <Input
                  borderColor={green}
                  value={petName}
                  onChange={handlePetNameChange}
                  placeholder="Enter a Neopet's name"
                  onKeyPress={(e) => e.key === 'Enter' && getSci(petName) }
                />
                <Button
                  disabled={!petName}
                  onClick={getSci}
                  bgColor={green}
                >
                  Download
                </Button>
              </HStack>
              <Progress
                hasStripe
                isAnimated={true}
                value={0}
                size='md'
                width={null}
              />
            </Stack>
          </HStack>
          {alreadySavedPets.map(({error, petName, downloaded, done}) => <HStack>
            <Image
              src={`http://pets.neopets.com/cpn/${petName}/1/6.png`}
              title={petName}
              fallback={
                <SkeletonCircle
                  boxSize='70px'
                  startColor='red.300'
                  endColor='red.300'
                />
              }
              borderRadius='full'
              boxSize='70px'
            />
            <Stack
              as={Box}
              minWidth={'xl'}
              spacing={4}>
              <HStack>
                <Box textColor={error ? 'red.300' : null}>
                  {petName} {error && "(Error)"}
                </Box>
              </HStack>
              <Progress
                hasStripe
                isAnimated={!done}
                value={(done && !error) ? 100 : 100 * (downloaded / (Object.keys(EMOTIONS).length * Object.keys(SIZES).length))}
                size='md'
                width='full'
                colorScheme={error ? 'red' : 'blue'}
              />
            </Stack>
          </HStack>)}
        </VStack>
      </Grid>
    </Box>
  );
}

export default App;
