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
  TableHead,
  TableHeader,
  Tag,
  NumberInput,
  EmptyState,
} from "@hubspot/ui-extensions";
import type {
  OtherBeneficiaryProps,
  OtherBeneficiaryApplicationProps,
  OtherBeneficiaryFormProps,
  SpousalApplicationProps,
  LockedInFormProps,
  SpousalApplicationFormProps,
} from "../../types";
import { legislationOptions } from "../../utils";

export const SpousalApplication = ({
  kyc,
  ticketId,
  tickets,
  fetchCrmObjectProperties,
  runServerless,
  onCancelClick,
  onSaveClick,
}: SpousalApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<SpousalApplicationFormProps>>([]); // Set form props to update ticket object with
  const [spousalApplicationProps, setSpousalApplicationProps] = useState<SpousalApplicationFormProps | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [showSource, setShowSource] = useState(false);

  // Loop through the tickets object, find all of the keys that match the allowed keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = ["hs_object_id", "spouse_sin", "spouse_email"];

    for (const [key, value] of Object.entries(kyc)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in legislationProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    setSpousalApplicationProps(newObject as SpousalApplicationFormProps);
  }, []); // Dependency array

  const convertDate = (value: number) => {
    const dateTimestamp = new Date(value);
    const dateYear = dateTimestamp.getFullYear();
    const dateMonth = dateTimestamp.getMonth();
    const dateDay = dateTimestamp.getDate();

    const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };

    return formattedDateObject;
  };

  const convertDateToNumber = (value: object) => {
    const dateNumber = Date.UTC(value.year, value.month, value.date);

    return dateNumber;
  };

  // minimum_calculated_based_on, spouse_sin, spouse_date_of_birth

  const updateKyc = () => {
    setLoading(true);
    // setKycId(kyc.hs_object_id);
    const kycId = kyc.hs_object_id;
    runServerless({
      name: "updateKycProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, kycId }, // Send update form properties to update the kyc
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        const status = resp.response;
        console.log(status);
        onSaveClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  // Check for null kyc values
  const checkNullValues = (obj) => {
    const nullKeys = Object.keys(obj).filter((key) => obj[key] === null);
    const anyNull = nullKeys.length === 0;
    return anyNull; // return true if one or more keys have null values
  };

  useEffect(() => {
    if (spousalApplicationProps) {
      const spousalPortion = { ...spousalApplicationProps };

      // Deleting non locked in keys
      Object.keys(spousalApplicationProps).forEach((key) => {
        if (key !== "spouse_sin" && key !== "spouse_email") {
          delete spousalPortion[key];
        }
      });

      const spousalComp = checkNullValues(spousalPortion);
      setDisabled(!spousalComp);
    }
  }, [spousalApplicationProps]);

  if (!spousalApplicationProps) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"column"} gap={"md"}>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"column"} gap={"extra-small"}>
          <Flex direction={"row"} gap={"md"} alignSelf={"end"} justify={"between"}>
            <Flex direction={"row"} gap={"md"} justify={"start"}>
              <Heading>Spousal Application</Heading>
            </Flex>
          </Flex>
          <Divider />
          <Tile>
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Flex direction={"column"}>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Box flex={1}>
                      <Input
                        name="spouse_sin"
                        label="Spouse's SIN"
                        value={spousalApplicationProps?.spouse_sin || null}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            spouse_sin: value,
                          });
                          setSpousalApplicationProps({
                            ...spousalApplicationProps,
                            spouse_sin: value,
                          });
                        }}
                      />
                    </Box>
                    <Box flex={1}></Box>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Box flex={1}>
                      <Input
                        name="spouse_email"
                        label="Spouse's Email"
                        value={spousalApplicationProps?.spouse_email}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            spouse_email: value,
                          });
                          setSpousalApplicationProps({
                            ...spousalApplicationProps,
                            spouse_email: value,
                          });
                        }}
                      />
                    </Box>
                    <Box flex={1}></Box>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Tile>
        </Flex>
        <Flex direction={"row"} gap={"sm"} justify={"between"}>
          <Flex direction={"row"} gap={"md"} justify={"start"}>
            <Button
              onClick={() => {
                updateKyc();
              }}
              variant="primary"
              disabled={disabled}
            >
              Save
            </Button>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"end"}>
            <Box></Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
