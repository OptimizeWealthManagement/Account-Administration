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
  NumberInput,
  Select,
  Alert,
} from "@hubspot/ui-extensions";
import { CrmActionButton } from "@hubspot/ui-extensions/crm";
import type { PersonalProfileProps, PersonalProperties, SpouseProperties, PersonalProfileTestProps } from "../../types";

export const PersonalProfileTest = ({
  fetchCrmObjectProperties,
  kycs,
  context,
  runServerless,
  onClick,
  onBackClick,
}: PersonalProfileTestProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  //New
  const [property, setProperties] = useState<Array<PersonalProperties>>([]); //set fetched personal properties
  const [formProperties, setFormProperties] = useState<Array<PersonalProperties>>([]); //set fetched personal properties
  // const [temp, setTemp] = useState('');
  const [dobYear, setDobYear] = useState<number>();
  const [dobMonth, setDobMonth] = useState<number>();
  const [dobDay, setDobDay] = useState<number>();
  const [showSpouse, setShowSpouse] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [cadAddress, setCadAddress] = useState(false);
  const [usAddress, setUsAddress] = useState(false);
  const [foreignAddress, setForeignAddress] = useState(false);
  const [disableSave, setDisableSave] = useState(true);

  const [inputError, setInputError] = useState(false);
  const [inputValidation, setInputValidation] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [showDependants, setShowDependants] = useState(false);

  // Set user
  const [user, setUser] = useState(context.user.id);
  const [isLicensedUser, setIsLicensedUser] = useState(false);

  const [contact, setContact] = useState("");

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
    43631193: "149513611", // Cameron Adams
  };

  const handleBackClick = onBackClick;
  const handleSaveClick = onClick;

  useEffect(() => {
    const licensedOwnerId = usersAndOwners[user];
    if (licensedOwnerId) {
      setIsLicensedUser(true);
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchCrmObjectProperties([
      "firstname",
      "hs_object_id",
      "middlename",
      "lastname",
      "phone",
      "mobilephone",
      "email",
      "date_of_birth",
      "marital_status_options",
      "secondary_first_name",
      "spouse_middle_name",
      "spouse_last_name",
      "country_address",
      "address",
      "city",
      "province__state",
      "postal_code___zip_code",
      "number_of_dependants",
      "employment_status_spouse",
      "employer_name_spouse",
      "occupation_spouse",
      "not_employed_reason_spouse",
      "not_employed_reason_other_spouse",
      "years_until_retirement_spouse",
    ]).then((properties) => {
      setProperties(properties);

      delete property.hs_object_id;

      setContact(properties.hs_object_id);

      const dob = new Date(Number(properties.date_of_birth));
      const year = dob.getFullYear();
      const month = dob.getMonth();
      const day = dob.getDate() + 1;
      setDobYear(year);
      setDobMonth(month);
      setDobDay(day);
      setLoading(false);

      //Set marital status state
      if (properties.marital_status_options === "Married") {
        setShowSpouse(true);
      } else if (properties.marital_status_options === "Common Law") {
        setShowSpouse(true);
      } else {
        //Pass
      }

      if (properties.country_address === "Canada") {
        setCadAddress(true);
        setShowAddress(true);
      } else if (properties.country_address === "United States") {
        setUsAddress(true);
        setShowAddress(true);
      } else if (properties.country_address.length > 0) {
        setForeignAddress(true);
        setShowAddress(true);
      } else {
      }
    });
  }, [fetchCrmObjectProperties]);

  const updateContactAndKyc = () => {
    setLoading(true);
    runServerless({
      name: "updateContactAndKycProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { form: formProperties, kycs: kycs }, // Send update form properties to update the contact
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        const status = resp.response;
        console.log(resp.response);
        onClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  //New - marital status options
  const maritalOptions = [
    { label: "Single", value: "Single" },
    { label: "Married", value: "Married" },
    { label: "Common Law", value: "Common Law" },
    { label: "Divorced", value: "Divorced" },
    { label: "Widowed", value: "Widowed" },
  ];

  const [maritalStatus, setMaritalStatus] = useState("");

  //New - country address options

  const countryOptions = [
    { label: "Canada", value: "Canada" },
    { label: "United States", value: "United States" },
    { label: "Other", value: "Other" },
  ];

  //New - province options

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

  const [province, setProvince] = useState("");
  //New - state options

  const stateOptions = [
    { label: "Alabama", value: "Alabama" },
    { label: "Alaska", value: "Alaska" },
    { label: "Arizona", value: "Arizona" },
    { label: "Arkansas", value: "Arkansas" },
    { label: "California", value: "California" },
    { label: "Colorado", value: "Colorado" },
    { label: "Connecticut", value: "Connecticut" },
    { label: "Delaware", value: "Delaware" },
    { label: "Florida", value: "Florida" },
    { label: "Georgia", value: "Georgia" },
    { label: "Hawaii", value: "Hawaii" },
    { label: "Idaho", value: "Idaho" },
    { label: "Illinois", value: "Illinois" },
    { label: "Indiana", value: "Indiana" },
    { label: "Iowa", value: "Iowa" },
    { label: "Kansas", value: "Kansas" },
    { label: "Kentucky", value: "Kentucky" },
    { label: "Louisiana", value: "Louisiana" },
    { label: "Maine", value: "Maine" },
    { label: "Maryland", value: "Maryland" },
    { label: "Massachusetts", value: "Massachusetts" },
    { label: "Michigan", value: "Michigan" },
    { label: "Minnesota", value: "Minnesota" },
    { label: "Mississippi", value: "Mississippi" },
    { label: "Missouri", value: "Missouri" },
    { label: "Montana", value: "Montana" },
    { label: "Nebraska", value: "Nebraska" },
    { label: "Nevada", value: "Nevada" },
    { label: "New Hampshire", value: "New Hampshire" },
    { label: "New Jersey", value: "New Jersey" },
    { label: "New Mexico", value: "New Mexico" },
    { label: "New York", value: "New York" },
    { label: "North Carolina", value: "North Carolina" },
    { label: "North Dakota", value: "North Dakota" },
    { label: "Ohio", value: "Ohio" },
    { label: "Oklahoma", value: "Oklahoma" },
    { label: "Oregon", value: "Oregon" },
    { label: "Pennsylvania", value: "Pennsylvania" },
    { label: "Rhode Island", value: "Rhode Island" },
    { label: "South Carolina", value: "South Carolina" },
    { label: "South Dakota", value: "South Dakota" },
    { label: "Tennessee", value: "Tennessee" },
    { label: "Texas", value: "Texas" },
    { label: "Utah", value: "Utah" },
    { label: "Vermont", value: "Vermont" },
    { label: "Virginia", value: "Virginia" },
    { label: "Washington", value: "Washington" },
    { label: "West Virginia", value: "West Virginia" },
    { label: "Wisconsin", value: "Wisconsin" },
    { label: "Wyoming", value: "Wyoming" },
  ];

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

  const convertDate = (value: number) => {
    if (typeof value === "string") {

      const newValue = Number(value);
      const dateTimestamp = new Date(newValue);
      const dateYear = dateTimestamp.getUTCFullYear();
      const dateMonth = dateTimestamp.getUTCMonth(); // Adding 1 to get the month in 1-12 format
      const dateDay = dateTimestamp.getUTCDate();
      const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };


      return formattedDateObject;
    }

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

  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <>
      <Tile>
        <Flex direction={"column"} gap={"md"}>
          <Heading>Personal Profile Test</Heading>
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
          <Alert title="Important" variant="info">
            The client's name and date of birth must match what is shown on their Government Issued ID.
          </Alert>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label="First Name"
                name="first-name"
                tooltip="Please enter the first or given name of the client as its displayed on their Government Issued ID."
                description="(Given name)"
                placeholder="John"
                value={property.firstname}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    firstname: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Input
                label="Middle Name"
                name="middle-name"
                tooltip="If applicable, please enter the middle name of the client as its displayed on their Government Issued ID."
                description="(Optional, if applicable)"
                placeholder="(Optional)"
                value={property.middlename}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    middlename: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Input
                label="Last Name"
                name="last-name"
                tooltip="Please enter the last or surname/family name of the client as its displayed on their Government Issued ID."
                description="(Surname / family name)"
                placeholder="Durston"
                value={property.lastname}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    lastname: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label="Phone Number"
                name="phone-number"
                value={property.phone}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    phone: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Input
                label="Mobile Number"
                name="mobile-phone"
                value={property.mobilephone}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    mobilephone: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Input
                label="Email"
                name="email"
                value={property.email}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    email: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <DateInput
                label="Date of Birth"
                name="date-of-birth"
                format="standard"
                value={property && property.date_of_birth ? convertDate(property.date_of_birth) : null}
                required={true}
                onChange={(value) => {

                  if (value === undefined) {
                    setFormProperties({
                      ...formProperties,
                      date_of_birth: null,
                    });
                    setProperties({
                      ...property,
                      date_of_birth: null,
                    });
                  } else {
                    const dateValue = convertDateToNumber(value);
                    setFormProperties({
                      ...formProperties,
                      date_of_birth: dateValue,
                    });
                    setProperties({
                      ...property,
                      date_of_birth: dateValue,
                    });
                  }
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
              <Select
                label="Marital Status"
                name="marital-status"
                options={maritalOptions}
                value={property.marital_status_options}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    marital_status_options: value,
                  });
                  if (value === "Married") {
                    setShowSpouse(true);
                  } else if (value === "Common Law") {
                    setShowSpouse(true);
                  } else {
                    setShowSpouse(false);
                  }
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
                label="Number of Dependants"
                name="number-of-dependants"
                tooltip="A dependant is considered an individual who is financially dependant on the client, including children, spouses, and relatives who rely on the client for financial support."
                value={
                  property.number_of_dependants ? property.number_of_dependants : formProperties.number_of_dependants
                }
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    number_of_dependants: value,
                  });
                }}
                min={0}
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
          {/* Conditionally display spousal information if marital status is Married or Common Law */}
          {showSpouse && (
            <>
              <Divider />
              <Text format={{ fontWeight: "demibold" }}>Spouse Information</Text>
              <Alert title="Important" variant="info">
                The spouse's name must match what is shown on their Government Issued ID.
              </Alert>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Input
                    label="First Name"
                    name="first-name"
                    tooltip="Please enter the first or given name of the client as its displayed on their Government Issued ID."
                    description="(Given name)"
                    placeholder="Thomas"
                    value={property.secondary_first_name}
                    required={true}
                    onChange={(value) => {
                      setFormProperties({
                        ...formProperties,
                        secondary_first_name: value,
                      });
                    }}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Input
                    label="Middle Name"
                    name="middle-name"
                    tooltip="If applicable, please enter the middle name of the client as its displayed on their Government Issued ID."
                    description="(Optional, if applicable)"
                    placeholder="(Optional)"
                    value={property.spouse_middle_name}
                    onChange={(value) => {
                      setFormProperties({
                        ...formProperties,
                        spouse_middle_name: value,
                      });
                    }}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Input
                    label="Last Name"
                    name="last-name"
                    tooltip="Please enter the last or surname/family name of the client as its displayed on their Government Issued ID."
                    description="(Surname / family name)"
                    placeholder=""
                    value={property.spouse_last_name}
                    required={true}
                    onChange={(value) => {
                      setFormProperties({
                        ...formProperties,
                        spouse_last_name: value,
                      });
                    }}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Select
                    label="Employment Status"
                    name="employment-status"
                    description="(of Spouse)"
                    placeholder="Please select an option"
                    value={property.employment_status_spouse}
                    onChange={(value) => {
                      if (property.employment_status_spouse) {
                        setProperties({
                          ...property, // copy current properties
                          employment_status_spouse: value, // update property with value
                          employer_name_spouse: "", // clear current employer name property
                          occupation_spouse: "", // clear current occupation property
                          not_employed_reason_spouse: "", // clear current reason for not being employed
                          not_employed_reason_other_spouse: "", // clear additional details around client being not employed
                        });
                        setFormProperties({
                          ...formProperties, // copy current form properties
                          employment_status_spouse: value, // update property with value
                        });
                      } else {
                        setProperties({
                          ...property, // copy current properties
                          employment_status_spouse: value, // update property with value
                        });
                        setFormProperties({
                          ...formProperties, // copy current form properties
                          employment_status_spouse: value, // update property with value
                        });
                      }
                    }}
                    options={employmentTypeOptions}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
                {property &&
                property.employment_status_spouse &&
                (property.employment_status_spouse === "Employed" ||
                  property.employment_status_spouse === "Self-Employed" ||
                  property.employment_status_spouse === "Retired" ||
                  property.employment_status_spouse === "Not Employed") ? (
                  <>
                    <Flex direction={"column"}>
                      {property &&
                      property.employment_status_spouse &&
                      property.employment_status_spouse !== "Not Employed" ? (
                        <>
                          <Input
                            label={
                              property &&
                              property.employment_status_spouse &&
                              property.employment_status_spouse === "Retired"
                                ? "Name of Former Employer"
                                : "Name of Employer"
                            }
                            name="employer-name-spouse"
                            placeholder={"Hydro One, Toronto-Dominion Bank, etc..."}
                            description={
                              property &&
                              property.employment_status_spouse &&
                              property.employment_status_spouse === "Retired"
                                ? "Please provide the name of the spouse's former employer"
                                : "Please provide the name of the spouse's current employer"
                            }
                            value={property.employer_name_spouse}
                            onChange={(value) => {
                              setProperties({
                                ...property, // copy current properties
                                employer_name_spouse: value, // update property with value
                              });
                              setFormProperties({
                                ...formProperties, // copy current form properties
                                employer_name_spouse: value, // update property with value
                              });
                            }}
                            readOnly={!isLicensedUser}
                          />
                        </>
                      ) : (
                        <>
                          <Select
                            label="Reason"
                            name="not-employed-reason-spouse"
                            placeholder={"Please select an option"}
                            description={
                              "Select the option that best fits the reason for the spouse's employment status"
                            }
                            value={property.not_employed_reason_spouse}
                            onChange={(value) => {
                              setProperties({
                                ...property, // copy current properties
                                not_employed_reason_spouse: value, // update property with value
                              });
                              setFormProperties({
                                ...formProperties, // copy current form properties
                                not_employed_reason_spouse: value, // update property with value
                              });
                            }}
                            options={notEmployedOptions}
                            readOnly={!isLicensedUser}
                          />
                        </>
                      )}
                    </Flex>
                    <Flex direction={"column"}>
                      {property &&
                      property.employment_status_spouse &&
                      property.employment_status_spouse !== "Not Employed" ? (
                        <>
                          <Input
                            label={
                              property &&
                              property.employment_status_spouse &&
                              property.employment_status_spouse === "Retired"
                                ? "Former Occupation"
                                : "Occupation="
                            }
                            name="occupation-spouse"
                            placeholder={"Manager of Business Operations, Financial Analyst, etc..."}
                            description={
                              property &&
                              property.employment_status_spouse &&
                              property.employment_status_spouse === "Retired"
                                ? "Please detail the spouse's former occupation or role"
                                : "Please detail the spouse's current occupation or role"
                            }
                            tooltip={
                              'Please be as specific as possible. For example, "Manager of Business Operations" is a better answer than "Manager".'
                            }
                            value={property.occupation_spouse}
                            onChange={(value) => {
                              setProperties({
                                ...property, // copy current properties
                                occupation_spouse: value, // update property with value
                              });
                              setFormProperties({
                                ...formProperties, // copy current form properties
                                occupation_spouse: value, // update property with value
                              });
                            }}
                            readOnly={!isLicensedUser}
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            label={"Additional details"}
                            name="not-employed-reason-other-spouse"
                            placeholder={"Temporarily on disability, inbetween jobs, etc..."}
                            description={
                              "Please provide additional details detailing the reason for the spouse's employment status"
                            }
                            value={property.not_employed_reason_other_spouse}
                            onChange={(value) => {
                              setProperties({
                                ...property, // copy current properties
                                not_employed_reason_other_spouse: value, // update property with value
                              });
                              setFormProperties({
                                ...formProperties, // copy current form properties
                                not_employed_reason_other_spouse: value, // update property with value
                              });
                            }}
                            readOnly={property.not_employed_reason_spouse !== "Other" && !isLicensedUser} // Set property to readonly if reason for not being employed does not equal "Other"
                          />
                        </>
                      )}
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </>
                )}
              </Flex>
            </>
          )}
          {property &&
          property.marital_status_options &&
          (property.marital_status_options === "Married" || property.marital_status_options === "Common Law") &&
          property.employment_status_spouse &&
          (property.employment_status_spouse === "Employed" ||
            property.employment_status_spouse === "Self-Employed") ? (
            <>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <NumberInput
                    label={"Years until retirement"}
                    name="years-until-retirement-spouse"
                    description={"Number of years until the spouse plans on retiring"}
                    value={property.years_until_retirement_spouse}
                    error={inputError}
                    validationMessage={validationMessage}
                    onChange={(value) => {
                      if (value > 0) {
                        setInputError(false);
                        setValidationMessage("");

                        setProperties({
                          ...property, // copy current properties
                          years_until_retirement_spouse: value, // update property with value
                        });

                        setFormProperties({
                          ...formProperties, // copy current form properties
                          years_until_retirement_spouse: value, // update property with value
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
          ) : (
            <></>
          )}
          <Divider />
          <Text format={{ fontWeight: "demibold" }}>Residential Address</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Input
                label="Street"
                name="street"
                placeholder="Nelles Ave"
                value={property.address}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    address: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
            <Flex direction={"column"}>
              <Input
                label="City"
                name="city"
                placeholder="Toronto"
                value={property.city}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    city: value,
                  });
                }}
                readOnly={!isLicensedUser}
              />
            </Flex>
          </Flex>;
          {
            cadAddress && (
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Select
                    label="Province"
                    name="province"
                    value={property.province__state}
                    options={provinceOptions}
                    required={true}
                    onChange={(value) => {
                      setProvince(value);
                      setFormProperties({
                        ...formProperties,
                        province__state: value,
                      });
                    }}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Input
                    label="Postal Code"
                    name="postal-code"
                    placeholder="M6S 1T7"
                    value={property.postal_code___zip_code}
                    required={true}
                    onChange={(value) => {
                      setFormProperties({
                        ...formProperties,
                        postal_code___zip_code: value,
                      });
                    }}
                    readOnly={!isLicensedUser}
                  />
                </Flex>
              </Flex>
            )
          }
          {usAddress && (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Select
                  label="State"
                  name="state"
                  value={property.province__state}
                  options={stateOptions}
                  required={true}
                  onChange={(value) => {
                    setProvince(value);
                    setFormProperties({
                      ...formProperties,
                      province__state: value,
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
              <Flex direction={"column"}>
                <Input
                  label="ZIP Code"
                  name="zip-code"
                  placeholder="90210"
                  value={property.postal_code___zip_code}
                  required={true}
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      postal_code___zip_code: value,
                    });
                  }}
                  readOnly={!isLicensedUser}
                />
              </Flex>
            </Flex>
          )}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <Select
                label="Country"
                name="country"
                value={property.country_address}
                options={countryOptions}
                required={true}
                onChange={(value) => {
                  setFormProperties({
                    ...formProperties,
                    country_address: value,
                  });
                  if (value === "Canada") {
                    setCadAddress(true);
                    setUsAddress(false);
                    setForeignAddress(false);
                  } else if (value === "United States") {
                    setCadAddress(false);
                    setUsAddress(true);
                    setForeignAddress(false);
                  } else {
                    setCadAddress(false);
                    setUsAddress(false);
                    setForeignAddress(true);
                  }
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
          <Divider distance="extra-large" />
          <Flex direction={"row"} gap={"extra-small"} justify={"between"}>
            <Button
              variant="primary"
              onClick={() => {
                if (
                  kycs &&
                  kycs.primary_account_holder &&
                  kycs.primary_account_holder.length === 0 &&
                  kycs.secondary_account_holder &&
                  kycs.secondary_account_holder.length === 0
                ) {
                  console.log("Update Contact");
                } else {
                  updateContactAndKyc(kycs);
                }
              }}
            >
              Save
            </Button>
            {isLicensedUser ? (
              <></>
            ) : (
              <>
              </>
            )}
          </Flex>
        </Flex>
      </Tile>
    </>
  );
};
