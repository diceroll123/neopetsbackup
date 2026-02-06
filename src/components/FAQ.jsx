import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react';

const FAQ = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Frequently Asked Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Why does this site exist?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  We don't mean to alarm you, but to be quite honest: we're not
                  entirely sure if Neopets is going to last forever, and we love
                  our pets dearly. This site was created to help Neopets users
                  preserve their pets' appearances by downloading all the images
                  associated with each pet's current customization.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  What can this site be used for?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <Text>
                    <strong>Back-up your pets:</strong> Download a zip file of
                    all images of your Neopets in various emotions and sizes,
                    preserving their current appearance for posterity.
                  </Text>
                  <Text>
                    <strong>Track changes:</strong> Keep a history of your pets'
                    appearances over time. Each time you download, the site
                    saves the pet's image hash so you can see how your pets have
                    changed.
                  </Text>
                  <Text>
                    <strong>Share with Dress to Impress:</strong> Use the "Open
                    in DTI" button to view your pet's saved appearance on Dress
                    to Impress for planning customizations or sharing with
                    others.
                  </Text>
                  <Text>
                    <strong>Export your history:</strong> Download your entire
                    pet history as JSON, or import history from another device
                    or backup.
                  </Text>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Is my data private?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  Yes! All data is stored locally in your browser. We do not
                  harvest, collect, or transmit any pet names you enter. Your
                  pet history is saved in your browser's localStorage and never
                  leaves your device unless you explicitly export it.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FAQ;
