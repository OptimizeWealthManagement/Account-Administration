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
import { CrmCardActions, CrmActionButton } from "@hubspot/ui-extensions/crm";
import type { ModelProps, ModelFormProps, Kyc, BankAccountProps, BankAccountFormProps } from "../../types";

export const BankAccountDetails = ({
  ticket,
  clients,
  runServerless,
  onCancelClick,
  onSaveClick,
}: BankAccountProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formProperties, setFormProperties] = useState<Array<BankAccountFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [bankNumberError, setBankNumberError] = useState(false);
  const [bankValidation, setBankValidation] = useState("");
  const [transitNumberError, setTransitNumberError] = useState(false);
  const [transitValidation, setTransitValidation] = useState("");
  const [accountNumberError, setAccountNumberError] = useState(false);
  const [accountValidation, setAccountValidation] = useState("");
  const [bankProps, setBankProps] = useState<BankAccountFormProps | null>(null);
  const [readOnly, setReadOnly] = useState({ first: true, second: true });

  useEffect(() => {
    setLoading(false);
  }, []);

  const convertDate = (value: number) => {
    const dateTimestamp = new Date(value);
    const dateYear = dateTimestamp.getFullYear();
    const dateMonth = dateTimestamp.getMonth();
    const dateDay = dateTimestamp.getDate();

    const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };

    return formattedDateObject;
  };

  const getValue = (key: keyof BankAccountFormProps, index: number) => {
    const suffix = index === 1 ? "_2" : ""; // append '_2' for second index, leave empty for first
    const newKey = `${key}${suffix}` as keyof BankAccountFormProps;

    if (!bankProps) {
      return null;
    }

    if (bankProps[newKey]) {
      const value = bankProps[newKey];

      // Check if the value is a number and convert it to a date object if so
      const formattedValue = typeof value === "number" ? convertDate(value) : value;

      return bankProps[newKey];
    } else {
      return null;
    }
  };

  // Loop through the tickets object, find all of the keys that match the BankAccountFormProps keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = [
      "bank_name",
      "bank_institution_name",
      "bankaccountnumber",
      "bank_transit_number",
      "bank_institution_number",
      "bank_address",
      "bank_city",
      "bank_province",
      "bank_postal_code",
      "bank_name_2",
      "bank_institution_number_2",
      "bankaccountnumber_2",
      "bank_transit_number_2",
      "bank_address_2",
      "bank_city_2",
      "bank_province_2",
      "bank_postal_code_2",
    ];

    for (const [key, value] of Object.entries(ticket)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in IdVerificationFormProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    if (clients.length === 1) {
      for (const [key, value] of Object.entries(newObject)) {
        if (key.endsWith("_2")) {
          delete newObject[key];
        }
      }
    }

    setBankProps(newObject as BankAccountFormProps);
  }, []); // Dependency array

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

  // Define province type options
  const provinceOptions = [
    { label: "Alberta", value: "Alberta" },
    { label: "British Columbia", value: "British Columbia" },
    { label: "Manitoba", value: "Manitoba" },
    { label: "New Brunswick", value: "New Brunswick" },
    { label: "Newfoundland and Labrador", value: "Newfoundland and Labrador" },
    { label: "Northwest Territories", value: "Northwest Territories" },
    { label: "Nova Scotia", value: "Nova Scotia" },
    { label: "Nunavut", value: "Nunavut" },
    { label: "Ontario", value: "Ontario" },
    { label: "Prince Edward Island", value: "Prince Edward Island" },
    { label: "Quebec", value: "Quebec" },
    { label: "Saskatchewan", value: "Saskatchewan" },
    { label: "Yukon", value: "Yukon" },
  ];

  const handleChange = (key: keyof BankAccountFormProps, value: any, index: number) => {
    const suffix = index === 1 ? "_2" : ""; // append '_2' for second index, leave empty for first
    const newKey = `${key}${suffix}` as keyof BankAccountFormProps;

    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    setFormProperties((prevState) => ({
      ...prevState,
      [newKey]: formattedValue,
    }));

    setBankProps((prevState) => ({
      ...prevState,
      [newKey]: value,
    }));

    setReadOnly((prevState) => ({
      ...prevState,
      [index === 1 ? "second" : "first"]: false,
    }));
  };

  const handleReadOnly = (index: number) => {
    const suffix = index === 1 ? "second" : "first"; // append '_2' for second index, leave empty for first

    return readOnly[suffix];
  };

  // Check to see if all props are filled out
  useEffect(() => {
    let shouldDisable = false;

    if (bankProps) {
      // Check if keys with no suffix have null values
      for (const key of Object.keys(bankProps)) {
        if (
          !key.endsWith("_2") &&
          (bankProps[key as keyof BankAccountFormProps] === null ||
            bankProps[key as keyof BankAccountFormProps] === undefined)
        ) {
          shouldDisable = true;
          break;
        }
      }

      // Check if keys with suffix '_2' have null values
      for (const key of Object.keys(bankProps)) {
        if (
          key.endsWith("_2") &&
          (bankProps[key as keyof BankAccountFormProps] === null ||
            bankProps[key as keyof BankAccountFormProps] === undefined)
        ) {
          shouldDisable = true;
          break;
        }
      }
    }

    setDisabled(shouldDisable);
  }, [bankProps]);

  //Set loading state
  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <>
      <Flex direction={"column"} gap={"md"}>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"column"} gap={"extra-small"}>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Heading>Bank Account Details</Heading>
          </Flex>
          <Divider distance="sm" />
          {clients.map((client, clientIndex) => (
            <>
              <Tile key={clientIndex}>
                <Flex direction={"column"} gap={"md"}>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Input name="client" label="Account Holder" value={client.name} readOnly={true} />
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-name"
                        label="Bank Name"
                        value={getValue("bank_name", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_name", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-address"
                        label="Address"
                        value={getValue("bank_address", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_address", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-city"
                        label="City"
                        value={getValue("bank_city", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_city", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Select
                        name="bank-province"
                        label="Province"
                        options={provinceOptions}
                        value={getValue("bank_province", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_province", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-postal-code"
                        label="Postal Code"
                        value={getValue("bank_postal_code", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_postal_code", items!, clientIndex);
                        }}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-institution-number"
                        label="Bank Number"
                        error={bankNumberError}
                        validationMessage={bankValidation}
                        value={getValue("bank_institution_number", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_institution_number", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        name="bank-transit-number"
                        label="Transit Number"
                        error={transitNumberError}
                        validationMessage={transitValidation}
                        value={getValue("bank_transit_number", clientIndex)}
                        onChange={(items) => {
                          handleChange("bank_transit_number", items!, clientIndex);
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        name="bankaccountnumber"
                        label="Account Number"
                        error={accountNumberError}
                        validationMessage={accountValidation}
                        value={getValue("bankaccountnumber", clientIndex)}
                        onChange={(items) => {
                          handleChange("bankaccountnumber", items!, clientIndex);
                        }}
                      />
                    </Flex>
                  </Flex>
                  <Alert title="Important" variant="info">
                    You are required to attach a copy of the void cheque for the below bank account. Click the button at
                    the top right of your screen and attach the document to the note.
                  </Alert>
                  <Flex direction={"row"} gap={"sm"} justify={"start"}>
                    <>
                      <CrmActionButton
                        actionType="ADD_NOTE"
                        actionContext={{
                          objectTypeId: "0-5",
                          objectId: ticket.hs_object_id,
                        }}
                        variant="secondary"
                      >
                        Attach Void Cheque
                      </CrmActionButton>
                    </>
                  </Flex>
                </Flex>
              </Tile>
            </>
          ))}
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button variant="primary" onClick={updateTicket} disabled={disabled}>
            Save
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
