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
import type { ModelProps, ModelFormProps, Kyc, IdVerificationProps, IdVerificationFormProps } from "../../types";
import { getDateTimestampUtc } from "../../utils";

export const IdVerification = ({ ticket, clients, runServerless, onCancelClick, onSaveClick }: IdVerificationProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formProperties, setFormProperties] = useState<Array<IdVerificationFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [showIdType, setShowIdType] = useState(false);
  const [disableProps, setDisableProps] = useState(true);
  const [ticketId, setTicketId] = useState<number>();
  const [idProps, setIdProps] = useState<IdVerificationFormProps | null>(null);
  const [readOnly, setReadOnly] = useState({ first: false, second: false });

  useEffect(() => {
    setLoading(false);
  }, []);

  // Loop through the tickets object, find all of the keys that match the IdVerificationFormProps keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = [
      "verification_method",
      "verified_by",
      "verification_date",
      "id_type",
      "id_number",
      "id_expiry",
      "id_province_state",
      "id_country",
      "verification_method_2",
      "verified_by_2",
      "verification_date_2",
      "id_type_2",
      "id_number_2",
      "id_expiry_2",
      "id_province_state_2",
      "id_country_2",
      "second_id_type",
      "second_id_type_2",
      "secondary_verified_by",
      "secondary_verified_by_2",
      "secondary_verification_method",
      "secondary_verification_method_2",
      "secondary_verification_date",
      "secondary_verification_date_2",
      "secondary_id_number",
      "secondary_id_number_2",
      "secondary_id_expiry",
      "client_name",
      "client_name_secondary",
      "secondary_id_expiry_2",
      "secondary_id_province_state",
      "secondary_id_province_state_2",
      "secondary_id_country",
      "secondary_id_country_2",
    ];

    for (const [key, value] of Object.entries(ticket)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in IdVerificationFormProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    setIdProps(newObject as IdVerificationFormProps);
  }, []); // Dependency array

  // Update id props on ticket
  const updateTicket = () => {
    setLoading(true);
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

  // Define verification method options
  const verificationOptions = ["In Person", "Dual Verification Method"].map((n) => ({
    label: n,
    value: n,
  }));

  const convertDate = (value: number) => {
    const dateTimestamp = new Date(value);
    const dateYear = dateTimestamp.getUTCFullYear();
    const dateMonth = dateTimestamp.getUTCMonth(); // Adding 1 to get the month in 1-12 format
    const dateDay = dateTimestamp.getUTCDate();
    const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };
    return formattedDateObject;
  };

  const convertDateToNumber = (value: object) => {
    const dateNumber = Date.UTC(value.year, value.month, value.date);
    return dateNumber;
  };

  const getValue = (key: keyof IdVerificationFormProps, index: number) => {
    const newKey = `${key}` as keyof IdVerificationFormProps;

    if (idProps[newKey]) {
      const value = idProps[newKey];
      const formattedValue = typeof value === "number" ? convertDate(value) : value;
      return formattedValue;
    } else {
      return null;
    }
  };

  const handleChange = (key: keyof IdVerificationFormProps, value: any, index: number) => {
    // const suffix = index === 1 ? '_2' : ''; // append '_2' for second index, leave empty for first
    const newKey = `${key}` as keyof IdVerificationFormProps;

    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    if (key === "verification_method" && value === "Dual Verification Method") {
      const resetKeys = ["verified_by", "id_type", "id_number", "id_expiry", "id_province_state", "id_country"];
      const updateKeys = ["verification_method"];
      const resetFields: Partial<IdVerificationFormProps> = {};
      const updateFields: Partial<IdVerificationFormProps> = {};

      resetKeys.forEach((resetKey) => {
        resetFields[`${resetKey}` as keyof IdVerificationFormProps] = null;
      });

      updateKeys.forEach((updateKey) => {
        updateFields[`${updateKey}` as keyof IdVerificationFormProps] = value;
      });

      setFormProperties((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));

      setIdProps((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));

      setReadOnly((prevState) => ({
        ...prevState,
        [index === 1 ? "second" : "first"]: true,
      }));
    } else {
      // Update state and make sure readOnly is false
      setFormProperties((prevState) => ({
        ...prevState,
        [newKey]: formattedValue,
      }));

      setIdProps((prevState) => ({
        ...prevState,
        [newKey]: value,
      }));

      setReadOnly((prevState) => ({
        ...prevState,
        [index === 1 ? "second" : "first"]: false,
      }));
    }
  };

  const handleReadOnly = (index: number) => {
    const suffix = index === 1 ? "second" : "first"; // append '_2' for second index, leave empty for first

    return readOnly[suffix];
  };

  // Check to see if all props are filled out
  useEffect(() => {
    let shouldDisable = false;

    // Check if keys with no suffix have null values
    if (idProps && idProps.verification_method && idProps.verification_method !== "Dual Verification Method") {
      for (const key of Object.keys(idProps)) {
        if (
          !key.endsWith("_2") &&
          (idProps[key as keyof IdVerificationFormProps] === null ||
            idProps[key as keyof IdVerificationFormProps] === undefined)
        ) {
          shouldDisable = true;
          break;
        }
      }
    }

    if (
      idProps &&
      idProps.secondary_verification_method &&
      idProps.secondary_verification_method !== "Dual Verification Method"
    ) {
      for (const key of Object.keys(idProps)) {
        if (
          !key.endsWith("_2") &&
          (idProps[key as keyof IdVerificationFormProps] === null ||
            idProps[key as keyof IdVerificationFormProps] === undefined)
        ) {
          shouldDisable = true;
          break;
        }
      }
    }

    // Check if keys with suffix '_2' have null values
    if (idProps && idProps.verification_method_2 && idProps.verification_method_2 !== "Dual Verification Method") {
      for (const key of Object.keys(idProps)) {
        if (
          key.endsWith("_2") &&
          (idProps[key as keyof IdVerificationFormProps] === null ||
            idProps[key as keyof IdVerificationFormProps] === undefined)
        ) {
          shouldDisable = true;
          break;
        }
      }
    }

    setDisabled(shouldDisable);
  }, [idProps]);

  // Set min date for id expiry
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // Define id type options
  const idOptions = [
    { label: "Canadian Passport", value: "Canadian Passport" },
    { label: "Driver's License issued in Canada", value: "Driver's License issued in Canada" },
    { label: "Provincial ID Card", value: "Provincial ID Card" },
    { label: "Health Card issued in Canada", value: "Health Card issued in Canada" },
    {
      label: "Permanent Resident Card issued by the Government of Canada",
      value: "Permanent Resident Card issued by the Government of Canada",
    },
    { label: "NEXUS Card issued by the Government of Canada", value: "NEXUS Card issued by the Government of Canada" },
    { label: "Citizenship Card", value: "Citizenship Card" },
    { label: "Foreign Passport", value: "Foreign Passport" },
    {
      label: "Secure Certificate of Indian Status issued by the Government of Canada",
      value: "Secure Certificate of Indian Status issued by the Government of Canada",
    },
    { label: "Investment Account Statement", value: "Investment Account Statement" },
    { label: "Bank Account Statement", value: "Bank Account Statement" },
  ];

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
            <Heading>ID Verification</Heading>
          </Flex>
          <Divider distance="sm" />
          {clients.map((client, clientIndex) => (
            <>
              <Tile key={clientIndex}>
                <Flex direction={"column"} gap={"md"}>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Input name="client" label="Account Holder" value={client.name} readOnly={true} />
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"start"}>
                    <Select
                      name="verification-method"
                      label="Verification Method"
                      // toggleType="radioButtonList"
                      value={
                        client.id === 0
                          ? getValue("verification_method", clientIndex)
                          : getValue("secondary_verification_method", clientIndex)
                      }
                      options={verificationOptions}
                      onChange={(items) => {
                        if (client.id === 0) {
                          handleChange("verification_method", items!, clientIndex);
                          handleChange("client_name", client.name, clientIndex);
                        } else {
                          handleChange("secondary_verification_method", items!, clientIndex);
                          handleChange("client_name_secondary", client.name, clientIndex);
                        }
                      }}
                    />
                  </Flex>

                  {(client.id === 0
                    ? getValue("verification_method", clientIndex)
                    : getValue("secondary_verification_method", clientIndex)) === "Dual Verification Method" && (
                    <>
                      <Flex direction={"column"} gap={"md"} justify={"center"}>
                        <Divider />
                        <Text inline={true} align={"center"} format={{ fontWeight: "demibold" }}>
                          First Verification Details
                        </Text>
                        <Divider />
                      </Flex>
                    </>
                  )}

                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="verified-by"
                        label="Verified by"
                        value={
                          client.id === 0
                            ? getValue("verified_by", clientIndex)
                            : getValue("secondary_verified_by", clientIndex)
                        }
                        onChange={(value) => {
                          if (client.id === 0) {
                            handleChange("verified_by", value, clientIndex);
                          } else {
                            handleChange("secondary_verified_by", value, clientIndex);
                          }
                        }}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <DateInput
                        name="verification-date"
                        label="Verification Date"
                        value={
                          client.id === 0
                            ? getValue("verification_date", clientIndex)
                            : getValue("secondary_verification_date", clientIndex)
                        }
                        // value={{year: 2023, month: 8, date: 25}}
                        format="standard"
                        max={{ year: currentYear, month: currentMonth, date: currentDay }}
                        // required={true}
                        onChange={(value) => {
                          if (client.id === 0) {
                            const expTimestamp = getDateTimestampUtc(value);
                            handleChange("verification_date", expTimestamp, clientIndex);
                          } else {
                            const expTimestamp = getDateTimestampUtc(value);
                            handleChange("secondary_verification_date", expTimestamp, clientIndex);
                          }
                        }}
                        minValidationMessage={"You cannot choose a future date"}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Select
                        name="id-type"
                        label="ID Type"
                        value={
                          client.id === 0 ? getValue("id_type", clientIndex) : getValue("second_id_type", clientIndex)
                        }
                        tooltip="Select from the available eligible Government Issued ID options"
                        placeholder={"Select an option"}
                        options={idOptions}
                        onChange={(value) => {
                          if (client.id === 0) {
                            handleChange("id_type", value, clientIndex);
                          } else {
                            handleChange("second_id_type", value, clientIndex);
                          }
                        }}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="id-number"
                        label="Document Number"
                        value={
                          client.id === 0
                            ? getValue("id_number", clientIndex)
                            : getValue("secondary_id_number", clientIndex)
                        }
                        onChange={(value) => {
                          if (client.id === 0) {
                            handleChange("id_number", value, clientIndex);
                          } else {
                            handleChange("secondary_id_number", value, clientIndex);
                          }
                        }}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <DateInput
                        name="id-expiry"
                        label="Expiry Date"
                        value={
                          client.id === 0
                            ? getValue("id_expiry", clientIndex)
                            : getValue("secondary_id_expiry", clientIndex)
                        }
                        format="standard"
                        min={{ year: currentYear, month: currentMonth, date: currentDay }}
                        // required={true}
                        onChange={(value) => {
                          if (client.id === 0) {
                            const expTimestamp = getDateTimestampUtc(value);
                            handleChange("id_expiry", expTimestamp, clientIndex);
                          } else {
                            const expTimestamp = getDateTimestampUtc(value);
                            handleChange("secondary_id_expiry", expTimestamp, clientIndex);
                          }
                        }}
                        minValidationMessage={"You must choose a future date"}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        name="id-province-state"
                        label="Province or State of Issue"
                        value={
                          client.id === 0
                            ? getValue("id_province_state", clientIndex)
                            : getValue("secondary_id_province_state", clientIndex)
                        }
                        onChange={(value) => {
                          if (client.id === 0) {
                            handleChange("id_province_state", value, clientIndex);
                          } else {
                            handleChange("secondary_id_province_state", value, clientIndex);
                          }
                        }}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        name="id-country"
                        label="Country of Issue"
                        value={
                          client.id === 0
                            ? getValue("id_country", clientIndex)
                            : getValue("secondary_id_country", clientIndex)
                        }
                        onChange={(value) => {
                          if (client.id === 0) {
                            handleChange("id_country", value, clientIndex);
                          } else {
                            handleChange("secondary_id_country", value, clientIndex);
                          }
                        }}
                        readOnly={handleReadOnly(clientIndex)}
                      />
                    </Flex>
                  </Flex>
                  <Alert title="Important" variant="info">
                    You are required to attach a copy of the ID used to verify the account holder. Click the button at
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
                        Attach ID
                      </CrmActionButton>
                    </>
                  </Flex>
                  {(client.id === 0
                    ? getValue("verification_method", clientIndex)
                    : getValue("secondary_verification_method", clientIndex)) === "Dual Verification Method" && (
                    <>
                      {/* Second Verifier Fields */}
                      <Flex direction={"column"} gap={"md"} justify={"center"}>
                        <Divider />
                        <Text align={"center"} inline={true} format={{ fontWeight: "demibold" }}>
                          Second Verification Details
                        </Text>
                        <Divider />
                      </Flex>
                      <Flex direction={"row"} gap={"md"} justify={"between"}>
                        <Flex direction={"column"}>
                          <Input
                            name="second-verified-by"
                            label="Verified by"
                            value={
                              client.id === 0
                                ? getValue("verified_by", clientIndex)
                                : getValue("secondary_verified_by", clientIndex)
                            }
                            onChange={(value) => {}}
                            readOnly={true}
                          />
                        </Flex>
                        <Flex direction={"column"}>
                          <DateInput
                            name="second-verification-date"
                            label="Verification Date"
                            value={
                              client.id === 0
                                ? getValue("verification_date_2", clientIndex)
                                : getValue("secondary_verification_date_2", clientIndex)
                            }
                            format="standard"
                            max={{ year: currentYear, month: currentMonth, date: currentDay }}
                            onChange={(value) => {
                              if (client.id === 0) {
                                const expTimestamp = getDateTimestampUtc(value);
                                handleChange("verification_date_2", expTimestamp, clientIndex);
                              } else {
                                const expTimestamp = getDateTimestampUtc(value);
                                handleChange("secondary_verification_date_2", expTimestamp, clientIndex);
                              }
                            }}
                            minValidationMessage={"You cannot choose a future date"}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                      </Flex>
                      <Flex direction={"row"} gap={"md"} justify={"between"}>
                        <Flex direction={"column"}>
                          <Select
                            name="second-id-type"
                            label="ID Type"
                            value={
                              client.id === 0
                                ? getValue("id_type_2", clientIndex)
                                : getValue("second_id_type_2", clientIndex)
                            }
                            tooltip="Select from the available eligible Government Issued ID options"
                            placeholder={"Select an option"}
                            options={idOptions}
                            onChange={(value) => {
                              if (client.id === 0) {
                                handleChange("id_type_2", value, clientIndex);
                              } else {
                                handleChange("second_id_type_2", value, clientIndex);
                              }
                            }}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                        <Flex direction={"column"}>
                          <Box></Box>
                        </Flex>
                      </Flex>
                      <Flex direction={"row"} gap={"md"} justify={"between"}>
                        <Flex direction={"column"}>
                          <Input
                            name="second-id-number"
                            label="Document Number"
                            value={
                              client.id === 0
                                ? getValue("id_number_2", clientIndex)
                                : getValue("secondary_id_number_2", clientIndex)
                            }
                            onChange={(value) => {
                              if (client.id === 0) {
                                handleChange("id_number_2", value, clientIndex);
                              } else {
                                handleChange("secondary_id_number_2", value, clientIndex);
                              }
                            }}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                        <Flex direction={"column"}>
                          <DateInput
                            name="second-id-expiry"
                            label="Expiry Date"
                            value={
                              client.id === 0
                                ? getValue("id_expiry_2", clientIndex)
                                : getValue("secondary_id_expiry_2", clientIndex)
                            }
                            format="standard"
                            min={{ year: currentYear, month: currentMonth, date: currentDay }}
                            onChange={(value) => {
                              if (client.id === 0) {
                                const expTimestamp = getDateTimestampUtc(value);
                                handleChange("id_expiry_2", expTimestamp, clientIndex);
                              } else {
                                const expTimestamp = getDateTimestampUtc(value);
                                handleChange("secondary_id_expiry_2", expTimestamp, clientIndex);
                              }
                            }}
                            minValidationMessage={"You must choose a future date"}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                      </Flex>
                      <Flex direction={"row"} gap={"md"} justify={"between"}>
                        <Flex direction={"column"}>
                          <Input
                            name="second-id-province-state"
                            label="Province or State of Issue"
                            value={
                              client.id === 0
                                ? getValue("id_province_state_2", clientIndex)
                                : getValue("secondary_id_province_state_2", clientIndex)
                            }
                            onChange={(value) => {
                              if (client.id === 0) {
                                handleChange("id_province_state_2", value, clientIndex);
                              } else {
                                handleChange("secondary_id_province_state_2", value, clientIndex);
                              }
                            }}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                        <Flex direction={"column"}>
                          <Input
                            name="second-id-country"
                            label="Country of Issue"
                            value={
                              client.id === 0
                                ? getValue("id_country_2", clientIndex)
                                : getValue("secondary_id_country_2", clientIndex)
                            }
                            onChange={(value) => {
                              if (client.id === 0) {
                                handleChange("id_country_2", value, clientIndex);
                              } else {
                                handleChange("secondary_id_country_2", value, clientIndex);
                              }
                            }}
                            readOnly={handleReadOnly(clientIndex)}
                          />
                        </Flex>
                      </Flex>
                      <Alert title="Important" variant="info">
                        You are required to attach a copy of the ID used to verify the account holder. Click the button
                        at the top right of your screen and attach the document to the note.
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
                            Attach ID
                          </CrmActionButton>
                        </>
                      </Flex>
                    </>
                  )}
                </Flex>
              </Tile>
            </>
          ))}
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button variant="primary" onClick={updateTicket} disabled={formProperties.length === 0}>
            Save
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
