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
  TextArea,
} from "@hubspot/ui-extensions";

import type { InvestorProfileProps, InvestorProperties } from "../../types";

export const InvestorProfile = ({
  fetchCrmObjectProperties,
  context,
  sendAlert,
  runServerless,
  onClick,
  onBackClick,
}: InvestorProfileProps) => {
  //New
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [property, setProperties] = useState<Array<InvestorProperties>>([]); //set fetched personal properties
  const [formProperties, setFormProperties] = useState<Array<InvestorProperties>>([]); // Set form properties for state variables to update investor properties based on inputs and changes
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [currentExperience, setCurrentExperience] = useState<Array>([]);

  const disableSave = formProperties.length === 0;

  // Set user
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

  useEffect(() => {
    const licensedOwnerId = usersAndOwners[user];
    if (licensedOwnerId) {
      setIsLicensedUser(true);
    }
  });

  const trustedContactRelationshipOptions = [
    { label: "Spouse", value: "Spouse" },
    { label: "Parent", value: "Parent" },
    { label: "Sibling", value: "Sibling" },
    { label: "Grandparent", value: "Grandparent" },
    { label: "Child", value: "Child" },
    { label: "Aunt / Uncle", value: "Aunt / Uncle" },
    { label: "Niece / Nephew", value: "Niece / Nephew" },
    { label: "Grandchild", value: "Grandchild" },
    { label: "Friend", value: "Friend" },
  ];

  const handleBackClick = onBackClick;
  const handleSaveClick = onClick;

  useEffect(() => {
    setLoading(true);
    fetchCrmObjectProperties([
      "investment_knowledge",
      "investment_experience",
      "vulnerable_client_",
      "vulnerable_client_details",
      "trusted_contact_person",
      "trusted_contact_first_name",
      "trusted_contact_last_name",
      "trusted_contact_email",
      "trusted_contact_phone",
      "trusted_contact_address",
      "trusted_contact_city",
      "trusted_contact_province",
      "trusted_contact_postal_code",
      "trusted_contact_relationship",
    ]).then((properties) => {
      setProperties(properties);
      let experience = properties.investment_experience;
      const experienceList = [];
      if (experience) {
        experienceList.push(experience.split(";"));
      }

      setCurrentExperience(experienceList);
      setLoading(false);
    });
  }, [fetchCrmObjectProperties]);

  const convertObjectToString = (obj) => {};

  const updateContact = () => {
    setLoading(true);
    runServerless({
      name: "updateContactProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties }, // Send update form properties to update the contact
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        onClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  const [state, setState] = useState("");

  // Provice options
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

  // All available vulnerable client options
  const vulnerableClientOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: property.vulnerable_client_ === n ? true : false,
    readonly: isLicensedUser ? false : true,
    description: "",
  }));

  // All available vulnerable client options
  const tcpOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: property.trusted_contact_person === "Yes" ? true : false,
    readonly: isLicensedUser ? false : true,
    description: "",
  }));

  const investmentKnowledgeDescriptions = {
    None: "They are brand new to investing and has no knowledge of financial markets and investments",
    Beginner: "They are new to investing and / or has limited knowledge of financial markets and investments",
    Moderate: "They have good knowledge and some investment experience",
    Advanced: "They have lots of investment experience and strong knowledge of financial markets and investments",
    Expert:
      "They have extensive investment experience and sophisticated knowledge of financial markets and investments",
  };

  // All available investment knowledge options
  const investmentKnowledgeOptions = ["None", "Beginner", "Moderate", "Advanced", "Expert"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: isLicensedUser ? false : true,
    description: investmentKnowledgeDescriptions[n],
  }));

  const investmentExperienceDescriptions = {
    "None": "",
    "Stocks": "",
    "Mutual Funds": "",
    "Bonds": "This includes experience with GICs",
    "Real Estate": "This includes experience with REITs, Real Estate Funds, and Rental Properties",
    "Derivatives, Options, Futures, or Currency Trading": "",
  };

  // All available investment experience options
  const investmentExperienceOptions = [
    "None",
    "Stocks",
    "Mutual Funds",
    "Bonds",
    "Real Estate",
    "Derivatives, Options, Futures, or Currency Trading",
  ].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: currentExperience.includes(n) ? true : false,
    readonly: isLicensedUser ? false : true,
    description: investmentExperienceDescriptions[n],
  }));

  const formatString = (value: string) => {
    const stringArray = value.split(";");
    return stringArray;
  };

  const getArrayValue = (key: string) => {
    if (property) {
      if (property[key]) {
        const value = property[key];

        const formattedString = value.split(";");

        return formattedString;
      } else {
        console.log(key, " has no value: ", property[key]);
        return [];
      }
    }
  };

  if (loading) {
    return (
      // <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />
      <Box></Box>
    );
  }

  return (
    <>
      <Tile>
        <Flex direction={"column"} gap={"md"}>
          <Heading>Investor Profile</Heading>
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
          {/* <Text format={{ fontWeight: 'demibold' }}>Investor Information</Text> */}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="investment-knowledge"
                label="Investment Knowledge"
                tooltip={"Select which statement best describes the client's investment knowledge and experience"}
                options={investmentKnowledgeOptions}
                toggleType="radioButtonList"
                value={
                  formProperties && formProperties.investment_knowledge
                    ? formProperties.investment_knowledge
                    : property.investment_knowledge
                }
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    investment_knowledge: items!, // update property with value
                  });
                }}
              />
            </Flex>
            <Flex>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="investment-experience"
                label="Investment Experience"
                tooltip={
                  "Investment Experience refers to the various types of securities that the client currently owns or has owned in the past"
                }
                options={investmentExperienceOptions}
                toggleType="checkboxList"
                value={getArrayValue("investment_experience")}
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    investment_experience: String(items!.join(";")), // update property with value
                  });

                  setProperties({
                    ...property, // copy current form properties
                    investment_experience: String(items!.join(";")), // update property with value
                  });
                }}
              />
            </Flex>
            <Flex>
              <Box></Box>
            </Flex>
          </Flex>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="vulnerable-client"
                label="Is the client a Vulnerable Client?"
                // tooltip={"Investment Experience refers to the various types of securities that the client currently owns or has owned in the past"}
                options={vulnerableClientOptions}
                toggleType="radioButtonList"
                value={
                  formProperties?.vulnerable_client_ ? formProperties?.vulnerable_client_ : property?.vulnerable_client_
                }
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    vulnerable_client_: items!, // update property with value
                  });

                  // setProperties({
                  //   ...formProperties, // copy current form properties
                  //   vulnerable_client_: items! // update property with value
                  // });
                }}
              />
            </Flex>
            <Flex>
              <Box></Box>
            </Flex>
          </Flex>
          {(formProperties?.vulnerable_client_ || property?.vulnerable_client_) === "Yes" && (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <TextArea
                  name="vulnerable-client-details"
                  label="Please provide details on the client's vulnerability"
                  toggleType="radioButtonList"
                  value={
                    formProperties?.vulnerable_client_details
                      ? formProperties?.vulnerable_client_details
                      : property?.vulnerable_client_details || ""
                  }
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties, // copy current form properties
                      vulnerable_client_details: value, // update property with value
                    });
                  }}
                  cols={200}
                  rows={10}
                  resize="vertical"
                />
              </Flex>
              <Flex>
                <Box></Box>
              </Flex>
            </Flex>
          )}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="trusted-contact-person"
                label="Does the client have a Trusted Contact Person?"
                tooltip={
                  "A Trusted Contact Person (TCP) is an emergency contact which is recommended as a means to help protect the client's financial interest and assets. Providing a TCP is optional, and the client may revoke or change their TCP at any time. By designating a TCP, the client is consenting to Optimize contacting their TCP if we have concerns about the the client's whereabouts or well being, including but not limited to matters of possible financial exploitation, mental capacity, or in the case of any sort of emergency."
                }
                options={tcpOptions}
                toggleType="radioButtonList"
                value={
                  formProperties?.trusted_contact_person
                    ? formProperties?.trusted_contact_person
                    : property?.trusted_contact_person
                }
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties, // copy current form properties
                    trusted_contact_person: items!, // update property with value
                  });

                  // setProperties({
                  //   ...formProperties, // copy current form properties
                  //   trusted_contact_person: items! // update property with value
                  // });
                }}
              />
            </Flex>
            <Flex>
              <Box></Box>
            </Flex>
          </Flex>
          {(property.trusted_contact_person && property.trusted_contact_person === "Yes") ||
          (formProperties.trusted_contact_person && formProperties.trusted_contact_person === "Yes") ? (
            <>
              <Tile>
                <Flex direction={"column"} gap={"md"}>
                  <Text format={{ fontWeight: "demibold" }}>Trusted Contact Person Information</Text>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        label="First Name"
                        name="trusted-contact-first-name"
                        // description="The Trusted Contact Person\'s first / given name"
                        value={
                          property && property.trusted_contact_first_name ? property.trusted_contact_first_name : ""
                        }
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_first_name: value,
                          });

                          // setProperties({
                          //   ...property,
                          //   trusted_contact_first_name: value
                          // });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        label="Last Name"
                        name="trusted-contact-last-name"
                        value={property && property.trusted_contact_last_name ? property.trusted_contact_last_name : ""}
                        // description=""
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_last_name: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_last_name: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        label="Email"
                        name="trusted-contact-email"
                        // description="The Trusted Contact Person\'s email"
                        value={property && property.trusted_contact_email ? property.trusted_contact_email : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_email: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_email: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        label="Phone Number"
                        name="trusted-contact-phone"
                        // description="The Trusted Contact Person\'s phone number"
                        value={property && property.trusted_contact_phone ? property.trusted_contact_phone : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_phone: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_phone: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Box></Box>
                    </Flex>
                  </Flex>
                  <Flex direction={"row"} gap={"md"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Input
                        label="Address"
                        name="trusted-contact-address"
                        // description="The Trusted Contact Person\'s street and civic number"
                        value={property && property.trusted_contact_address ? property.trusted_contact_address : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_address: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_address: value,
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
                        label="City"
                        name="trusted-contact-city"
                        // description="The Trusted Contact Person\'s street and civic number"
                        value={property && property.trusted_contact_city ? property.trusted_contact_city : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_city: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_city: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Select
                        label="Province"
                        name="trusted-contact-province"
                        placeholder="Select an option"
                        options={provinceOptions}
                        // value={formProperties.trusted_contact_province ? formProperties.trusted_contact_province : property.trusted_contact_province}
                        value={property && property.trusted_contact_province ? property.trusted_contact_province : ""}
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_province: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_province: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Input
                        label="Postal Code"
                        name="trusted-contact-postal-code"
                        // description="The Trusted Contact Person\'s street and civic number"
                        value={
                          property && property.trusted_contact_postal_code ? property.trusted_contact_postal_code : ""
                        }
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_postal_code: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_postal_code: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                    <Flex direction={"column"}>
                      <Select
                        label="Relationship"
                        name="trusted_contact_relationship"
                        // description="The Trusted Contact Person\'s street and civic number"
                        options={trustedContactRelationshipOptions}
                        value={
                          property && property.trusted_contact_relationship
                            ? property.trusted_contact_relationship
                            : null
                        }
                        onChange={(value) => {
                          setFormProperties({
                            ...formProperties,
                            trusted_contact_relationship: value,
                          });

                          setProperties({
                            ...property,
                            trusted_contact_relationship: value,
                          });
                        }}
                        readOnly={!isLicensedUser}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Tile>
            </>
          ) : (
            <></>
          )}
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
          </Flex>
        </Flex>
      </Tile>
    </>
  );
};
