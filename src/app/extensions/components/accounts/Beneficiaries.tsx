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
} from "@hubspot/ui-extensions";
import type { RespFormProps, RespApplicationProps } from "../../types";
import { provinceOptions } from "../../utils";

export const RespApplication = ({ ticketId, runServerless, onCancelClick, onSaveClick }: RespApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<RespFormProps>>([]); // Set form props to update ticket object with

  const [beneficiaries, setBeneficiaries] = useState([
    {
      // resp_type: '',
      resp_beneficiary_lastname: "",
      resp_beneficiary_firstname: "",
      resp_beneficiary_gender: "",
      resp_beneficiary_relationship: "",
      resp_beneficiary_street_address: "",
      resp_beneficiary_city: "",
      resp_beneficiary_province: "",
      resp_beneficiary_postal_code: "",
      resp_sin: "",
      resp_date_of_birth: "",
      resp_parent_lastname: "",
      resp_parent_firstname: "",
      resp_beneficiaries_sublings: "",
      resp_distribution: 0,
      resp_parent_or_legal_guardian: "",
      resp_primary_caregiver: "",
      name_of_agency: "", // in case of a child care agency
      name_of_agency_representative: "", // in case of a child care agency
      public_primary_caregiver: "", // in case of a child care agency
      agency_business_number: "",
      resp_grants: "",
      resp_same_address: "",
    },
  ]);

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

  const relationshipOptions = ["Parent", "Grandparent", "Other"].map((n) => ({
    label: n,
    value: n,
  }));

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      {
        resp_beneficiary_lastname: "",
        resp_beneficiary_firstname: "",
        resp_beneficiary_gender: "",
        resp_beneficiary_relationship: "",
        resp_beneficiary_street_address: "",
        resp_beneficiary_city: "",
        resp_beneficiary_province: "",
        resp_beneficiary_postal_code: "",
        resp_sin: "",
        resp_date_of_birth: "",
        resp_parent_lastname: "",
        resp_parent_firstname: "",
        resp_beneficiaries_sublings: "",
        resp_distribution: 0,
        resp_parent_or_legal_guardian: "",
        resp_primary_caregiver: "",
        name_of_agency: "",
        name_of_agency_representative: "",
        public_primary_caregiver: "",
        resp_same_address: "",
        resp_grant: "",
        agency_business_number: "",
      },
    ]);
  };

  const handleInputChange = (e, beneficiaryIndex, field) => {
    const newBeneficiary = [...beneficiaries];
    newBeneficiary[beneficiaryIndex][field] = e;
    setBeneficiaries(newBeneficiary);
  };

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"row"} justify={"between"} alignSelf={"end"}>
        <Flex direction={"row"} justify={"start"}>
          <Heading>RESP Beneficiary Information</Heading>
        </Flex>
        <Flex direction={"row"} justify={"end"}>
          <ToggleGroup
            name="resp-type"
            label=""
            options={[
              { label: "Single Beneficiary", value: "Single Beneficiary" },
              { label: "Family Beneficiary", value: "Family Beneficiary" },
            ]}
            toggleType="radioButtonList"
            onChange={(items) => {
              const numOfBeneficiaries = beneficiaries.length;
              const newDistribution = 100 / numOfBeneficiaries;
              const updatedBeneficiaries = beneficiaries.map((beneficiary) => {
                return { ...beneficiary, resp_distribution: newDistribution };
              });
              setBeneficiaries(updatedBeneficiaries);
              setFormProperties({
                ...formProperties,
                resp_type: items!,
              });
            }}
          />
        </Flex>
      </Flex>
      {beneficiaries.map((beneficiary, beneficiaryIndex) => (
        <Tile key={beneficiaryIndex}>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"column"} gap={"sm"}>
              <Flex direction={"row"} justify={"between"}>
                <Flex direction={"row"} justify={"start"}>
                  <Heading>{beneficiaryIndex > 0 ? `Beneficiary (${beneficiaryIndex + 1})` : "Beneficiary"}</Heading>
                </Flex>
              </Flex>
              <Divider />
            </Flex>
            {/* <Text format={{ fontWeight: "demibold" }}>Relinquishing Institution Details</Text> */}
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"First Name"}
                  name="beneficiary-firstname"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_firstname")}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Last Name"}
                  name="beneficiary-lastname"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_lastname")}
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
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_sin")}
                />
              </Flex>
              <Flex direction={"column"}>
                <DateInput
                  label={"Date of Birth"}
                  name="beneficiary-date-of-bith"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_date_of_birth")}
                  format="standard"
                />
              </Flex>
              <Flex direction={"column"}>
                <ToggleGroup
                  name="beneficiary-gender"
                  label="Gender"
                  options={[
                    { label: "M", value: "M" },
                    { label: "F", value: "F" },
                  ]}
                  inline={true}
                  toggleType="radioButtonList"
                  onChange={(items) => handleInputChange(items!, beneficiaryIndex, "resp_beneficiary_gender")}
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
                  // value={formProperties.province__state}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_relationship")}
                  options={relationshipOptions}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"First Name of Parent or Guardian"}
                  name="resp-parent-firstname"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_parent_firstname")}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Last Name of Parent or Guardian"}
                  name="resp-parent-lastname"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_parent_lastname")}
                />
              </Flex>
            </Flex>
            <Flex direction={"row"} justify={"start"}>
              <ToggleGroup
                name="same-address"
                label="Address is the same as subscriber"
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
                inline={true}
                toggleType="radioButtonList"
                onChange={(items) => handleInputChange(items!, beneficiaryIndex, "resp_same_address")}
              />
            </Flex>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Address"}
                  name="beneficiary-address"
                  // value={formProperties.street_address}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_street_address")}
                  readOnly={(beneficiary.resp_same_address && beneficiary.resp_same_address) === "Yes" ? true : false}
                />
              </Flex>
            </Flex>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"City"}
                  name="beneficiary-city"
                  // value={formProperties.city}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_city")}
                  readOnly={(beneficiary.resp_same_address && beneficiary.resp_same_address) === "Yes" ? true : false}
                />
              </Flex>
              <Flex direction={"column"}>
                <Select
                  label="Province"
                  name="beneficiary-province"
                  placeholder={"Select..."}
                  // description={'Select the option that best fits the reason for the client\'s employment status'}
                  // value={formProperties.province__state}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_province")}
                  options={provinceOptions}
                  readOnly={(beneficiary.resp_same_address && beneficiary.resp_same_address) === "Yes" ? true : false}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Postal Code"}
                  name="beneficiary-postal-code"
                  // value={formProperties.postal_code___zip_code}
                  onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_beneficiary_postal_code")}
                  readOnly={(beneficiary.resp_same_address && beneficiary.resp_same_address) === "Yes" ? true : false}
                />
              </Flex>
            </Flex>
            <Flex direction={"row"} justify={"start"}>
              {formProperties.resp_type && formProperties.resp_type === "Family Beneficiary" ? (
                <>
                  <NumberInput
                    label={"Distribution"}
                    name="resp-distribution"
                    description={"Distribution of contributions made to the plan to this beneficiary"}
                    value={beneficiary.resp_distribution}
                    onChange={(value) => handleInputChange(value, beneficiaryIndex, "resp_distribution")}
                    readOnly={beneficiaries.length > 0 ? false : true}
                    validationMessage={respDistributionError ? getValidationMessage() : ""}
                    error={respDistributionError}
                    formatStyle={"percentage"}
                    min={0}
                    max={100}
                    precision={2}
                  />
                </>
              ) : (
                <></>
              )}
            </Flex>
            <Flex direction={"row"} justify={"start"}>
              <ToggleGroup
                name="resp-grant"
                label="Can the plan trustee request grants for the beneficiary on the client's behalf?"
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
                // inline={true}
                toggleType="radioButtonList"
                onChange={(items) => handleInputChange(items!, beneficiaryIndex, "resp_grants")}
              />
            </Flex>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              {beneficiary.resp_grants && beneficiary.resp_grants === "Yes" ? (
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
                        // inline={true}
                        toggleType="radioButtonList"
                        onChange={(items) =>
                          handleInputChange(items!, beneficiaryIndex, "resp_parent_or_legal_guardian")
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
                        // inline={true}
                        toggleType="radioButtonList"
                        onChange={(items) => handleInputChange(items!, beneficiaryIndex, "resp_primary_caregiver")}
                      />
                    </Flex>
                    {beneficiary.resp_primary_caregiver && beneficiary.resp_primary_caregiver === "No" ? (
                      <>
                        <Flex direction={"column"}>
                          <ToggleGroup
                            name="public-primary-caregiver"
                            label="Is a public childcare angecy a primary caregiver of the beneficiary?"
                            options={[
                              { label: "Yes", value: "Yes" },
                              { label: "No", value: "No" },
                            ]}
                            // inline={true}
                            toggleType="radioButtonList"
                            onChange={(items) =>
                              handleInputChange(items!, beneficiaryIndex, "public_primary_caregiver")
                            }
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
            {beneficiary.public_primary_caregiver && beneficiary.public_primary_caregiver === "Yes" ? (
              <>
                <Flex direction={"row"} gap={"md"} justify={"between"}>
                  <Flex direction={"column"}>
                    <Input
                      label={"Name of Agency"}
                      name="name-of-agency"
                      // value={formProperties.postal_code___zip_code}
                      onChange={(value) => handleInputChange(value, beneficiaryIndex, "name_of_agency")}
                    />
                  </Flex>
                  <Flex direction={"column"}>
                    <Input
                      label={"Name of Agency Representative"}
                      name="name-of-agency-representative"
                      // value={formProperties.postal_code___zip_code}
                      onChange={(value) => handleInputChange(value, beneficiaryIndex, "name_of_agency_representative")}
                    />
                  </Flex>
                  <Flex direction={"column"}>
                    <Input
                      label={"Business Number of Child Care Agency"}
                      name="agency-business-number"
                      // value={formProperties.postal_code___zip_code}
                      onChange={(value) => handleInputChange(value, beneficiaryIndex, "agency_business_number")}
                    />
                  </Flex>
                </Flex>
              </>
            ) : (
              <></>
            )}
          </Flex>
        </Tile>
      ))}
      <Flex direction={"row"} gap={"md"} justify={"between"}>
        <Flex direction={"row"} gap={"xs"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"row"} gap={"xs"} justify={"end"}>
          {formProperties.resp_type && formProperties.resp_type === "Family Beneficiary" ? (
            <>
              <Button onClick={addBeneficiary}>{"Add Beneficiary"}</Button>
            </>
          ) : (
            <></>
          )}
          <Button onClick={onCancelClick} variant={"primary"}>
            {"Save"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
