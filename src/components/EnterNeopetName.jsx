import React from 'react';
import {
  Input,
  Image,
  Button,
  HStack,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';

const EnterNeopetName = props => {
  // The skeleton/image of the pet + the input field for pet name + the download button
  const { petName, setCanDownload, handlePetNameChange, getSci } = props;

  const green = useColorModeValue('green.300', 'green.500');

  return (
    <HStack minWidth={'2xl'} spacing={4}>
      <Image
        src={`http://pets.neopets.com/cpn/${petName}/1/6.png`}
        title={petName}
        fallback={<Skeleton boxSize="70px" borderRadius="xl" />}
        borderRadius="xl"
        boxSize="70px"
        onLoad={() => setCanDownload(true)}
      />
      <HStack>
        <Input
          minWidth={'md'}
          borderColor={green}
          value={petName}
          onChange={handlePetNameChange}
          placeholder="Enter a Neopet's name"
          onKeyPress={e => e.key === 'Enter' && getSci(petName)}
        />
        <Button
          disabled={!petName}
          onClick={() => getSci(petName)}
          bgColor={green}
        >
          Download
        </Button>
      </HStack>
    </HStack>
  );
};

export default EnterNeopetName;
