import React from 'react';
import {
  Box,
  VStack,
  Image,
  HStack,
  Progress,
  Skeleton,
  Badge,
  Icon,
  SimpleGrid,
  Text,
  LinkOverlay,
  LinkBox,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFileArchive } from 'react-icons/fa';
import { EMOTIONS, SIZES } from '../utils/constants';

const SavedPets = props => {
  // one instance of the container of a pet that is either downloaded, to be downloaded, or errored.
  const { alreadySavedPets } = props;

  const errorStartColor = useColorModeValue('red.100', 'red.800');
  const errorEndColor = useColorModeValue('red.400', 'red.600');

  return (
    <SimpleGrid columns={3} spacing={3} minWidth={'xl'}>
      {alreadySavedPets.map(({ error, petName, downloaded, done, bytes }) => (
        <LinkBox key={petName} title={petName}>
          <Box
            as={HStack}
            borderWidth="1px"
            borderRadius="lg"
            p={2}
            minW="230px"
          >
            <Image
              src={`http://pets.neopets.com/cpn/${petName}/1/6.png`}
              fallback={
                <Skeleton
                  boxSize="70px"
                  borderRadius="xl"
                  startColor={error ? errorStartColor : null}
                  endColor={error ? errorEndColor : null}
                />
              }
              borderRadius="xl"
              boxSize="70px"
            />
            <VStack alignItems={'start'}>
              <Box textColor={error ? 'red.300' : null} maxW="145px">
                <LinkOverlay
                  href={`http://www.neopets.com/petlookup.phtml?pet=${petName}`}
                  isExternal
                >
                  <Text isTruncated>{petName}</Text>
                </LinkOverlay>
              </Box>
              {error ? (
                <Badge colorScheme="red">ERROR</Badge>
              ) : (
                <>
                  {done ? (
                    <HStack>
                      <Badge colorScheme="green">SUCCESS</Badge>{' '}
                      <Badge colorScheme="blue">
                        <Icon boxSize="14px" as={FaFileArchive} mb={'-2px'} />{' '}
                        {(bytes / (1024 * 1024)).toFixed(2)}MB
                      </Badge>
                    </HStack>
                  ) : (
                    <Progress
                      hasStripe
                      isAnimated
                      value={
                        100 *
                        (downloaded /
                          (Object.keys(EMOTIONS).length *
                            Object.keys(SIZES).length))
                      }
                      width="130px"
                      colorScheme={'blue'}
                    />
                  )}
                </>
              )}
            </VStack>
          </Box>
        </LinkBox>
      ))}
    </SimpleGrid>
  );
};

export default SavedPets;
