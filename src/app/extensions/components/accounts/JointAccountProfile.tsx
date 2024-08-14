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
  NumberInput,
} from "@hubspot/ui-extensions";
import { CrmCardActions, CrmActionButton } from "@hubspot/ui-extensions/crm";
import type { ModelProps, ModelFormProps, Kyc, JointAccountProfileProps, JointAccountFormProps } from "../../types";

export const JointAccountProfile = ({
  ticket,
  runServerless,
  onCancelClick,
  onSaveClick,
}: JointAccountProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formProperties, setFormProperties] = useState<Array<JointAccountFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [disableAllocation, setDisableAllocation] = useState(true);
  const [showOwnershipAllocation, setShowOwnershipAllocation] = useState(false);
  const [disableSave, setDisableSave] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticket && ticket.ownership_type) {
      const showOwnership = ticket.ownership_type.label === "Tenants in common";
      setShowOwnershipAllocation(showOwnership);
    }
  }, [ticket]);

  // Update id props on ticket
  const updateTicket = () => {
    const ticketId = ticket.hs_object_id;
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "updateTicketProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, ticketId }, // Send ticket props
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

  const options = ["Joint tenants", "Tenants in common"].map((n) => ({
    label: n,
    value: n,
  }));

  useEffect(() => {
    if (formProperties && typeof formProperties === "object") {
      const allPropsComplete = Object.values(formProperties).every((value) => {
        return value !== undefined; // Ensure the value is not undefined
      });

      setDisabled(!allPropsComplete);
    } else {
      console.error("formProperties is not an object:", typeof formProperties);
    }
  }, [formProperties]);

  useEffect(() => {
    if (formProperties && typeof formProperties === "object") {
      const allocation1 = formProperties.participant_or_estate_allocation;
      const allocation2 = formProperties.participant_or_estate_allocation_2;
      const total = allocation1 + allocation2;

      setDisableAllocation(!isNaN(total) ? total !== 100 : disableAllocation);
      setError(!isNaN(total) ? total !== 100 : false);
    } else {
      console.error("formProperties is not an object:", typeof formProperties);
    }
  }, [formProperties]);

  const getOwnershipVal = () => {
    if (ticket && ticket.ownership_type) {
      const ownershipVal = ticket.ownership_type.label;
      return ownershipVal;
    }
    return "";
  };

  return (
    <>
      <Flex direction={"column"} gap={"md"}>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"column"} gap={"extra-small"}>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Heading>Joint Account Profile</Heading>
          </Flex>
          <Divider distance="sm" />
          <Tile>
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="survivorship"
                    label="Survivorship Details"
                    options={options}
                    toggleType="radioButtonList"
                    value={formProperties.ownership_type ? formProperties.ownership_type : getOwnershipVal()}
                    onChange={(value) => {
                      if (value && value === "Tenants in common") {
                        setFormProperties({
                          ...formProperties,
                          ownership_type: value,
                          participant_or_estate: undefined,
                          participant_or_estate_allocation: undefined,
                          participant_or_estate_2: undefined,
                          participant_or_estate_allocation_2: undefined,
                        });
                        setShowOwnershipAllocation(true);
                        setDisabled(true);
                        setDisableAllocation(true);
                      } else if (value) {
                        setFormProperties({
                          ...formProperties,
                          ownership_type: value,
                          participant_or_estate: undefined,
                          participant_or_estate_allocation: undefined,
                          participant_or_estate_2: undefined,
                          participant_or_estate_allocation_2: undefined,
                        });
                        setShowOwnershipAllocation(false);
                        setDisabled(false);
                        setDisableAllocation(false);
                      } else {
                        setFormProperties({
                          ...formProperties,
                          ownership_type: undefined,
                          participant_or_estate: undefined,
                          participant_or_estate_allocation: undefined,
                          participant_or_estate_2: undefined,
                          participant_or_estate_allocation_2: undefined,
                        });
                        setShowOwnershipAllocation(false);
                        setDisabled(true);
                        setDisableAllocation(true);
                      }
                    }}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              {showOwnershipAllocation && (
                <>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="participant-or-estate"
                        label="Name of Participant or their Estate"
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            participant_or_estate: value,
                          });
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <NumberInput
                        name="participant-or-estate-allocation"
                        label="Allocation"
                        error={error}
                        validationMessage={error ? "The total across all participants or estates must equal 100" : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            participant_or_estate_allocation: value,
                          });
                        }}
                        min={1}
                        max={99}
                        precision={2}
                        formatStyle={"percentage"}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="participant-or-estate"
                        label="Name of Participant or their Estate"
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            participant_or_estate_2: value,
                          });
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <NumberInput
                        name="participant-or-estate-allocation-2"
                        label="Allocation"
                        error={error}
                        validationMessage={error ? "The total across all participants or estates must equal 100" : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            participant_or_estate_allocation_2: value,
                          });
                        }}
                        min={1}
                        max={99}
                        precision={2}
                        formatStyle={"percentage"}
                      />
                    </Flex>
                  </Flex>
                </>
              )}
            </Flex>
          </Tile>
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button variant="primary" onClick={updateTicket} disabled={disabled || disableAllocation}>
            Save
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
