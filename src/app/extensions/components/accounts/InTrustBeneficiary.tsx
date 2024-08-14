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
import type { InTrustBeneficiaryProps, OtherBeneficiaryApplicationProps, OtherBeneficiaryFormProps } from "../../types";

export const InTrustBeneficiary = ({
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
  const [beneficiaries, setBeneficiaries] = useState<Array<InTrustBeneficiaryProps>>([]);
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
            firstname: parts.length > 0 ? parts[0].replace(/\(0\)/g, "") : undefined,
            lastname: parts.length > 1 ? parts[1].replace("(1)", "") : undefined,
            date_of_birth: parts.length > 2 ? convertDateOfBirth(parts[2].replace("(2)", "")) : undefined,
            sin: parts.length > 3 ? parts[3].replace("(3)", "") : undefined,
          };

          for (const key in bene) {
            if (bene[key] === "undefined") {
              bene[key] = "";
            }
          }

          return bene as InTrustBeneficiaryProps;
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

  const checkMaxDate = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDateNum = currentDate.getDate();

    const maxDate = { year: currentYear, month: currentMonth + 1, date: currentDateNum };

    return maxDate;
  };

  const getCurrentYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return currentYear;
  };

  const getMinYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const minYear = currentYear - 18;

    return minYear;
  };

  const getCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    return currentMonth;
  };

  const getCurrentDay = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    return currentDay;
  };

  const checkMinDate = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDateNum = currentDate.getDate();

    // Min date for a minor, who must be under 18 years old
    const minYear = currentYear - 18;
    const minDate = { year: minYear, month: currentMonth + 1, date: currentDateNum };

    return minDate;
  };

  const convertBeneficiariesToString = (arr) => {
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
    } else {
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      { firstname: undefined, lastname: undefined, date_of_birth: undefined, sin: undefined },
    ]);
    if (!showExistingBeneficiaries) {
      setShowExistingBeneficiaries(true);
    }
  };

  //CHECK!!!
  useEffect(() => {
    // Run this function whenever beneficiaries change
    const checkProperties = () => {
      for (const beneficiary of beneficiaries) {
        const { firstname, lastname, date_of_birth, sin } = beneficiary;

        if (firstname === undefined || lastname === undefined || date_of_birth === undefined || sin === undefined) {
          setDisabled(true);
          return;
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
                  <Heading>In Trust Beneficiaries</Heading>
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
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"First Name"}
                          name="beneficiary-firstname"
                          value={beneficiary.firstname}
                          onChange={(value) => {
                            handleInputChange(value, beneficiaryIndex, "firstname");
                          }}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"Last Name"}
                          name="beneficiary-lastname"
                          value={beneficiary.lastname}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "lastname")}
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
                          tooltip={
                            "Please enter the date of birth of the beneficiary. Please note that In Trust accounts can only be opened for minors under the age of 18."
                          }
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "date_of_birth")}
                          format="standard"
                          min={{ year: getMinYear(), month: getCurrentMonth(), date: getCurrentDay() }}
                          max={{ year: getCurrentYear(), month: getCurrentMonth(), date: getCurrentDay() }}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"SIN"}
                          name="sin"
                          value={beneficiary.sin}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "sin")}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Box></Box>
                      </Flex>
                    </Flex>
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
