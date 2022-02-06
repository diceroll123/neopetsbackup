import React from 'react';
import {
    Box,
    VStack,
    Image,
    HStack,
    Progress,
    SkeletonCircle,
    Badge,
    Link,
    Icon,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaFileArchive } from 'react-icons/fa';
import { EMOTIONS, SIZES } from '../utils/constants';

const SavedPet = (props) => {
    // one instance of the container of a pet that is either downloaded, to be downloaded, or errored.
    const { error, petName, downloaded, done, bytes } = props;

    return (
        <Box as={HStack} key={petName} borderWidth='1px' borderRadius='lg' p={2} minW='230px'>
            <Image
                src={`http://pets.neopets.com/cpn/${petName}/1/6.png`}
                title={petName}
                fallback={
                    <SkeletonCircle
                        boxSize='70px'
                        startColor='red.300'
                        endColor='red.300'
                        mr={2}
                    />
                }
                borderRadius='full'
                boxSize='70px'
                mr={2}
            />
            <VStack w='full' alignItems={'start'}>
                <Box textColor={error ? 'red.300' : null}>
                    <Link href={`http://www.neopets.com/petlookup.phtml?pet=${petName}`} isExternal>{petName} <ExternalLinkIcon /></Link>
                </Box>
                {error ?
                    (
                        <Badge colorScheme='red'>ERROR</Badge>
                    ) :
                    (
                        <>
                            {done ?
                                (
                                    <Box>
                                        <Badge colorScheme='green'>SUCCESS</Badge>
                                        {' '}
                                        <Badge colorScheme='blue'>
                                            <Icon boxSize='14px' as={FaFileArchive} mb={'-2px'} />
                                            {' '}
                                            {(bytes / (1024 * 1024)).toFixed(2)}MB
                                        </Badge>
                                    </Box>
                                ) :
                                (
                                    <Progress
                                        hasStripe
                                        isAnimated
                                        value={100 * (downloaded / (Object.keys(EMOTIONS).length * Object.keys(SIZES).length))}
                                        width='full'
                                        colorScheme={'blue'}
                                    />
                                )
                            }
                        </>
                    )}
            </VStack>
        </Box>
    );
}

export default SavedPet;