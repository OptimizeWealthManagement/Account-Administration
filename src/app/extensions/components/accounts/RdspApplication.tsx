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
import type { RdspFormProps, RdspApplicationProps, RespBeneficiaryFormProps } from "../../types";

export const RdspApplication = ({ kyc, ticketId, runServerless, onCancelClick, onSaveClick }: RdspApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<RespBeneficiaryFormProps>>([]); // Set form props to update ticket object with
  const [beneficiaries, setBeneficiaries] = useState<Array<RdspFormProps>>([]);
  const [showExistingBeneficiaries, setShowExistingBeneficiaries] = useState(false);
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
            gender: parts.length > 2 ? parts[2].replace("(2)", "") : undefined,
            sin: parts.length > 3 ? parts[3].replace("(3)", "") : undefined,
            date_of_birth: parts.length > 4 ? convertDateOfBirth(parts[4].replace("(4)", "")) : undefined,
            address: parts.length > 5 ? parts[5].replace("(5)", "") : undefined,
            city: parts.length > 6 ? parts[6].replace("(6)", "") : undefined,
            province: parts.length > 7 ? parts[7].replace("(7)", "") : undefined,
            postal_code: parts.length > 8 ? parts[8].replace("(8)", "") : undefined,
            pcg_firstname: parts.length > 9 ? parts[9].replace("(9)", "") : undefined,
            pcg_lastname: parts.length > 10 ? parts[10].replace("(10)", "") : undefined,
            pcg_sin: parts.length > 11 ? parts[11].replace("(11)", "") : undefined,
            pcg_agency_name: parts.length > 12 ? parts[12].replace("(12)", "") : undefined,
            pcg_agency_representative: parts.length > 13 ? parts[13].replace("(13)", "") : undefined,
            pcg_bn: parts.length > 14 ? parts[14].replace("(14)", "") : undefined,
            pcg_address: parts.length > 15 ? parts[15].replace("(15)", "") : undefined,
            pcg_city: parts.length > 16 ? parts[16].replace("(16)", "") : undefined,
            pcg_province: parts.length > 17 ? parts[17].replace("(17)", "") : undefined,
            pcg_postal_code: parts.length > 18 ? parts[18].replace("(18)", "") : undefined,
            rdsp_grant: parts.length > 19 ? parts[19].replace("(19)", "") : undefined,
            number_of_holders: parts.length > 20 ? parts[20].replace("(20)", "") : undefined,
            rdsp_type: parts.length > 21 ? parts[21].replace("(21)", "") : undefined,
            relationship: parts.length > 22 ? parts[22].replace("(22)", "") : undefined,
            beneficiary_same_address: parts.length > 23 ? parts[23].replace("(23)", "") : undefined,
            pcg_is_agency: parts.length > 24 ? parts[24].replace("(24)", "") : undefined,
          };

          for (const key in bene) {
            if (bene[key] === "undefined") {
              bene[key] = "";
            }
          }

          return bene as RdspFormProps;
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
        onSaveClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  const relationshipOptions = [
    "Parent",
    "Spouse of Common-Law Partner",
    "Grandparent",
    "Guardian",
    "Public Agency",
    "Other",
  ].map((n) => ({
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
    // setBeneficiaries([...beneficiaries, { rdsp_type: '', firstname: '', lastname: '', gender: '', sin: '', date_of_birth: undefined, relationship: '', address: '', city: '', province: '', postal_code: '', pcg_firstname: '', pcg_lastname: '', pcg_sin: '', pcg_agency_name: '', pcg_agency_representative: '', pcg_bn: '', pcg_address: '', pcg_city: '', pcg_province: '', pcg_postal_code: '', rdsp_grant: '', number_of_holders: 1, beneficiary_same_address: '', pcg_is_agency: ''}]);
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
        pcg_firstname: "",
        pcg_lastname: "",
        pcg_sin: "",
        pcg_agency_name: "",
        pcg_agency_representative: "",
        pcg_bn: "",
        pcg_address: "",
        pcg_city: "",
        pcg_province: "",
        pcg_postal_code: "",
        rdsp_grant: "",
        number_of_holders: 1,
        rdsp_type: "",
        relationship: "",
        beneficiary_same_address: "",
        pcg_is_agency: "",
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
                  <Heading>RDSP Beneficiaries</Heading>
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
                          label="Account Holder Relationship to Beneficiary"
                          name="rdsp-beneficiary-relationship"
                          placeholder={"Select..."}
                          // description={'Select the option that best fits the reason for the client\'s employment status'}
                          value={beneficiary.relationship}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "relationship")}
                          options={relationshipOptions}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <ToggleGroup
                        name="same-address"
                        label="Address is the same as account holder"
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
                        name="rdsp-grant"
                        label="Can the plan trustee request grants or bonds for the beneficiary?"
                        options={[
                          { label: "Yes", value: "Yes" },
                          { label: "No", value: "No" },
                        ]}
                        value={beneficiary.rdsp_grant}
                        toggleType="radioButtonList"
                        onChange={(items) => handleInputChange(items!, beneficiaryIndex, "rdsp_grant")}
                      />
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <ToggleGroup
                        name="rdsp-type"
                        label="RDSP Type"
                        options={[
                          { label: "Transfer from another RDSP", value: "Transfer from another RDSP" },
                          { label: "New Account", value: "New Account" },
                        ]}
                        value={beneficiary.rdsp_type}
                        toggleType="radioButtonList"
                        onChange={(items) => handleInputChange(items!, beneficiaryIndex, "rdsp_type")}
                      />
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <Input
                        label={"Number of Account Holders"}
                        name="number-of-account-holders"
                        value={beneficiary.number_of_holders}
                        readOnly={true}
                      />
                    </Flex>
                    <Divider />
                    <Flex direction={"row"} gap={"md"} justify={"start"}>
                      <Heading>Primary Caregiver</Heading>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <ToggleGroup
                          name="pcg-is-agency"
                          label="Is the primary caregiver a public agency?"
                          options={[
                            { label: "Yes", value: "Yes" },
                            { label: "No", value: "No" },
                          ]}
                          value={beneficiary.pcg_is_agency}
                          toggleType="radioButtonList"
                          onChange={(items) => {
                            handleInputChange(items!, beneficiaryIndex, "pcg_is_agency");

                            if (items === "Yes") {
                              handleInputChange(undefined, beneficiaryIndex, "pcg_firstname");
                              handleInputChange(undefined, beneficiaryIndex, "pcg_lastname");
                              handleInputChange(undefined, beneficiaryIndex, "pcg_sin");
                            }

                            if (items === "No") {
                              handleInputChange(undefined, beneficiaryIndex, "pcg_agency_name");
                              handleInputChange(undefined, beneficiaryIndex, "pcg_agency_representative");
                              handleInputChange(undefined, beneficiaryIndex, "pcg_bn");
                            }
                          }}
                        />
                      </Flex>
                    </Flex>
                    {beneficiary.pcg_is_agency && beneficiary.pcg_is_agency === "Yes" ? (
                      <>
                        <Flex direction={"row"} gap={"md"} justify={"between"}>
                          <Flex direction={"column"}>
                            <Input
                              label={"Name of Agency"}
                              name="name-of-agency"
                              value={beneficiary.pcg_agency_name}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_agency_name")}
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Name of Agency Representative"}
                              name="name-of-agency-representative"
                              value={beneficiary.pcg_agency_representative}
                              onChange={(value) =>
                                handleInputChange(value, beneficiaryIndex, "pcg_agency_representative")
                              }
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Business Number of Public Agency"}
                              name="agency-business-number"
                              value={beneficiary.agency_bn}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_bn")}
                            />
                          </Flex>
                        </Flex>
                      </>
                    ) : (
                      <>
                        <Flex direction={"row"} gap={"md"} justify={"between"}>
                          <Flex direction={"column"}>
                            <Input
                              label={"First Name"}
                              name="pcg-firstname"
                              value={beneficiary.pcg_firstname}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_firstname")}
                              readOnly={beneficiary.pcg_is_agency && beneficiary.pcg_is_agency === "No" ? false : true}
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Last Name"}
                              name="pcg-lastname"
                              value={beneficiary.pcg_lastname}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_lastname")}
                              readOnly={beneficiary.pcg_is_agency && beneficiary.pcg_is_agency === "No" ? false : true}
                            />
                          </Flex>
                          <Flex direction={"column"}>
                            <Input
                              label={"Social Insurance Number"}
                              name="pcg-sin"
                              value={beneficiary.pcg_sin}
                              onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_sin")}
                              readOnly={beneficiary.pcg_is_agency && beneficiary.pcg_is_agency === "No" ? false : true}
                            />
                          </Flex>
                        </Flex>
                      </>
                    )}
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"Address"}
                          name="pcg-address"
                          value={beneficiary.pcg_address}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_address")}
                          readOnly={beneficiary.pcg_is_agency ? false : true}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"City"}
                          name="pcg-city"
                          value={beneficiary.pcg_city}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_city")}
                          readOnly={beneficiary.pcg_is_agency ? false : true}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Select
                          label="Province"
                          name="pcg-province"
                          placeholder={"Select..."}
                          value={beneficiary.pcg_province}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_province")}
                          options={provinceOptions}
                          readOnly={beneficiary.pcg_is_agency ? false : true}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"Postal Code"}
                          name="pcg-postal-code"
                          value={beneficiary.pcg_postal_code}
                          onChange={(value) => handleInputChange(value, beneficiaryIndex, "pcg_postal_code")}
                          readOnly={beneficiary.pcg_is_agency ? false : true}
                        />
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
