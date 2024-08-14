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
import type { OtherBeneficiaryProps, OtherBeneficiaryApplicationProps, OtherBeneficiaryFormProps } from "../../types";

export const RifBeneficiary = ({
  kyc,
  ticketId,
  runServerless,
  onCancelClick,
  onSaveClick,
}: OtherBeneficiaryApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<OtherBeneficiaryFormProps>>([]); // Set form props to update ticket object with
  const [beneficiaries, setBeneficiaries] = useState<Array<OtherBeneficiaryProps>>([]);
  const [showExistingBeneficiaries, setShowExistingBeneficiaries] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const currentNumber = beneficiaries.length;

  useEffect(() => {
    if (kyc && kyc.beneficiary) {
      const cleanedBeneficiaryString = kyc.beneficiary.replace("undefined", "");
      const beneficiariesList = cleanedBeneficiaryString.split(".-.-.-.-.-");

      if (beneficiariesList.length > 0) {
        const beneficiaryObject = beneficiariesList.map((item) => {
          const cleanedItem = item.replace(/^"|"$/g, "");
          // const parts = item.split("-----");
          const parts = cleanedItem.split("-----");

          const bene = {
            beneficiary_type: parts.length > 0 ? parts[0].replace(/\(0\)/g, "") : undefined,
            firstname: parts.length > 1 ? parts[1].replace("(1)", "") : undefined,
            lastname: parts.length > 2 ? parts[2].replace("(2)", "") : undefined,
            date_of_birth: parts.length > 3 ? convertDateOfBirth(parts[3].replace("(3)", "")) : undefined,
            relationship: parts.length > 4 ? parts[4].replace("(4)", "") : undefined,
          };

          for (const key in bene) {
            if (bene[key] === "undefined") {
              bene[key] = "";
            }
          }

          return bene as OtherBeneficiaryProps;
        });

        setBeneficiaries(beneficiaryObject);
        setShowExistingBeneficiaries(true);
      }
    }
  }, [kyc]);

  const updateKyc = (formProperties) => {
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

  const convertDateOfBirth = (value: string) => {
    const dateOfBirthNumber = Number(value);
    const dateOfBirthTimestamp = new Date(dateOfBirthNumber);
    const dateOfBirthYear = dateOfBirthTimestamp.getFullYear();
    const dateOfBirthMonth = dateOfBirthTimestamp.getMonth();
    const dateOfBirthDay = dateOfBirthTimestamp.getDate();

    const formattedDateObject = { year: dateOfBirthYear, month: dateOfBirthMonth, date: dateOfBirthDay };

    return formattedDateObject;
  };

  const convertBeneficiariesToString = (arr, formProperties) => {
    try {
      const beneficiaryString = arr
        .map((obj, objIndex) => {
          return Object.entries(obj)
            .map(([key, value], index) => {
              // Convert date object to Unix timestamp in milliseconds if applicable
              if (key === "date_of_birth") {
                if (value && typeof value === "object" && value.year && value.month && value.date) {
                  value = new Date(value.year, value.month, value.date).getTime();
                } else {
                  value = ""; // use an empty string for invalid or missing date
                }
              }

              // If value is null, use an empty string as a placeholder
              const sanitizedValue = value === null ? "" : value;

              return `(${index})${sanitizedValue}`;
            })
            .join("-----");
        })
        .join(".-.-.-.-.-");

      updateKyc({ beneficiary: beneficiaryString });

      return "SUCCESS";
    } catch (e) {
      console.error("An error occurred:", e);
      return "ERROR";
    }
  };

  // handle onClick for save
  const handleSaveClick = () => {
    const result = convertBeneficiariesToString(beneficiaries);
    if (result === "SUCCESS") {
      console.log("Converted beneficiaries result: ", result);
    } else {
      console.log("Converted beneficiaries result: ", result);
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      {
        beneficiary_type: undefined,
        firstname: undefined,
        lastname: undefined,
        date_of_birth: undefined,
        relationship: undefined,
      },
    ]);
    if (!showExistingBeneficiaries) {
      setShowExistingBeneficiaries(true);
    }
  };

  useEffect(() => {
    // Run this function whenever beneficiaries change
    const checkProperties = () => {
      for (const beneficiary of beneficiaries) {
        const { beneficiary_type, firstname, lastname, date_of_birth, relationship } = beneficiary;

        if (
          beneficiary_type === "Designate spouse as beneficiary" ||
          beneficiary_type === "Designate estate as beneficiary" ||
          beneficiary_type === "Designate spouse as successor annuitant"
        ) {
          continue; // Skip to the next iteration because 'A' allows undefined properties
        }

        if (beneficiary_type === undefined) {
          setDisabled(true);
          return;
        }

        // If beneficiary_type is 'B' or 'C', check if all other properties are defined
        if (beneficiary_type === "Designate someone other than spouse as beneficiary") {
          if (
            firstname === undefined ||
            lastname === undefined ||
            date_of_birth === undefined ||
            relationship === undefined
          ) {
            setDisabled(true);
            return;
          }
        }
      }
      // If we reach this point, it means that all objects meet the conditions
      setDisabled(false);
    };

    checkProperties();
  }, [beneficiaries]);

  const removeBeneficiary = (index) => {
    const newArray = [...beneficiaries]; // Make a shallow copy of the array
    if (newArray.length === 1) {
      setShowExistingBeneficiaries(false);
    }
    newArray.splice(index, 1); // Remove element at index
    setBeneficiaries(newArray); // Update state
  };

  const handleInputChange = (e, beneficiaryIndex, field) => {
    const newBeneficiary = [...beneficiaries];
    newBeneficiary[beneficiaryIndex][field] = e;
    setBeneficiaries(newBeneficiary);
  };

  return (
    <Flex direction={"column"} gap={"md"}>
      {showExistingBeneficiaries ? (
        <>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"row"} gap={"md"} justify={"start"}>
              <Button onClick={onCancelClick}>{"< Back"}</Button>
            </Flex>
            <Flex direction={"column"} gap={"extra-small"}>
              <Flex direction={"row"} gap={"md"} alignSelf={"end"} justify={"between"}>
                <Flex direction={"row"} gap={"md"} justify={"start"}>
                  <Heading>RIF Beneficiaries</Heading>
                </Flex>
              </Flex>
              <Divider />
              {beneficiaries.map((beneficiary, beneficiaryIndex) => (
                <Tile key={beneficiaryIndex}>
                  <Flex direction={"column"} gap={"md"}>
                    <Flex direction={"column"} gap={"sm"}>
                      <Flex direction={"row"} justify={"between"}>
                        <Flex direction={"row"} justify={"start"}>
                          <Heading>
                            {beneficiaryIndex > 0 ? `Beneficiary (${beneficiaryIndex + 1})` : "Beneficiary"}
                          </Heading>
                        </Flex>
                        <Flex direction={"row"} justify={"end"}>
                          <Button
                            onClick={() => {
                              removeBeneficiary(beneficiaryIndex);
                            }}
                          >
                            Remove
                          </Button>
                        </Flex>
                      </Flex>
                      <Divider />
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"start"}>
                      <Flex direction={"column"}>
                        <ToggleGroup
                          name="beneficiary-type"
                          label="Beneficiary Type"
                          value={beneficiary.beneficiary_type}
                          options={[
                            {
                              label: "Designate spouse as successor annuitant",
                              value: "Designate spouse as successor annuitant",
                            },
                            { label: "Designate spouse as beneficiary", value: "Designate spouse as beneficiary" },
                            {
                              label: "Designate someone other than spouse as beneficiary",
                              value: "Designate someone other than spouse as beneficiary",
                            },
                            { label: "Designate estate as beneficiary", value: "Designate estate as beneficiary" },
                          ]}
                          inline={false}
                          toggleType="radioButtonList"
                          onChange={(items) => {
                            handleInputChange(items!, beneficiaryIndex, "beneficiary_type");
                            if (items! === "Designate someone other than spouse as beneficiary") {
                              handleInputChange(undefined, beneficiaryIndex, "firstname");
                              handleInputChange(undefined, beneficiaryIndex, "lastname");
                              handleInputChange(undefined, beneficiaryIndex, "date_of_birth");
                              handleInputChange(undefined, beneficiaryIndex, "relationship");
                              setAlertMessage(
                                "Upon death, the client designates the beneficiary mentioned here as beneficiary of their Retirement Savings Plan proceeds and they revoke any prior beneficiary designation"
                              );
                            }

                            if (items! === "Designate spouse as beneficiary") {
                              setAlertMessage(
                                "Upon death, the client designates their spouse as beneficiary of their Retirement Savings Plan proceeds and they revoke any prior beneficiary designation"
                              );
                            }

                            if (items! === "Designate estate as beneficiary") {
                              setAlertMessage(
                                "The client has elected not to designate a named beneficiary and as such their estate will be designated the beneficiary of their Retirement Savings Plan proceeds upon their death"
                              );
                            }

                            if (items! === "Designate spouse as successor annuitant") {
                              setAlertMessage(
                                "Upon death, the client requests all payments to be made persuant to their Retirement Income Fund continue to be paid to their spouse, who shall be recognized as the successor annuitant and they revoke any prior designation of beneficiary"
                              );
                            }
                          }}
                        />
                      </Flex>
                    </Flex>
                    {beneficiary && beneficiary.beneficiary_type ? (
                      <>
                        <Alert title="Important" variant="info">
                          {alertMessage}
                        </Alert>
                      </>
                    ) : (
                      <></>
                    )}
                    {beneficiary.beneficiary_type &&
                    beneficiary.beneficiary_type === "Designate someone other than spouse as beneficiary" ? (
                      <>
                        <Flex direction={"row"} gap={"md"} justify={"between"}>
                          <Flex direction={"column"}>
                            <Input
                              label={"First Name"}
                              name="beneficiary-firstname"
                              value={beneficiary.firstname}
                              onChange={(value) => {
                                handleInputChange(value, beneficiaryIndex, "firstname");
                              }}
                              readOnly={
                                !beneficiary.beneficiary_type ||
                                (beneficiary.beneficiary_type &&
                                  beneficiary.beneficiary_type != "Designate someone other than spouse as beneficiary")
                                  ? true
                                  : false
                              }
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Last Name"}
                              name="beneficiary-lastname"
                              value={beneficiary.lastname}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "lastname")}
                              readOnly={
                                !beneficiary.beneficiary_type ||
                                (beneficiary.beneficiary_type &&
                                  beneficiary.beneficiary_type != "Designate someone other than spouse as beneficiary")
                                  ? true
                                  : false
                              }
                            />
                          </Flex>
                          <Flex>
                            <Box></Box>
                          </Flex>
                        </Flex>
                        <Flex direction={"row"} gap={"md"} justify={"between"}>
                          <Flex direction={"column"}>
                            <DateInput
                              label={"Date of Birth"}
                              name="beneficiary-date-of-bith"
                              value={beneficiary.date_of_birth}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "date_of_birth")}
                              format="standard"
                              readOnly={
                                !beneficiary.beneficiary_type ||
                                (beneficiary.beneficiary_type &&
                                  beneficiary.beneficiary_type != "Designate someone other than spouse as beneficiary")
                                  ? true
                                  : false
                              }
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Relationship to Annuitant"}
                              name="relationship"
                              value={beneficiary.relationship}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "relationship")}
                              readOnly={
                                !beneficiary.beneficiary_type ||
                                (beneficiary.beneficiary_type &&
                                  beneficiary.beneficiary_type != "Designate someone other than spouse as beneficiary")
                                  ? true
                                  : false
                              }
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Box></Box>
                          </Flex>
                        </Flex>
                      </>
                    ) : (
                      <></>
                    )}
                  </Flex>
                </Tile>
              ))}
            </Flex>
            <Flex direction={"row"} gap={"sm"} justify={"between"}>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Button onClick={handleSaveClick} variant="primary" disabled={disabled}>
                  Save
                </Button>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"end"}>
                <Box></Box>
              </Flex>
            </Flex>
          </Flex>
        </>
      ) : (
        <>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Button onClick={onCancelClick}>{"< Back"}</Button>
            </Flex>
            <Flex direction={"column"} gap={"md"} align={"center"}>
              <EmptyState title="There is no beneficiary yet" layout="vertical" reverseOrder={true}>
                <Text>Please add a beneficiary to continue</Text>
                <Button onClick={addBeneficiary}>Add</Button>
              </EmptyState>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};
