import React, { useCallback, useEffect, useState } from "react";
import {
  Divider,
  LoadingSpinner,
  ErrorState,
  Text,
  Button,
  Flex,
  Box,
  Tile,
  Heading,
  Accordion,
  Form,
  Input,
  DateInput,
  Select,
  Alert,
  StepIndicator,
  ToggleGroup,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextArea,
} from "@hubspot/ui-extensions";
import type { CancelProps, CancelFormProps, Kyc } from "../../types";

export const Cancel = ({ ticket, kycs, runServerless, onCancelClick, onSaveClick }: CancelProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [disabled, setDisabled] = useState(true);
  // const [bankProps, setBankProps] = useState<AdditionalQuestionFormProps | null>(null);

  useEffect(() => {
    if (confirmation === "Cancel") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [confirmation]);

  // Update id props on ticket
  const cancelApplication = () => {
    setLoading(true);
    const ticketId = ticket.hs_object_id;
    const kycIds = kycs.map((obj) => obj.hs_object_id);
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "cancel",
      propertiesToSend: ["hs_object_id"],
      parameters: { ticketId, kycIds }, // Send ticket props
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          console.log("Response: ", resp.status);
          onSaveClick();
        } else {
          setError("Update application ticket resulted in an error", resp.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction={"column"} align={"center"}>
      <Box alignSelf={"center"}>
        <ErrorState title="Cancel application?" layout="vertical" reverseOrder={true}>
          <Text>You're about to cancel this application, which cannot be undone.</Text>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Type the word below to cancel</Text>
              </Flex>
              <Box alignSelf={"stretch"}>
                <Input
                  name="confirm-delete"
                  label=""
                  error={error}
                  validationMessage={validationMessage}
                  placeholder="Cancel"
                  onChange={(value) => {
                    setConfirmation(value);
                    // if (value === "Cancel") {
                    //   setDisabled(false);
                    // } else {
                    //   setDisabled(true);
                    // }
                  }}
                  onInput={(value) => {
                    setConfirmation(value);
                  }}
                />
              </Box>
            </Flex>
            <Flex direction={"row"} gap={"sm"} justify={"start"}>
              <Button onClick={() => cancelApplication()} variant="destructive" disabled={disabled}>
                Cancel
              </Button>
              <Button onClick={onCancelClick}>Back</Button>
            </Flex>
          </Flex>
        </ErrorState>
      </Box>
    </Flex>
  );
};
