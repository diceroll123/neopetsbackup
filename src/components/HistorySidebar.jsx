import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Image,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  Spacer,
} from '@chakra-ui/react';
import {
  FaTrash,
  FaDownload,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaRedo,
  FaCopy,
  FaImages,
  FaInfoCircle,
} from 'react-icons/fa';

const LazyImage = React.memo(
  ({ entry, selectedPet, formatDate, scrollContainerRef, galleryBgColor }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [shouldLoad, setShouldLoad] = React.useState(false);
    const imgRef = React.useRef();

    React.useEffect(() => {
      const currentRef = imgRef.current;
      if (!currentRef) return;

      const scrollContainer = scrollContainerRef?.current || null;

      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        {
          root: scrollContainer,
          rootMargin: '100px',
        }
      );

      observer.observe(currentRef);

      return () => {
        observer.disconnect();
      };
    }, [scrollContainerRef]);

    return (
      <Box
        ref={imgRef}
        position="relative"
        borderRadius="md"
        overflow="hidden"
        boxShadow="sm"
        cursor="pointer"
        _hover={{
          transform: 'scale(1.05)',
          boxShadow: 'lg',
          zIndex: 1,
          transition: 'all 0.2s',
        }}
        transition="all 0.2s"
        bg={galleryBgColor}
        minH="200px"
      >
        {shouldLoad ? (
          <>
            {!isLoaded && (
              <Skeleton
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                minH="200px"
              />
            )}
            <Image
              src={`https://pets.neopets.com/cp/${entry.sci}/1/4.png`}
              alt={`${selectedPet} - ${formatDate(entry.t)}`}
              width="100%"
              height="auto"
              objectFit="contain"
              onLoad={() => setIsLoaded(true)}
              style={{ display: isLoaded ? 'block' : 'none' }}
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="blackAlpha.800"
              color="white"
              p={1.5}
              fontSize="xs"
            >
              {formatDate(entry.t)}
            </Box>
          </>
        ) : (
          <Skeleton width="100%" minH="200px" />
        )}
      </Box>
    );
  }
);

LazyImage.displayName = 'LazyImage';

const HistorySidebar = ({
  sciHistory,
  onDeleteEntry,
  onImport,
  onRedownload,
  onDownloadCurrent,
}) => {
  const toast = useToast();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isGalleryOpen,
    onOpen: onGalleryOpen,
    onClose: onGalleryClose,
  } = useDisclosure();
  const [importData, setImportData] = React.useState('');
  const [selectedPet, setSelectedPet] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [cooldowns, setCooldowns] = React.useState({});
  const cancelRef = React.useRef();
  const galleryScrollRef = React.useRef();

  // Update cooldown timers
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const now = Date.now();
        const updated = {};
        Object.keys(prev).forEach(key => {
          const remaining = prev[key] - now;
          if (remaining > 0) {
            updated[key] = prev[key];
          }
        });
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getCooldownRemaining = key => {
    const cooldownEnd = cooldowns[key];
    if (!cooldownEnd) return 0;
    const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
    return Math.max(0, remaining);
  };

  const setCooldown = (key, seconds = 10) => {
    setCooldowns(prev => ({
      ...prev,
      [key]: Date.now() + seconds * 1000,
    }));
  };

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const entryBgColor = useColorModeValue('white', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const helpTextColor = useColorModeValue('gray.600', 'gray.400');
  const galleryBgColor = useColorModeValue('gray.100', 'gray.900');
  const currentPetBorderColor = useColorModeValue('green.400', 'green.500');
  const currentPetTextColor = useColorModeValue('green.600', 'green.400');

  const handleDeleteClick = (petName, index) => {
    setDeleteTarget({ petName, index });
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDeleteEntry(deleteTarget.petName, deleteTarget.index);
      toast({
        status: 'success',
        title: 'Entry deleted',
        duration: 2000,
        isClosable: true,
      });
      setDeleteTarget(null);
    }
    onDeleteClose();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sciHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neopets-sci-history-${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      status: 'success',
      title: 'History exported',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      onImport(parsed);
      setImportData('');
      onImportClose();
      toast({
        status: 'success',
        title: 'History imported',
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        status: 'error',
        title: 'Invalid JSON',
        description: e.message,
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = React.useCallback(timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }, []);

  const formatShortDate = React.useCallback(timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  const handlePetClick = petName => {
    setSelectedPet(petName);
  };

  const handleBackClick = () => {
    setSelectedPet(null);
  };

  const handleOpenGallery = () => {
    onGalleryOpen();
  };

  const handleRedownload = (petName, sci) => {
    const key = `redownload-${petName}-${sci}`;
    if (getCooldownRemaining(key) > 0) return;
    setCooldown(key);
    onRedownload(petName, sci);
  };

  const handleDownloadCurrent = petName => {
    const key = `download-current-${petName}`;
    if (getCooldownRemaining(key) > 0) return;
    setCooldown(key);
    onDownloadCurrent(petName);
  };

  const handleCopyImageUrl = async sci => {
    const imageUrl = `https://pets.neopets.com/cp/${sci}/1/7.png`;
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        status: 'success',
        title: 'Image URL copied to clipboard',
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        status: 'error',
        title: 'Failed to copy URL',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Sort pet names by most recent entry timestamp
  const sortedPets = Object.entries(sciHistory).sort((a, b) => {
    const aLatest = a[1].length > 0 ? a[1][0].t : 0;
    const bLatest = b[1].length > 0 ? b[1][0].t : 0;
    return bLatest - aLatest;
  });

  const selectedPetEntries = selectedPet ? sciHistory[selectedPet] || [] : [];

  return (
    <>
      <Box
        width="300px"
        height="100vh"
        bg={bgColor}
        borderRightWidth="1px"
        borderColor={borderColor}
        overflowY="auto"
        position="fixed"
        left={0}
        top={0}
        p={4}
      >
        <VStack spacing={4} align="stretch">
          {selectedPet ? (
            // Detail view
            <>
              <HStack>
                <IconButton
                  icon={<FaChevronLeft />}
                  size="sm"
                  onClick={handleBackClick}
                  aria-label="Back"
                />
                <Text fontSize="lg" fontWeight="bold" flex={1}>
                  {selectedPet}
                </Text>
              </HStack>
              <Divider />
              {/* Current Pet View */}
              <Box
                borderWidth="2px"
                borderColor={currentPetBorderColor}
                borderRadius="lg"
                p={4}
                bg={entryBgColor}
                boxShadow="md"
              >
                <VStack spacing={3} align="stretch">
                  <HStack spacing={2}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={currentPetTextColor}
                    >
                      Current Appearance
                    </Text>
                    <Spacer />
                    <Popover trigger="hover" placement="top">
                      <PopoverTrigger>
                        <IconButton
                          icon={<FaInfoCircle />}
                          size="xs"
                          variant="ghost"
                          colorScheme="gray"
                          aria-label="Info"
                        />
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent width="auto" maxW="250px">
                          <PopoverBody fontSize="sm" p={3}>
                            Due to limitations, we can't know if the current
                            appearance has already been downloaded.
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                  </HStack>
                  <Box overflow="hidden" boxShadow="md" alignSelf="center">
                    <Image
                      src={`https://pets.neopets.com/cpn/${selectedPet}/1/4.png`}
                      alt={`${selectedPet} current appearance`}
                      maxW="200px"
                      fallback={<Skeleton height="200px" width="200px" />}
                    />
                  </Box>
                  <Button
                    colorScheme="green"
                    size="md"
                    leftIcon={<FaDownload />}
                    onClick={() => handleDownloadCurrent(selectedPet)}
                    fontWeight="bold"
                    isDisabled={
                      getCooldownRemaining(`download-current-${selectedPet}`) >
                      0
                    }
                  >
                    Download
                  </Button>
                </VStack>
              </Box>
              <Divider />
              <HStack justify="space-between" px={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Previous Downloads
                </Text>
                {selectedPetEntries.length > 0 && (
                  <Button
                    size="xs"
                    leftIcon={<FaImages />}
                    onClick={handleOpenGallery}
                    colorScheme="purple"
                    variant="outline"
                  >
                    Gallery
                  </Button>
                )}
              </HStack>
              {selectedPetEntries.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  No entries for this pet
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {selectedPetEntries.map((entry, index) => (
                    <Box
                      key={`${entry.t}-${entry.sci}`}
                      borderWidth="1px"
                      borderRadius="lg"
                      p={3}
                      bg={entryBgColor}
                      boxShadow="sm"
                      _hover={{
                        boxShadow: 'md',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s',
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3} align="start">
                        <Popover trigger="hover" placement="right">
                          <PopoverTrigger>
                            <Box
                              cursor="pointer"
                              borderRadius="lg"
                              overflow="hidden"
                              boxShadow="md"
                              flexShrink={0}
                              _hover={{
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s',
                              }}
                              transition="transform 0.2s"
                            >
                              <Image
                                src={`https://pets.neopets.com/cp/${entry.sci}/1/6.png`}
                                fallback={
                                  <Skeleton boxSize="60px" borderRadius="lg" />
                                }
                                boxSize="60px"
                                objectFit="cover"
                              />
                            </Box>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent width="auto">
                              <PopoverBody p={2}>
                                <Image
                                  src={`https://pets.neopets.com/cp/${entry.sci}/1/4.png`}
                                  alt={`${selectedPet} as it was on ${formatDate(
                                    entry.t
                                  )}`}
                                  maxW="200px"
                                />
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                        <VStack
                          align="start"
                          spacing={2}
                          flex={1}
                          minW={0}
                          overflow="hidden"
                        >
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="medium"
                            isTruncated
                            width="100%"
                          >
                            {formatDate(entry.t)}
                          </Text>
                          <HStack spacing={1.5} mt={1} flexWrap="wrap">
                            <Button
                              size="xs"
                              colorScheme="blue"
                              leftIcon={<FaRedo />}
                              onClick={() =>
                                handleRedownload(selectedPet, entry.sci)
                              }
                              borderRadius="md"
                              fontWeight="medium"
                              flexShrink={0}
                              isDisabled={
                                getCooldownRemaining(
                                  `redownload-${selectedPet}-${entry.sci}`
                                ) > 0
                              }
                            >
                              Redownload
                            </Button>
                            <Popover trigger="hover" placement="top">
                              <PopoverTrigger>
                                <IconButton
                                  icon={<FaCopy />}
                                  size="xs"
                                  variant="outline"
                                  colorScheme="gray"
                                  onClick={() => handleCopyImageUrl(entry.sci)}
                                  aria-label="Copy image URL"
                                  borderRadius="md"
                                  flexShrink={0}
                                />
                              </PopoverTrigger>
                              <PopoverContent width="auto">
                                <PopoverBody fontSize="sm" p={2}>
                                  Copy full-size image URL
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Popover trigger="hover" placement="top">
                              <PopoverTrigger>
                                <IconButton
                                  icon={<FaTrash />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteClick(selectedPet, index)
                                  }
                                  aria-label="Delete entry"
                                  borderRadius="md"
                                  flexShrink={0}
                                />
                              </PopoverTrigger>
                              <PopoverContent width="auto">
                                <PopoverBody fontSize="sm" p={2}>
                                  Delete this entry
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                          </HStack>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          ) : (
            // List view
            <>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    History
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    All data stored locally
                  </Text>
                </VStack>
                <HStack>
                  <Popover trigger="hover" placement="bottom">
                    <PopoverTrigger>
                      <IconButton
                        icon={<FaDownload />}
                        size="sm"
                        onClick={handleExport}
                        aria-label="Export"
                      />
                    </PopoverTrigger>
                    <PopoverContent width="auto">
                      <PopoverBody fontSize="sm" p={2}>
                        Export history
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  <Popover trigger="hover" placement="bottom">
                    <PopoverTrigger>
                      <IconButton
                        icon={<FaUpload />}
                        size="sm"
                        onClick={onImportOpen}
                        aria-label="Import"
                      />
                    </PopoverTrigger>
                    <PopoverContent width="auto">
                      <PopoverBody fontSize="sm" p={2}>
                        Import history
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </HStack>
              <Divider />
              {sortedPets.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  No history yet, start by entering a pet name to the right.
                </Text>
              ) : (
                sortedPets.map(([petName, entries]) => {
                  const latestEntry = entries[0];

                  return (
                    <Box
                      key={petName}
                      borderWidth="1px"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Box
                        p={3}
                        bg={entryBgColor}
                        cursor="pointer"
                        _hover={{ bg: hoverBgColor }}
                        onClick={() => handlePetClick(petName)}
                      >
                        <HStack spacing={3}>
                          <Popover trigger="hover" placement="right">
                            <PopoverTrigger>
                              <Box cursor="pointer">
                                <Image
                                  src={`http://pets.neopets.com/cp/${latestEntry.sci}/1/6.png`}
                                  fallback={
                                    <Skeleton
                                      boxSize="60px"
                                      borderRadius="xl"
                                    />
                                  }
                                  borderRadius="xl"
                                  boxSize="60px"
                                />
                              </Box>
                            </PopoverTrigger>
                            <Portal>
                              <PopoverContent width="auto">
                                <PopoverBody p={2}>
                                  <Image
                                    src={`https://pets.neopets.com/cp/${latestEntry.sci}/1/4.png`}
                                    alt={`${petName} as it was on ${formatShortDate(
                                      latestEntry.t
                                    )}`}
                                    maxW="200px"
                                    borderRadius="xl"
                                  />
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>
                          <VStack align="start" spacing={0} flex={1} minW={0}>
                            <Text
                              fontWeight="bold"
                              fontSize="sm"
                              isTruncated
                              maxW="180px"
                            >
                              {petName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Last entry: {formatShortDate(latestEntry.t)}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {entries.length} entries
                            </Text>
                          </VStack>
                          <FaChevronRight color="gray.400" />
                        </HStack>
                      </Box>
                    </Box>
                  );
                })
              )}
            </>
          )}
        </VStack>
      </Box>

      {/* Import Modal */}
      <Modal isOpen={isImportOpen} onClose={onImportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={helpTextColor} mb={3}>
              Imported data will be merged with your existing history. Duplicate
              entries will be deduplicated. :)
            </Text>
            <Textarea
              value={importData}
              onChange={e => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              height="300px"
              fontFamily="mono"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleImport}>
              Import
            </Button>
            <Button variant="ghost" onClick={onImportClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={onGalleryClose}
        size="6xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          maxW="95vw"
          maxH="85vh"
          display="flex"
          flexDirection="column"
        >
          <ModalHeader flexShrink={0}>
            {selectedPet} - Gallery ({selectedPetEntries.length} entries)
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" pb={4} flex={1} ref={galleryScrollRef}>
            {selectedPetEntries.length > 0 && (
              <Grid
                templateColumns={{
                  base: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                  xl: 'repeat(5, 1fr)',
                }}
                gap={3}
              >
                {selectedPetEntries.map((entry, index) => (
                  <LazyImage
                    key={`${entry.t}-${entry.sci}`}
                    entry={entry}
                    selectedPet={selectedPet}
                    formatDate={formatDate}
                    scrollContainerRef={galleryScrollRef}
                    galleryBgColor={galleryBgColor}
                  />
                ))}
              </Grid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Entry
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default HistorySidebar;
