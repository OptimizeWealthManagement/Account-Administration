import React, { useState, useEffect, useCallback } from "react";
import { Modal, ModalBody, ModalFooter, Flex, Box, Heading, Button, Input, Form } from "@hubspot/ui-extensions";

export const ModalDefault = ({ actions }) => {
  return (
    <Modal id="help-modal" title="Help desk">
      <ModalBody>
        <Flex direction={"column"}>
          <Heading>About this request</Heading>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => actions.closeOverlay("help-modal")}>Cancel</Button>
        <Button onClick={() => actions.closeOverlay("help-modal")}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};
