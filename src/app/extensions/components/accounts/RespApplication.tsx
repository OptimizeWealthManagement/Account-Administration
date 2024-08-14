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
import type { RespFormProps, RespApplicationProps, RespBeneficiaryFormProps, BeneficiaryProps } from "../../types";

export const RespApplication = ({ kyc, ticketId, runServerless, onCancelClick, onSaveClick }: RespApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<RespBeneficiaryFormProps>>([]); // Set form props to update ticket object with
  const [beneficiaries, setBeneficiaries] = useState<Array<RespFormProps>>([]);
  const [showExistingBeneficiaries, setShowExistingBeneficiaries] = useState(false);
  const currentNumber = beneficiaries.length;

  useEffect(() => {
    if (kyc && kyc.beneficiary) {
      const cleanedBeneficiaryString = kyc.beneficiary.replace("undefined", "");
      // const beneficiariesList = (kyc.beneficiary).split("--..--..--..--..--..");
      const beneficiariesList = cleanedBeneficiaryString.split(".-.-.-.-.-");
      // const cleanedBeneficiariesList = bene

      if (beneficiariesList.length > 0) {
        const beneficiaryObject = beneficiariesList.map((item) => {
          const cleanedItem = item.replace(/^"|"$/g, "");
          // const parts = item.split("-----");
          const parts = cleanedItem.split("-----");

          const bene = {
            firstname: parts.length > 0 ? parts[0].replace(/\(0\)/g, "") : undefined,
            lastname: parts.length > 1 ? parts[1].replace("(1)", "") : undefined,
            gender: parts.length > 2 ? parts[2].replace("(2)", "") : undefined,
            sin: parts.length > 3 ? parts[3].replace("(3)", "") : undefined,
            date_of_birth: parts.length > 4 ? convertDateOfBirth(parts[4].replace("(4)", "")) : undefined,
            address: parts.length > 5 ? parts[5].replace("(5)", "") : undefined,
            city: parts.length > 6 ? parts[6].replace("(6)", "") : undefined,
            province: parts.length > 7 ? parts[7].replace("(7)", "") : undefined,
            postal_code: parts.length > 8 ? parts[8].replace("(8)", "") : undefined,
            parent_firstname: parts.length > 9 ? parts[9].replace("(9)", "") : undefined,
            parent_lastname: parts.length > 10 ? parts[10].replace("(10)", "") : undefined,
            beneficiaries_are_siblings: parts.length > 11 ? parts[11].replace("(11)", "") : undefined,
            resp_distribution: parts.length > 12 ? parts[12].replace("(12)", "") : undefined,
            beneficiary_same_address: parts.length > 13 ? parts[13].replace("(13)", "") : undefined,
            beneficiary_grants: parts.length > 14 ? parts[14].replace("(14)", "") : undefined,
            parent_or_legal_guardian: parts.length > 15 ? parts[15].replace("(15)", "") : undefined,
            pcg_or_spouse: parts.length > 16 ? parts[16].replace("(16)", "") : undefined,
            name_of_agency: parts.length > 17 ? parts[17].replace("(17)", "") : undefined,
            name_of_agency_representative: parts.length > 18 ? parts[18].replace("(18)", "") : undefined,
            agency_bn: parts.length > 19 ? parts[19].replace("(19)", "") : undefined,
            agency_pcg: parts.length > 20 ? parts[20].replace("(20)", "") : undefined,
            relationship: parts.length > 21 ? parts[21].replace("(21)", "") : undefined,
          };

          for (const key in bene) {
            if (bene[key] === "undefined") {
              bene[key] = "";
            }
          }

          return bene as RespFormProps;
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

  const [respDistributionError, setRespDistributionError] = useState(false);

  useEffect(() => {
    const totalDistribution = beneficiaries.reduce((acc, obj) => acc + obj.resp_distribution, 0);
    const allGreaterThanZero = beneficiaries.every((obj) => obj.resp_distribution > 0);
    setRespDistributionError(totalDistribution != 100 || !allGreaterThanZero);
  }, [beneficiaries]);

  const getValidationMessage = () => {
    const totalDistribution = beneficiaries.reduce((acc, obj) => acc + obj.resp_distribution, 0);
    const allGreaterThanZero = beneficiaries.every((obj) => obj.resp_distribution > 0);
    if (totalDistribution != 100) {
      return "The total distributions across all beneficiaries must equal 100";
    }
    if (!allGreaterThanZero) {
      return "All distributions must be greater than zero";
    }

    return "";
  };

  const relationshipOptions = ["Parent", "Grandparent", "Aunt / Uncle", "Sibling", "Not Related", "Other"].map((n) => ({
    label: n,
    value: n,
  }));

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
                value = new Date(value.year, value.month, value.date).getTime();
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
        firstname: "",
        lastname: "",
        gender: "",
        sin: "",
        date_of_birth: undefined,
        address: "",
        city: "",
        province: "",
        postal_code: "",
        parent_firstname: "",
        parent_lastname: "",
        beneficiaries_are_siblings: "",
        resp_distribution: null,
        beneficiary_same_address: "",
        beneficiary_grants: "",
        parent_or_legal_guardian: "",
        pcg_or_spouse: "",
        name_of_agency: "",
        name_of_agency_representative: "",
        agency_bn: "",
        agency_pcg: "",
        relationship: "",
        beneficiary: "",
      },
    ]);
    if (!showExistingBeneficiaries) {
      setShowExistingBeneficiaries(true);
    }
  };

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
                  <Heading>RESP Beneficiaries</Heading>
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
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "firstname")}
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
                        <Input
                          label={"Social Insurance Number"}
                          name="beneficiary-sin"
                          value={beneficiary.sin}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "sin")}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <DateInput
                          label={"Date of Birth"}
                          name="beneficiary-date-of-bith"
                          value={beneficiary.date_of_birth}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "date_of_birth")}
                          format="standard"
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <ToggleGroup
                          name="beneficiary-gender"
                          label="Gender"
                          value={beneficiary.gender}
                          options={[
                            { label: "M", value: "M" },
                            { label: "F", value: "F" },
                          ]}
                          inline={true}
                          toggleType="radioButtonList"
                          onChange={(items) => handleInputChange(items!, beneficiaryIndex, "gender")}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Select
                          label="Subscriber Relationship to Beneficiary"
                          name="resp-beneficiary-relationship"
                          placeholder={"Select..."}
                          // description={'Select the option that best fits the reason for the client\'s employment status'}
                          value={beneficiary.relationship}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "relationship")}
                          options={relationshipOptions}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"First Name of Parent or Guardian"}
                          name="resp-parent-firstname"
                          value={beneficiary.parent_firstname}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "parent_firstname")}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"Last Name of Parent or Guardian"}
                          name="resp-parent-lastname"
                          value={beneficiary.parent_lastname}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "parent_lastname")}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <ToggleGroup
                        name="same-address"
                        label="Address is the same as subscriber"
                        value={beneficiary.beneficiary_same_address}
                        options={[
                          { label: "Yes", value: "Yes" },
                          { label: "No", value: "No" },
                        ]}
                        inline={true}
                        toggleType="radioButtonList"
                        onChange={(items) => {
                          handleInputChange(items!, beneficiaryIndex, "beneficiary_same_address");

                          if (items === "Yes") {
                            handleInputChange(undefined, beneficiaryIndex, "address");
                            handleInputChange(undefined, beneficiaryIndex, "city");
                            handleInputChange(undefined, beneficiaryIndex, "province");
                            handleInputChange(undefined, beneficiaryIndex, "postal_code");
                          }
                        }}
                      />
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"Address"}
                          name="beneficiary-address"
                          value={beneficiary.address}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "address")}
                          readOnly={
                            (beneficiary.beneficiary_same_address && beneficiary.beneficiary_same_address) === "Yes"
                              ? true
                              : false
                          }
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"City"}
                          name="beneficiary-city"
                          value={beneficiary.city}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "city")}
                          readOnly={
                            (beneficiary.beneficiary_same_address && beneficiary.beneficiary_same_address) === "Yes"
                              ? true
                              : false
                          }
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Select
                          label="Province"
                          name="beneficiary-province"
                          placeholder={"Select..."}
                          // description={'Select the option that best fits the reason for the client\'s employment status'}
                          value={beneficiary.province}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "province")}
                          options={provinceOptions}
                          readOnly={
                            (beneficiary.beneficiary_same_address && beneficiary.beneficiary_same_address) === "Yes"
                              ? true
                              : false
                          }
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"Postal Code"}
                          name="beneficiary-postal-code"
                          value={beneficiary.postal_code}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "postal_code")}
                          readOnly={
                            (beneficiary.beneficiary_same_address && beneficiary.beneficiary_same_address) === "Yes"
                              ? true
                              : false
                          }
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <ToggleGroup
                        name="resp-grant"
                        label="Can the plan trustee request grants for the beneficiary on the client's behalf?"
                        options={[
                          { label: "Yes", value: "Yes" },
                          { label: "No", value: "No" },
                        ]}
                        value={beneficiary.beneficiary_grants}
                        toggleType="radioButtonList"
                        onChange={(items) => handleInputChange(items!, beneficiaryIndex, "beneficiary_grants")}
                      />
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      {beneficiary.beneficiary_grants && beneficiary.beneficiary_grants === "Yes" ? (
                        <>
                          <Flex direction={"row"} gap={"md"} justify={"between"}>
                            <Flex direction={"column"}>
                              <ToggleGroup
                                name="resp-parent-or-legal-guardian"
                                label="Is the client the parent or legal guardian of the beneficiary?"
                                options={[
                                  { label: "Yes", value: "Yes" },
                                  { label: "No", value: "No" },
                                ]}
                                value={beneficiary.parent_or_legal_guardian}
                                toggleType="radioButtonList"
                                onChange={(items) =>
                                  handleInputChange(items!, beneficiaryIndex, "parent_or_legal_guardian")
                                }
                              />
                            </Flex>
                            <Flex direction={"column"}>
                              <ToggleGroup
                                name="resp-primary-caregiver"
                                label="Is the client the primary caregiver of the beneficiary?"
                                options={[
                                  { label: "Yes", value: "Yes" },
                                  { label: "No", value: "No" },
                                ]}
                                value={beneficiary.pcg_or_spouse}
                                toggleType="radioButtonList"
                                onChange={(items) => handleInputChange(items!, beneficiaryIndex, "pcg_or_spouse")}
                              />
                            </Flex>
                            {beneficiary.pcg_or_spouse && beneficiary.pcg_or_spouse === "No" ? (
                              <>
                                <Flex direction={"column"}>
                                  <ToggleGroup
                                    name="public-primary-caregiver"
                                    label="Is a public childcare angecy a primary caregiver of the beneficiary?"
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
                                    value={beneficiary.agency_pcg}
                                    toggleType="radioButtonList"
                                    onChange={(items) => handleInputChange(items!, beneficiaryIndex, "agency_pcg")}
                                  />
                                </Flex>
                              </>
                            ) : (
                              <>
                                <Flex>
                                  <Box></Box>
                                </Flex>
                              </>
                            )}
                          </Flex>
                        </>
                      ) : (
                        <></>
                      )}
                    </Flex>
                    {beneficiary.agency_pcg && beneficiary.agency_pcg === "Yes" ? (
                      <>
                        <Flex direction={"row"} gap={"md"} justify={"between"}>
                          <Flex direction={"column"}>
                            <Input
                              label={"Name of Agency"}
                              name="name-of-agency"
                              value={beneficiary.name_of_agency}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "name_of_agency")}
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Name of Agency Representative"}
                              name="name-of-agency-representative"
                              value={beneficiary.name_of_agency_representative}
                              onChange={(value) =>
                                handleInputChange(value, beneficiaryIndex, "name_of_agency_representative")
                              }
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Business Number of Child Care Agency"}
                              name="agency-business-number"
                              value={beneficiary.agency_bn}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "agency_bn")}
                            />
                          </Flex>
                        </Flex>
                      </>
                    ) : (
                      <></>
                    )}
                    <Flex direction={"row"} gap={"md"} justify={"start"}>
                      <Flex direction={"column"}>
                        <NumberInput
                          label={"Distribution"}
                          name="resp-distribution"
                          tooltip="Distribution of contributions made to the plan to this beneficiary"
                          // description={'Distribution of contributions made to the plan to this beneficiary'}
                          value={beneficiary && beneficiary.resp_distribution ? beneficiary.resp_distribution : null}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_distribution")}
                          readOnly={beneficiaries.length > 0 ? false : true}
                          validationMessage={respDistributionError ? getValidationMessage() : ""}
                          error={respDistributionError}
                          formatStyle={"percentage"}
                          min={0}
                          max={100}
                          precision={2}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Box></Box>
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
                <Button onClick={handleSaveClick} variant="primary">
                  Save
                </Button>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"end"}>
                <Button onClick={addBeneficiary} disabled={beneficiaries.length === 5}>
                  Add Beneficiary
                </Button>
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
              <EmptyState title="There are no beneficiaries yet" layout="vertical" reverseOrder={true}>
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
