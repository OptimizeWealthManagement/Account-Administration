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
  LockedInApplicationProps,
  LockedInFormProps,
} from "../../types";
import { legislationOptions } from "../../utils";

export const LockedInApplication = ({
  kyc,
  ticketId,
  runServerless,
  onCancelClick,
  onSaveClick,
}: LockedInApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<LockedInFormProps>>([]); // Set form props to update ticket object with
  const [legislationProps, setLegislationProps] = useState<LockedInFormProps | null>(null);
  const [showExistingBeneficiaries, setShowExistingBeneficiaries] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [showSource, setShowSource] = useState(false);

  // Loop through the tickets object, find all of the keys that match the legislationProps keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = ["hs_object_id", "account_type", "legislation", "pension_fund_source"];

    // if (kyc.account_type.label === "LIF") {
    //   allowedKeys.push(...["pension_fund_source"]);
    // }

    for (const [key, value] of Object.entries(kyc)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in legislationProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    setLegislationProps(newObject as LockedInFormProps);
  }, []); // Dependency array

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
    if (legislationProps) {
      setShowSource(legislationProps.account_type === "LIF");
      const lockedInPortion = { ...legislationProps };

      // Deleting non locked in keys
      Object.keys(lockedInPortion).forEach((key) => {
        if (key !== "legislation" && key !== "pension_fund_source") {
          delete lockedInPortion[key];
        }
      });

      if (legislationProps.account_type !== "LIF") {
        delete lockedInPortion["pension_fund_source"];
      }

      const lockedInComp = checkNullValues(lockedInPortion);
      setDisabled(!lockedInComp);
    }
  }, [legislationProps]);

  if (!legislationProps) {
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
              <Heading>Locked In Application</Heading>
            </Flex>
          </Flex>
          <Divider />
          <Tile>
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"column"} gap={"sm"}>
                <Flex direction={"row"} justify={"between"}>
                  <Flex direction={"row"} justify={"start"}>
                    <Heading>Plan Legislation</Heading>
                  </Flex>
                </Flex>
                <Divider />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Flex direction={"column"}>
                  <Select
                    name="legislation"
                    label="Legislation"
                    value={legislationProps.legislation}
                    options={
                      legislationProps?.account_type === "LRSP"
                        ? [{ label: "Federal", value: "Federal" }]
                        : legislationOptions
                    }
                    onChange={(value) => {
                      setFormProperties({
                        ...formProperties,
                        legislation: value,
                      });
                      setLegislationProps({
                        ...legislationProps,
                        legislation: value,
                      });
                    }}
                  />
                </Flex>
              </Flex>
              ;
              {showSource ? (
                <>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Flex direction={"column"}>
                      <Select
                        name="pension-fund-source"
                        label="Pension Fund Source"
                        value={legislationProps.pension_fund_source}
                        options={[
                          { label: "LIF", value: "LIF" },
                          { label: "LIRA", value: "LIRA" },
                        ]}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            pension_fund_source: value,
                          });
                          setLegislationProps({
                            ...legislationProps,
                            pension_fund_source: value,
                          });
                        }}
                      />
                    </Flex>
                  </Flex>
                </>
              ) : (
                <></>
              )}
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
