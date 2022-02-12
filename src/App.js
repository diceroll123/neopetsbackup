import React from 'react';
import {
    Box,
    VStack,
    Grid,
    Divider,
    useToast,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import axios from 'axios';
import * as zip from "@zip.js/zip.js";
import About from './components/About';
import EnterNeopetName from './components/EnterNeopetName';
import SavedPets from './components/SavedPets';
import { EMOTIONS, SIZES } from './utils/constants';
import Footer from './components/Footer';


function App() {
    const [petName, setPetName] = React.useState('');
    const [alreadySavedPets, setAlreadySavedPets] = React.useState([]);
    const [canDownload, setCanDownload] = React.useState(false);
    const toast = useToast();

    const addPetToState = (petName, error) => {
        setAlreadySavedPets(existingArray => {
            const petIndex = existingArray.findIndex(pet => pet.petName.toLowerCase() === petName.toLowerCase());
            const newPet = {
                error,
                petName,
                downloaded: 0,
                done: false,
                bytes: 0,
            };
            return [newPet, ...existingArray.filter((_, i) => i !== petIndex)]
        });
    };

    const updatePetInState = (petName, data) => {
        setAlreadySavedPets(existingArray => {
            const petIndex = Math.max(0, existingArray.findIndex(pet => pet.petName.toLowerCase() === petName.toLowerCase()));
            const existingPet = existingArray[petIndex];
            const newPet = { // a neoPet, in a way
                ...existingPet,
                ...data,
            };
            return [...existingArray.slice(0, petIndex), newPet, ...existingArray.slice(petIndex + 1)]
        });
    };

    const incrementDownloadedForPet = (petName) => {
        setAlreadySavedPets(existingArray => {
            const petIndex = Math.max(0, existingArray.findIndex(pet => pet.petName.toLowerCase() === petName.toLowerCase()));
            const existingPet = existingArray[petIndex];
            const newPet = {
                ...existingPet,
                downloaded: (existingPet?.downloaded ?? 0) + 1,
            };
            return [...existingArray.slice(0, petIndex), newPet, ...existingArray.slice(petIndex + 1)]
        });
    };

    const makeZip = async (name, sci) => {
        let zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"));

        let promises = []; // whee
        let error = undefined;

        try {
            for (const [emo_name, emo_value] of Object.entries(EMOTIONS)) {
                for (const [size_name, size_value] of Object.entries(SIZES)) {
                    promises.push(
                        fetch(`/api/pet-proxy/?sci=${sci}&emote=${emo_value}&size=${size_value}`)
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

        updatePetInState(petName, { error, done: true, bytes: zipWriter?.writer?.size || 0 });
    };

    const getSci = async (petName) => {
        if (petName === "" || !canDownload) { return; }
        try {
            // TODO: use fetch for this request + remove axios dependency
            addPetToState(petName, false);
            setPetName("");
            const response = await axios.head(`/api/pet-proxy/?name=${petName}`);
            await makeZip(petName, response.headers['sci']);

        } catch (error) {
            toast({
                id: 'getSci',
                status: 'error',
                title: `Error downloading ${petName}'s images - make sure you spelled their name correctly.`,
                isClosable: true
            });
            updatePetInState(petName, { error: true });
        }
    };

    const handlePetNameChange = (event) => {
        let name = event.target.value;
        setPetName(name);
        setCanDownload(false);
    };

    return (
      <Flex
        direction="column"
        minHeight="100vh"
      >
          <Box 
            textAlign="center" 
            fontSize="xl"
          >
            <Grid 
              p={3}
              height={"calc(100vh-100px)"}
            >
                <ColorModeSwitcher justifySelf="flex-end" />
                <VStack 
                  spacing={8}
                  divider={<Divider maxW='3xl' />}
                >
                    
                    <About />

                    <EnterNeopetName
                        petName={petName}
                        setCanDownload={setCanDownload}
                        handlePetNameChange={handlePetNameChange}
                        getSci={getSci}
                    />

                    <SavedPets alreadySavedPets={alreadySavedPets} />
                </VStack>        
            </Grid>
          </Box>
          <Spacer />
          <Footer />
      </Flex>
    );
}

export default App;
