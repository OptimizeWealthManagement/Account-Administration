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
  ToggleGroup,
  Alert,
  NumberInput,
} from "@hubspot/ui-extensions";

import type { EmploymentProfileProps, EmploymentProperties } from "../../types";

export const EmploymentProfile = ({
  fetchCrmObjectProperties,
  context,
  runServerless,
  onClick,
  onBackClick,
}: EmploymentProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  //New
  const [property, setProperties] = useState<Array<EmploymentProperties>>([]); //set fetched personal properties
  const [formProperties, setFormProperties] = useState<Array<EmploymentProperties>>([]); // Set form properties for state variables to update contact properties based on inputs and changes
  const [updatedProperties, setUpdatedProperties] = useState<Array<EmploymentProperties>>([]); // Set updated income properties so that updated properties can be reflected in real time

  // const [ciroToggle, setCiroToggle] = useState('');
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  const [inputError, setInputError] = useState(false);
  const [inputValidation, setInputValidation] = useState("");

  // Identify user
  const [user, setUser] = useState(context.user.id);
  const [isLicensedUser, setIsLicensedUser] = useState(false);

  const usersAndOwners = {
    28537004: "147544330",
    60348996: "531990163",
    27385623: "122943925",
    27579176: "126905115",
    50019710: "342803281",
    49906798: "337910566",
    48571265: "280078747",
    60182081: "523113745",
    27947344: "135206579",
    48483287: "276348505",
    43823372: "153725249",
    28373486: "144322101",
    52415497: "456495472",
    24634268: "75595795",
    24634269: "75595796",
    25025765: "82554503",
    26497843: "107203752",
    24586898: "74514019",
    26497852: "107203756",
    27219156: "119682180",
    24634267: "75596723",
    26448243: "106520747", // Pat Bellmore
    24634266: "75596722", // Brian Wells
    50708612: "371512931", // Ryan Moroney
    62267828: "635890469", // Nik Rogan
    52048788: "436208030", // Sameer Amin
    61802707: "609491024", // Cesar Cossio
    65530753: "1641588381", // Philip Swan
    65310595: "1296132769", // William Gilroy
    66008175: "1899666656", // Harris Whiting
    28151284: "139781921", // Doug Ransom
    66225366: "1815856423", // Luciano Teodoro
    66483644: "148878990", // Arthur Senna
    66287395: "736411166", // Leandro Michelena
    67093986: "156604869", // Vikas Yadav
    28145662: "139671374", // Dmitri Chmarycz
    67046113: "1071815162", // Valdecir Oliveira
    67994529: "1471310178", // Jay Kang
  };

  const disableSave = formProperties.length === 0;

  const handleBackClick = onBackClick;
  const handleSaveClick = onClick;

  useEffect(() => {
    // Check to see if user is licensed to toggle if they have view only access or access to edit
    const licensedOwnerId = usersAndOwners[user];
    if (licensedOwnerId) {
      setIsLicensedUser(true);
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchCrmObjectProperties([
      "employment_status",
      "employer_name",
      "occupation",
      "is_this_account_a_pro_account_",
      "is_the_client_considered_a_reporting_insider_",
      "foreign_politically_exposed_person",
      "domestic_politically_exposed_person",
      "head_of_an_international_organization",
      "not_employed_reason",
      "not_employed_reason_other",
      "name_of_foreign_pep",
      "name_of_domestic_pep",
      "name_of_international_organization",
      "relationship_to_pep_foreign",
      "relationship_to_pep_domestic",
      "relationship_to_international_organization",
      "wealth_pep_foreign",
      "wealth_pep_domestic",
      "wealth_international_organization",
      "reporting_insider_symbol",
      "reporting_insider_company",
      "name_of_individual_cro",
      "employer_name_cro",
      "years_until_retirement",
    ]).then((properties) => {
      setUpdatedProperties(properties);
      setProperties(properties);

      setLoading(false);
    });
  }, [fetchCrmObjectProperties]);

  const updateContact = () => {
    setLoading(true);
    runServerless({
      name: "updateContactProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties }, // Send update form properties to update the contact
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        // const status = resp.response;
        console.log(resp.response);
        onClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  const [state, setState] = useState("");

  const employmentTypeOptions = [
    { label: "Employed", value: "Employed" },
    { label: "Self-Employed", value: "Self-Employed" },
    { label: "Retired", value: "Retired" },
    { label: "Not Employed", value: "Not Employed" },
  ];

  const notEmployedOptions = [
    { label: "Homemaker", value: "Homemaker" },
    { label: "Student", value: "Student" },
    { label: "Other", value: "Other" },
  ];

  // All available checklist options
  const checklistOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: isLicensedUser ? false : true,
    description: "",
  }));

  if (loading) {
    return (
      // <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />
      <Box></Box>
    );
  }

  const renderEmployerDetails = () => {
    if (updatedProperties.employment_status === "Employed") {
      return (
        <>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Name of Employer"}
                name="employer-name"
                placeholder={"Hydro One, Toronto-Dominion Bank, etc..."}
                description={"Please provide the name of the client's current employer"}
                value={updatedProperties.employer_name}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    employer_name: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    employer_name: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Occupation"}
                name="occupation"
                placeholder={"Manager of Business Operations, Financial Analyst, etc..."}
                description={"Please detail the client's current occupation or role"}
                tooltip={
                  'Please be as specific as possible. For example, "Manager of Business Operations" is a better answer than "Manager".'
                }
                value={updatedProperties.occupation}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    occupation: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    occupation: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <NumberInput
                label={"Years until retirement"}
                name="years-until-retirement"
                description={"Number of years until the client plans on retiring"}
                value={updatedProperties.years_until_retirement}
                error={inputError}
                validationMessage={validationMessage}
                onChange={(value) => {
                  if (value > 0) {
                    setInputError(false);
                    setValidationMessage("");

                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      years_until_retirement: value, // update property with value
                    });

                    setFormProperties({
                      ...formProperties, // copy current form properties
                      years_until_retirement: value, // update property with value
                    });
                  } else {
                    setInputError(true);
                    setValidationMessage("Number of years until retirement must be greater than zero");
                  }
                }}
                min={0}
                max={70}
                precision={0}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
        </>
      );
    } else if (updatedProperties.employment_status === "Self-Employed") {
      return (
        <>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Name of Employer"}
                name="employer-name"
                placeholder={"John's Plumbing and Drain, etc..."}
                description={"Please provide the name of the client's company"}
                tooltip={
                  'Please provide the actual name of the business. "Self" or simply providing the name of the client is too vague.'
                }
                value={updatedProperties.employer_name}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    employer_name: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    employer_name: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Occupation"}
                name="occupation"
                placeholder={"Owner, President, Chief Executive Officer, etc..."}
                description={"Please detail the client's current occupation or role at their company"}
                tooltip={'Please be as specific as possible. For example, "Owner" is a better answer than "Self".'}
                value={updatedProperties.occupation}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    occupation: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    occupation: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <NumberInput
                label={"Years until retirement"}
                name="years-until-retirement"
                description={"Number of years until the client plans on retiring"}
                value={updatedProperties.years_until_retirement}
                error={inputError}
                validationMessage={validationMessage}
                onChange={(value) => {
                  if (value > 0) {
                    setInputError(false);
                    setValidationMessage("");

                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      years_until_retirement: value, // update property with value
                    });

                    setFormProperties({
                      ...formProperties, // copy current form properties
                      years_until_retirement: value, // update property with value
                    });
                  } else {
                    setInputError(true);
                    setValidationMessage("Number of years until retirement must be greater than zero");
                  }
                }}
                min={0}
                max={70}
                precision={0}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
        </>
      );
    } else if (updatedProperties.employment_status === "Retired") {
      return (
        <>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Name of Former Employer"}
                name="employer-name"
                placeholder={"Hydro One, Toronto-Dominion Bank, etc..."}
                description={"Please provide the name of the client's former employer"}
                value={updatedProperties.employer_name}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    employer_name: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    employer_name: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Former Occupation"}
                name="occupation"
                placeholder={"Manager of Business Operations, Financial Analyst, etc..."}
                description={"Please detail the client's former occupation or role prior to their retirement"}
                tooltip={
                  'Please be as specific as possible. For example, "Manager of Business Operations" is a better answer than "Manager".'
                }
                value={updatedProperties.occupation}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    occupation: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    occupation: value, // update property with value
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
        </>
      );
    } else if (updatedProperties.employment_status === "Not Employed") {
      return (
        <>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Select
                label="Reason"
                name="not-employed-reason"
                placeholder={"Please select an option"}
                description={"Select the option that best fits the reason for the client's employment status"}
                value={updatedProperties.not_employed_reason}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    not_employed_reason: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    not_employed_reason: value, // update property with value
                  });
                }}
                options={notEmployedOptions}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label={"Additional details"}
                name="not-employed-reason-other"
                placeholder={"Temporarily on disability, inbetween jobs, etc..."}
                description={
                  "Please provide additional details detailing the reason for the client's employment status"
                }
                value={updatedProperties.not_employed_reason_other}
                onChange={(value) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    not_employed_reason_other: value, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    not_employed_reason_other: value, // update property with value
                  });
                }}
                readOnly={updatedProperties.not_employed_reason !== "Other" && !isLicensedUser} // Set property to readonly if reason for not being employed does not equal "Other"
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
        </>
      );
    } else {
      //Return an empty frame
    }
  };

  // Render of the CRO components, based on a selection in the main component render
  const renderCRO = () => {
    if (updatedProperties.is_this_account_a_pro_account_ === "Yes") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"md"}>
            <Alert
              title={
                updatedProperties.name_of_individual_cro && updatedProperties.employer_name_cro
                  ? "Additional details"
                  : "Additional details"
              }
              variant={
                updatedProperties.name_of_individual_cro && updatedProperties.employer_name_cro ? "info" : "warning"
              }
            >
              Please provide the below details on the individual who is an employee, officer, or director of a
              securities broker, stock exchange itself, or CRO.
            </Alert>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Full Legal Name"}
                  name="name-of-individual-cro"
                  placeholder={"Provide full legal name"}
                  description={"Please provide the full legal name of this person"}
                  value={updatedProperties.name_of_individual_cro}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      name_of_individual_cro: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      name_of_individual_cro: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Name of Employer"}
                  name="employer-name-cro"
                  placeholder={"Toronto Stock Exchange, etc..."}
                  description={"Provide the name of the above individual's employer"}
                  value={updatedProperties.employer_name_cro}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      employer_name_cro: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      employer_name_cro: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else {
      // Return empty frame
    }
  };

  const renderReportingInsider = () => {
    if (updatedProperties.is_the_client_considered_a_reporting_insider_ === "Yes") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"md"}>
            <Alert
              title={
                updatedProperties.reporting_insider_symbol && updatedProperties.reporting_insider_company
                  ? "Additional details"
                  : "Additional details"
              }
              variant={
                updatedProperties.reporting_insider_symbol && updatedProperties.reporting_insider_company
                  ? "info"
                  : "warning"
              }
            >
              Please provide the below security symbol and company name below of the company that the the client is
              considered a reporting insider of.
            </Alert>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Security Symbol"}
                  name="reporting-insider-symbol"
                  placeholder={"e.g. RY"}
                  description={"Provide the security symbol of the company"}
                  value={updatedProperties.reporting_insider_symbol}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      reporting_insider_symbol: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      reporting_insider_symbol: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Company Name"}
                  name="reporting-insider-company"
                  placeholder={"e.g. Royal Bank of Canada"}
                  description={"Provide the name of company"}
                  value={updatedProperties.reporting_insider_company}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      reporting_insider_company: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      reporting_insider_company: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else {
      // Return empty frame
    }
  };

  const renderForeignPEP = () => {
    if (updatedProperties.foreign_politically_exposed_person === "Yes") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"md"}>
            <Alert
              title={
                updatedProperties.name_of_foreign_pep &&
                updatedProperties.relationship_to_pep_foreign &&
                updatedProperties.wealth_pep_foreign
                  ? "Additional details"
                  : "Additional details"
              }
              variant={
                updatedProperties.name_of_foreign_pep &&
                updatedProperties.relationship_to_pep_foreign &&
                updatedProperties.wealth_pep_foreign
                  ? "info"
                  : "warning"
              }
            >
              Please provide the below details on the individual who is a Foreign Politically Exposed Person.
            </Alert>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Full Legal Name"}
                  name="name-of-pep-foreign"
                  placeholder={"Please provide full legal name"}
                  description={"Provide the full legal name of the politically exposed person"}
                  value={updatedProperties.name_of_foreign_pep}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      name_of_foreign_pep: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      name_of_foreign_pep: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Relationship"}
                  name="relationship-to-foreign-pep"
                  placeholder={"Father, Mother-in-law, etc..."}
                  description={"Provide the client's relationship to the politically exposed person"}
                  value={updatedProperties.relationship_to_pep_foreign}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      relationship_to_pep_foreign: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      relationship_to_pep_foreign: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Source of Wealth"}
                  name="wealth-pep-foreign"
                  // placeholder={'e.g. Royal Bank of Canada'}
                  description={"Provide the source of wealth for the politically exposed person"}
                  value={updatedProperties.wealth_pep_foreign}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      wealth_pep_foreign: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      wealth_pep_foreign: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else {
      // Return empty frame
    }
  };

  const renderDomesticPEP = () => {
    if (updatedProperties.domestic_politically_exposed_person === "Yes") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"md"}>
            <Alert
              title={
                updatedProperties.name_of_domestic_pep &&
                updatedProperties.relationship_to_pep_domestic &&
                updatedProperties.wealth_pep_domestic
                  ? "Additional details"
                  : "Additional details"
              }
              variant={
                updatedProperties.name_of_domestic_pep &&
                updatedProperties.relationship_to_pep_domestic &&
                updatedProperties.wealth_pep_domestic
                  ? "info"
                  : "warning"
              }
            >
              Please provide the below details on the individual who is a Domestic Politically Exposed Person.
            </Alert>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Full Legal Name"}
                  name="name-of-pep-domestic"
                  placeholder={"Please provide full legal name"}
                  description={"Provide the full legal name of the politically exposed person"}
                  value={updatedProperties.name_of_domestic_pep}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      name_of_domestic_pep: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      name_of_domestic_pep: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Relationship"}
                  name="relationship-to-domestic-pep"
                  placeholder={"Father, Mother-in-law, etc..."}
                  description={"Provide the client's relationship to the politically exposed person"}
                  value={updatedProperties.relationship_to_pep_domestic}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      relationship_to_pep_domestic: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      relationship_to_pep_domestic: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Source of Wealth"}
                  name="wealth-pep-domestic"
                  // placeholder={'e.g. Royal Bank of Canada'}
                  description={"Provide the source of wealth for the politically exposed person"}
                  value={updatedProperties.wealth_pep_domestic}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      wealth_pep_domestic: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      wealth_pep_domestic: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else {
      // Return empty frame
    }
  };

  const renderHIO = () => {
    if (updatedProperties.head_of_an_international_organization === "Yes") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"md"}>
            <Alert
              title={
                updatedProperties.name_of_international_organization &&
                updatedProperties.relationship_to_international_organization &&
                updatedProperties.wealth_international_organization
                  ? "Additional details"
                  : "Additional details"
              }
              variant={
                updatedProperties.name_of_international_organization &&
                updatedProperties.relationship_to_international_organization &&
                updatedProperties.wealth_international_organization
                  ? "info"
                  : "warning"
              }
            >
              Please provide the below details on the individual who is the Head of an International Organization.
            </Alert>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  label={"Full Legal Name"}
                  name="name-of-hio"
                  placeholder={"Please provide full legal name"}
                  description={"Provide the full legal name of the individual"}
                  value={updatedProperties.name_of_international_organization}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      name_of_international_organization: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      name_of_international_organization: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Relationship"}
                  name="relationship-to-hio"
                  placeholder={"Father, Mother-in-law, etc..."}
                  description={"Provide the client's relationship to the individual"}
                  value={updatedProperties.relationship_to_international_organization}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      relationship_to_international_organization: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      relationship_to_international_organization: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label={"Source of Wealth"}
                  name="wealth-pep-hio"
                  // placeholder={'e.g. Royal Bank of Canada'}
                  description={"Provide the source of wealth for the individual"}
                  value={updatedProperties.wealth_international_organization}
                  onChange={(value) => {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      wealth_international_organization: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      wealth_international_organization: value, // update property with value
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else {
      // Return empty frame
    }
  };

  return (
    <>
      <Tile>
        <Flex direction={"column"} gap={"md"}>
          <Heading>Employment Profile</Heading>
          <Flex direction={"row"} gap={"extra-small"} justify={"between"}>
            <Button onClick={handleBackClick}>{"< Back"}</Button>
          </Flex>
          {isLicensedUser ? (
            <></>
          ) : (
            <>
              <Alert title="View Only" variant="info">
                Only licensed representatives have access to edit these properties.
              </Alert>
            </>
          )}
          <Divider />
          <Text format={{ fontWeight: "demibold" }}>Employment Information</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Select
                label="Employment Status"
                name="employment-status"
                placeholder="Please select an option"
                value={updatedProperties.employment_status}
                onChange={(value) => {
                  if (updatedProperties.employment_status) {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      employment_status: value, // update property with value
                      employer_name: "", // clear current employer name property
                      occupation: "", // clear current occupation property
                      not_employed_reason: "", // clear current reason for not being employed
                      not_employed_reason_other: "", // clear additional details around client being not employed
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      employment_status: value, // update property with value
                    });
                  } else {
                    setUpdatedProperties({
                      ...updatedProperties, // copy current properties
                      employment_status: value, // update property with value
                    });
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      employment_status: value, // update property with value
                    });
                  }
                  console.log(formProperties.employment_status);
                }}
                options={employmentTypeOptions}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {updatedProperties.employment_status ? renderEmployerDetails() : renderEmployerDetails()}
          <Divider />
          <Text format={{ fontWeight: "demibold" }}>Additional Questions</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="ciro-member"
                label="Is the client or a member of their family with whom they live an employee, officer, or director of a securities broker, stock exchange itself, or CRO?"
                options={checklistOptions}
                toggleType="radioButtonList"
                // inline={true}
                value={updatedProperties.is_this_account_a_pro_account_}
                onChange={(items) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    is_this_account_a_pro_account_: items!, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    is_this_account_a_pro_account_: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {updatedProperties.is_this_account_a_pro_account_ ? renderCRO() : renderCRO()}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="reporting-insider"
                label="Is the client considered a reporting insider within the meaning of the regulation?"
                options={checklistOptions}
                toggleType="radioButtonList"
                // inline={true}
                value={updatedProperties.is_the_client_considered_a_reporting_insider_}
                onChange={(items) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    is_the_client_considered_a_reporting_insider_: items!, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    is_the_client_considered_a_reporting_insider_: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {updatedProperties.is_the_client_considered_a_reporting_insider_
            ? renderReportingInsider()
            : renderReportingInsider()}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="pep-foreign"
                label="Is the client, a member of their family, or a close associate of theirs a Foreign Politically Exposed Person?"
                options={checklistOptions}
                toggleType="radioButtonList"
                // inline={true}
                value={updatedProperties.foreign_politically_exposed_person}
                onChange={(items) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    foreign_politically_exposed_person: items!, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    foreign_politically_exposed_person: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {updatedProperties.foreign_politically_exposed_person ? renderForeignPEP() : renderForeignPEP()}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="pep-domestic"
                label="Is the client, a member of their family, or a close associate of theirs a Domestic Politically Exposed Person?"
                options={checklistOptions}
                toggleType="radioButtonList"
                // inline={true}
                value={updatedProperties.domestic_politically_exposed_person}
                onChange={(items) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    domestic_politically_exposed_person: items!, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    domestic_politically_exposed_person: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {updatedProperties.domestic_politically_exposed_person ? renderDomesticPEP() : renderDomesticPEP()}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="hio"
                label="Is the client, a member of their family, or a close associate of theirs the Head of an International Organization?"
                options={checklistOptions}
                toggleType="radioButtonList"
                // inline={true}
                value={updatedProperties.head_of_an_international_organization}
                onChange={(items) => {
                  setUpdatedProperties({
                    ...updatedProperties, // copy current properties
                    head_of_an_international_organization: items!, // update property with value
                  });
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    head_of_an_international_organization: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          ;{updatedProperties.head_of_an_international_organization ? renderHIO() : renderHIO()}
          <Divider distance="extra-large" />
          <Flex direction={"row"} gap={"extra-small"} justify={"between"}>
            {isLicensedUser ? (
              <>
                <Button variant="primary" onClick={updateContact} disabled={disableSave}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" onClick={updateContact} disabled={true}>
                  Save
                </Button>
              </>
            )}
            {/* <Button variant="primary" onClick={updateContact} disabled={disableSave && !isLicensedUser}>
              Save
            </Button> */}
          </Flex>
        </Flex>
      </Tile>
    </>
  );
};
