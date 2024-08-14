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
import type {
  ModelProps,
  ModelFormProps,
  Kyc,
  EntityAccountProfileProps,
  EntityInformationFormProps,
} from "../../types";
import { provinceAndStateOptions, provinceOptions } from "../../utils";

export const EntityAccountProfile = ({
  ticket,
  clients,
  kycs,
  runServerless,
  onCancelClick,
  onSaveClick,
}: EntityAccountProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formProperties, setFormProperties] = useState<Array<EntityInformationFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [disableAllocation, setDisableAllocation] = useState(true);
  const [showOwnershipAllocation, setShowOwnershipAllocation] = useState(false);
  const [disableSave, setDisableSave] = useState(true);
  const [entityProps, setEntityProps] = useState<EntityInformationFormProps | null>(null);
  const [netWorthString, setNetWorthString] = useState<string>("$-");


  useEffect(() => {
    if (entityProps) {
      const {
        entity_cash,
        entity_registered_investments,
        entity_non_registered_investments,
        entity_fixed_assets,
        entity_mortgages_and_other_liabilities,
      } = entityProps;
      const allNumbers = [
        entity_cash,
        entity_registered_investments,
        entity_non_registered_investments,
        entity_fixed_assets,
        entity_mortgages_and_other_liabilities,
      ];
      const sum = allNumbers.reduce((acc, val) => acc + (val || 0), 0); // Ignores null values
      const formattedSum = `$${sum.toFixed(2)}`; // Converts to string and formats to 2 decimal places
      setNetWorthString(formattedSum);
    }
  }, [entityProps]);

  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = [
      "entity_type",
      "entity_type_details",
      "entity_name",
      "attention",
      "nature_of_business",
      "business_number",
      "date_of_incorporation",
      "place_of_incorporation",
      "entity_address",
      "entity_city",
      "entity_province",
      "entity_postal_code",
      "individual_1_role",
      "individual_2_role",
      "entity_income",
      "entity_cash",
      "entity_registered_investments",
      "entity_non_registered_investments",
      "entity_fixed_assets",
      "entity_mortgages_and_other_liabilities",
    ];

    for (const [key, value] of Object.entries(ticket)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in IdVerificationFormProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    setEntityProps(newObject as EntityInformationFormProps);
  }, []); // Dependency array

  // Update id props on ticket
  const updateTicketAndKyc = () => {
    setLoading(true);
    const ticketId = ticket.hs_object_id;
    const kycIds = kycs.map((obj) => obj.hs_object_id);
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "updateTicketAndKyc",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, ticketId, kycIds }, // Send ticket props
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

  const getTime = (date: Object) => {
    const jsDate = new Date(date.year, date.month, date.date);

    // Get Unix timestamp in milliseconds
    const timestampInMilliseconds = jsDate.getTime();

    return timestampInMilliseconds;
  };

  const convertDate = (value: number) => {
    if (!value) return null;
    const dateTimestamp = new Date(value);
    const dateYear = dateTimestamp.getUTCFullYear();
    const dateMonth = dateTimestamp.getUTCMonth();
    const dateDay = dateTimestamp.getUTCDate();

    const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };
    return formattedDateObject;
  };

  const convertDateToNumber = (value: object) => {
    if (!value) return null;
    const dateNumber = Date.UTC(value?.["year"], value?.["month"], value?.["date"]);
    return dateNumber;
  };

  const getValue = (key: keyof EntityInformationFormProps) => {
    if (!entityProps) {
      return null;
    }
    if (entityProps[key] || entityProps[key] === 0) {
      const value = entityProps[key];
      return entityProps[key];
    } else {
      return null;
    }
  };

  const handleChange = (key: keyof EntityInformationFormProps, value: any) => {
    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    if (key === "entity_type" && (value === "Corporation" || value === "Sole Proprietorship")) {
      const resetKeys = ["entity_type_details"];
      const updateKeys = ["entity_type"];
      const resetFields: Partial<EntityInformationFormProps> = {};
      const updateFields: Partial<EntityInformationFormProps> = {};

      resetKeys.forEach((resetKey) => {
        resetFields[`${resetKey}` as keyof EntityInformationFormProps] = null;
      });

      updateKeys.forEach((updateKey) => {
        updateFields[`${updateKey}` as keyof EntityInformationFormProps] = value;
      });

      setFormProperties((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));

      setEntityProps((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));
    } else if (key === "entity_type" && value === "Estate") {
      const resetKeys = ["nature_of_business", "place_of_incorporation"];
      const updateKeys = ["entity_type"];
      const resetFields: Partial<EntityInformationFormProps> = {};
      const updateFields: Partial<EntityInformationFormProps> = {};

      resetKeys.forEach((resetKey) => {
        resetFields[`${resetKey}` as keyof EntityInformationFormProps] = null;
      });

      updateKeys.forEach((updateKey) => {
        updateFields[`${updateKey}` as keyof EntityInformationFormProps] = value;
      });

      setFormProperties((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));

      setEntityProps((prevState) => ({
        ...prevState,
        ...resetFields,
        ...updateFields,
      }));
    } else {
      // Update state and make sure readOnly is false
      setFormProperties((prevState) => ({
        ...prevState,
        [key]: formattedValue,
      }));

      setEntityProps((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    }
  };

  const entityOptions = [
    "Corporation",
    "Estate",
    "Partnership",
    "Trust",
    "Charitable Organization",
    "Sole Proprietorship",
  ].map((n) => ({
    label: n,
    value: n,
  }));

  const estateOptions = ["Prolonged Estate", "Simple Estate", "Estate Individual"].map((n) => ({
    label: n,
    value: n,
  }));

  const partnershipOptions = [
    "General Partnership (all members individuals)",
    "Limited Partnership (all members individuals)",
    "Investment Club (all members individuals)",
    "Association (all members individuals)",
    "General Partnership (one member is not an individual)",
    "Limited Partnership (one member is not an individual)",
    "Investment Club (one member is not an individual)",
    "Association (one member is not an individual)",
  ].map((n) => ({
    label: n,
    value: n,
  }));

  const trustOptions = ["Simple Trust", "Complex Trust", "Grantor Trust", "Testamentary Trust"].map((n) => ({
    label: n,
    value: n,
  }));

  const charitableOptions = ["Non-Profit Corporation (non-tax exempt)", "Non-Profit Corporation (tax exempt)"].map(
    (n) => ({
      label: n,
      value: n,
    })
  );

  const beneficialOwnerType = ["Officer", "Executor", "Partner", "Trustee", "Owner", "Director"].map((n) => ({
    label: n,
    value: n,
  }));

  const getEntityType = () => {
    let totalList = [];
    if (formProperties && formProperties.entity_type) {
      const entityType = formProperties.entity_type;
      if (entityType === "Charitable Organization") {
        return charitableOptions;
      } else if (entityType === "Estate") {
        return estateOptions;
      } else if (entityType === "Partnership") {
        return partnershipOptions;
      } else if (entityType === "Trust") {
        return trustOptions;
      } else {
        return [...charitableOptions, estateOptions, partnershipOptions, trustOptions];
      }
    }

    return [];
  };

  // Check to see if all props are filled out
  useEffect(() => {
    let shouldDisable = false;
    let numberOfClients = clients.length;

    if (entityProps) {
      // Check if keys with no suffix have null values
      for (const key of Object.keys(entityProps)) {
        if (
          key === "entity_type_details" &&
          entityProps["entity_type"] === "Corporation" &&
          (entityProps[key as keyof EntityInformationFormProps] === null ||
            entityProps[key as keyof EntityInformationFormProps] === undefined)
        ) {
          continue;
        } else if (
          key === "entity_type_details" &&
          entityProps["entity_type"] === "Sole Proprietorship" &&
          (entityProps[key as keyof EntityInformationFormProps] === null ||
            entityProps[key as keyof EntityInformationFormProps] === undefined)
        ) {
          continue;
        } else if (
          key === "place_of_incorporation" &&
          entityProps["entity_type"] === "Estate" &&
          (entityProps[key as keyof EntityInformationFormProps] === null ||
            entityProps[key as keyof EntityInformationFormProps] === undefined)
        ) {
          continue;
        } else if (
          key === "date_of_incorporation" &&
          entityProps["entity_type"] === "Estate" &&
          (entityProps[key as keyof EntityInformationFormProps] === null ||
            entityProps[key as keyof EntityInformationFormProps] === undefined)
        ) {
          continue;
        } else if (key === "individual_2_role" && numberOfClients === 1) {
          continue;
        } else if (
          entityProps[key as keyof EntityInformationFormProps] === null ||
          entityProps[key as keyof EntityInformationFormProps] === undefined
        ) {
          shouldDisable = true;
          break;
        } else {
        }
      }
    }

    setDisabled(shouldDisable);
  }, [entityProps]);

  // Set min date for incorporation date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const roleOptions = [
    { label: "Officer", value: "Officer" },
    { label: "Executor", value: "Executor" },
    { label: "Partner", value: "Partner" },
    { label: "Trustee", value: "Trustee" },
    { label: "Owner", value: "Owner" },
    { label: "Director", value: "Director" },
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
            <Heading>Entity Information</Heading>
          </Flex>
          <Divider distance="sm" />
          <Tile>
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"column"} gap={"xs"}>
                <Text format={{ fontWeight: "demibold" }}>Legal Entity Profile</Text>
                <Divider />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="entity-type"
                    label="Entity Type"
                    options={entityOptions}
                    toggleType="radioButtonList"
                    value={getValue("entity_type")}
                    onChange={(value) => {
                      handleChange("entity_type", value);
                      handleChange("date_of_incorporation", null);
                    }}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="entity-type-details"
                    label=""
                    options={getEntityType()}
                    toggleType="radioButtonList"
                    value={getValue("entity_type_details")}
                    onChange={(value) => {
                      handleChange("entity_type_details", value);
                    }}
                    readOnly={
                      formProperties.entity_type === undefined ||
                      formProperties.entity_type === "Corporation" ||
                      formProperties.entity_type === "Sole Proprietorship"
                    }
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="entity-name"
                    label="Legal Name of Entity"
                    value={getValue("entity_name")}
                    onChange={(value) => {
                      handleChange("entity_name", value);
                    }}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="attention"
                    label="Attention"
                    value={getValue("attention")}
                    onChange={(value) => {
                      handleChange("attention", value);
                    }}
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="nature-of-business"
                    label="Nature of Business"
                    tooltip={"If the entity is a holding company, provide details of what the holding company is for"}
                    value={getValue("nature_of_business")}
                    onChange={(value) => {
                      handleChange("nature_of_business", value);
                    }}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="bn-or-tin"
                    label="Business Number / Tax Identification Number"
                    value={getValue("business_number")}
                    onChange={(value) => {
                      handleChange("business_number", value);
                    }}
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <DateInput
                    name="date-of-incorporation"
                    label="Date of Incorporation or Registration"
                    tooltip={"This is not required for estates"}
                    value={convertDate(getValue("date_of_incorporation"))}
                    onChange={(value) => {
                      handleChange("date_of_incorporation", convertDateToNumber(value));
                    }}
                    format="standard"
                    readOnly={formProperties.entity_type === undefined || formProperties.entity_type === "Estate"}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="place-of-incorporation"
                    label="Place of Incorporation, Registration, or Establishment"
                    tooltip={"Not required for estates"}
                    options={provinceAndStateOptions}
                    value={getValue("place_of_incorporation")}
                    onChange={(value) => {
                      handleChange("place_of_incorporation", value);
                    }}
                    readOnly={formProperties.entity_type === undefined || formProperties.entity_type === "Estate"}
                  />
                </Flex>
              </Flex>
              <Flex direction={"column"} gap={"xs"}>
                <Text format={{ fontWeight: "demibold" }}>Address of Legal Entity</Text>
                <Divider />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="entity-address"
                    label="Address"
                    value={getValue("entity_address")}
                    onChange={(value) => {
                      handleChange("entity_address", value);
                    }}
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="entity-city"
                    label="City"
                    value={getValue("entity_city")}
                    onChange={(value) => {
                      handleChange("entity_city", value);
                    }}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="entity-province"
                    label="Province"
                    options={provinceOptions}
                    value={getValue("entity_province")}
                    onChange={(value) => {
                      handleChange("entity_province", value);
                    }}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="entity-postal-code"
                    label="Postal Code"
                    value={getValue("entity_postal_code")}
                    onChange={(value) => {
                      handleChange("entity_postal_code", value);
                    }}
                  />
                </Flex>
              </Flex>
              <Flex direction={"column"} gap={"xs"}>
                <Text format={{ fontWeight: "demibold" }}>Financial Information</Text>
                <Divider />
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-income"
                    label="Income"
                    value={getValue("entity_income")}
                    onChange={(value) => {
                      handleChange("entity_income", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-cash"
                    label="Cash"
                    value={getValue("entity_cash")}
                    onChange={(value) => {
                      handleChange("entity_cash", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-registered-investments"
                    label="Registered Investments"
                    value={getValue("entity_registered_investments")}
                    onChange={(value) => {
                      handleChange("entity_registered_investments", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-non-registered-investments"
                    label="Non-Registered Investments"
                    value={getValue("entity_non_registered_investments")}
                    onChange={(value) => {
                      handleChange("entity_non_registered_investments", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-fixed-assets"
                    label="Fixed Assets"
                    value={getValue("entity_fixed_assets")}
                    onChange={(value) => {
                      handleChange("entity_fixed_assets", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <NumberInput
                    name="entity-mortgages-and-other-liabilities"
                    label="Mortgages and Other Liabilities"
                    value={getValue("entity_mortgages_and_other_liabilities")}
                    onChange={(value) => {
                      handleChange("entity_mortgages_and_other_liabilities", value);
                    }}
                    // min={0}
                    precision={2}
                  />
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
                <Flex>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"column"} gap={"xs"}>
                <Text format={{ fontWeight: "demibold" }}>Individuals with Authority Over the Account</Text>
                <Divider />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="individual-1"
                    label="Individual #1"
                    value={clients ? clients[0].name : null}
                    readOnly={true}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="individual-1-role"
                    label="The individual is a:"
                    options={roleOptions}
                    value={getValue("individual_1_role")}
                    onChange={(value) => {
                      handleChange("individual_1_role", value);
                    }}
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"} justify={"end"}>
                  <Input
                    name="individual-2"
                    label="Individual #2"
                    value={clients && clients.length === 2 ? clients[1].name : null}
                    readOnly={true}
                  />
                </Flex>
                <Flex direction={"column"} justify={"end"}>
                  <Select
                    name="individual-2-role"
                    label="The individual is a:"
                    options={roleOptions}
                    value={getValue("individual_2_role")}
                    onChange={(value) => {
                      handleChange("individual_2_role", value);
                    }}
                    readOnly={clients.length === 2 ? false : true}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Tile>
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button variant="primary" onClick={updateTicketAndKyc} disabled={disabled}>
            Save
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
