'use client'

import styles from './Card.module.css'

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { socketActions } from '@/redux/features/socketSlice';
import {
  Box,
  Button,
  Code,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DEFAULT_ROOM_ID } from '@/sockets/@types/Room';
import Entity from './Entity';

const RoomDetailsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const toast = useToast();
  const [isCopiedRoomId, setIsCopiedRoomId] = useState(false);
  const [isCopiedAdminId, setIsCopiedAdminId] = useState(false);
  const [isCopiedPassword, setIsCopiedPassword] = useState(false);

  const handleCopy = async (codeText: string, setIsCopied: Dispatch<SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset "Copied" state after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const leaveRoom = () => {
    if (room.id != DEFAULT_ROOM_ID) {
      dispatch(socketActions.leaveRoom(room.id));
      handleModalClose();
    }
  };

  // Reset state when the modal closes
  const handleModalClose = () => {
    // clean states
    // Close the modal
    onClose();
  };

  const displayInfo = (title: string, data: string, isCopiedValue: boolean, isCopiedUpdateFunction: Dispatch<SetStateAction<boolean>>) => (
    <Box mb={5}>
      <Text>{title}</Text>
      <Flex direction="row" alignItems="center">
        <Box overflowX="auto" maxWidth="100%">
          <Code
            p={2}
            display="inline-block"
            whiteSpace="pre-wrap"
            borderRightRadius="0"  // Remove right border radius
            border="1px solid"  // Add border to match button
            borderColor="gray.200"
            height='auto'
          >
            {data}
          </Code>
        </Box>
        <Button
          onClick={() => handleCopy(data, isCopiedUpdateFunction)}
          colorScheme="teal"
          variant="solid"
          borderLeftRadius="0"  // Remove left border radius
          p={3}
          border="1px solid"
          borderColor="gray.200"
        >
          {isCopiedValue ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </Flex>
    </Box>
  );

  const displayEntities = () => (
    <Box>
      <Text>Entities</Text>
      {room.entities?.map((entity) => (
        <Box key={entity.uid} style={{ marginBottom: "1em" }}>
          <Text>{entity.name}</Text>
          <Text>{entity.uid}</Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent maxWidth="90%">
        <ModalHeader>Room details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display='flex' gap={2} flexDirection='column'>
            {displayInfo("Room id", room.id, isCopiedRoomId, setIsCopiedRoomId)}
            {displayInfo("Admin id", room.adminId, isCopiedAdminId, setIsCopiedAdminId)}
            {room.password.length === 0 ?
              <Box>
                <Text>Password</Text>
                <Text>no password</Text>
              </Box>
              : displayInfo("Password", room.password, isCopiedPassword, setIsCopiedPassword)
            }
            {displayEntities()}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleModalClose}>
            Close
          </Button>
          <Button colorScheme='red' onClick={leaveRoom}>Leave room</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RoomDetailsModal;