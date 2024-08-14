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
} from "@hubspot/ui-extensions";

import type { TaxResidencyProfileProps, TaxResidencyProperties, TaxFormProperties } from "../../types";
import { countryOptions } from "../../utils";

export const TaxResidencyProfile = ({
  fetchCrmObjectProperties,
  context,
  runServerless,
  onClick,
  onBackClick,
}: TaxResidencyProfileProps) => {
  //New
  const [loading, setLoading] = useState(false);
  const [property, setProperties] = useState<Array<TaxResidencyProperties>>([]); //set fetched personal properties
  const [formProperties, setFormProperties] = useState<Array<TaxFormProperties>>([]); //set form properties to update tax residency profile properties on the contact

  // const [ciroToggle, setCiroToggle] = useState('');
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  const [showSin, setShowSin] = useState();
  const [showSsn, setShowSsn] = useState();
  const [showTin, setShowTin] = useState();
  const [showOtherCitizenCountry, setShowOtherCitizenCountry] = useState();
  const [showOtherResidentCountry, setShowOtherResidentCountry] = useState();

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
    // Check to see if user is licensed to toggle if they have view only access or access to edit
    const licensedOwnerId = usersAndOwners[user];
    if (licensedOwnerId) {
      setIsLicensedUser(true);
    }
  });

  const handleBackClick = onBackClick;
  const handleSaveClick = onClick;

  useEffect(() => {
    setLoading(true);
    fetchCrmObjectProperties([
      "canadian_citizen",
      "canadian_resident",
      "sin",
      "us_citizen",
      "us_resident",
      "ssn",
      "other_citizen",
      "resident_of_other_country",
      "country_of_residency",
      "has_tin",
      "tin",
      "reason_for_no_tin",
    ]).then((properties) => {
      setProperties(properties);
      setLoading(false);
    });
  }, [fetchCrmObjectProperties]);

  useEffect(() => {
    // Toggle display of SIN on launch
    if (
      (property.canadian_citizen && property.canadian_citizen === "Yes") ||
      (property.canadian_resident && property.canadian_resident === "Yes")
    ) {
      setShowSin(true);
    }

    // Toggle display of SSN on launch
    if (
      (property.us_citizen && property.us_citizen === "Yes") ||
      (property.us_resident && property.us_resident === "Yes")
    ) {
      setShowSsn(true);
    }

    // Toggle display of TIN on launch
    if (property.resident_of_other_country && property.resident_of_other_country === "Yes") {
      setShowTin(true);
    }

    // Toggle display of other citizen country on launch
    if (property.other_citizen && property.other_citizen === "Yes") {
      setShowOtherCitizenCountry(true);
    }

    // Toggle display of other resident country on launch
    if (property.other_citizen && property.other_citizen === "Yes") {
      setShowOtherResidentCountry(true);
    }
  }, [property]);

  useEffect(() => {
    // TOGGLE SIN NUMBER
    // hide sin if no canadian citizenship and no canadian resident selected
    if (
      formProperties.canadian_citizen &&
      formProperties.canadian_citizen === "No" &&
      formProperties.canadian_resident &&
      formProperties.canadian_resident === "No"
    ) {
      setShowSin(false);
    }

    // show sin if canadian citizenship or canadian resident
    if (
      (formProperties.canadian_citizen && formProperties.canadian_citizen === "Yes") ||
      (formProperties.canadian_resident && formProperties.canadian_resident === "Yes")
    ) {
      setShowSin(true);
    }

    // hide sin if no canadian citizenship and canadian resident is null
    if (
      formProperties.canadian_citizen &&
      formProperties.canadian_citizen === "No" &&
      (formProperties.canadian_resident === null || formProperties.canadian_resident === "")
    ) {
      setShowSin(false);
    }

    // hide ssn if no canadian resident and canadian citizen is null
    if (
      formProperties.canadian_resident &&
      formProperties.canadian_resident === "No" &&
      formProperties.canadian_citizen === null
    ) {
      setShowSin(false);
    }

    // TOGGLE SSN NUMBER
    // hide sin if no us citizenship and no us resident selected
    if (
      formProperties.us_citizen &&
      formProperties.us_citizen === "No" &&
      formProperties.us_resident &&
      formProperties.us_resident === "No"
    ) {
      setShowSsn(false);
    }

    // show ssn if us citizenship or us resident
    if (
      (formProperties.us_citizen && formProperties.us_citizen === "Yes") ||
      (formProperties.us_resident && formProperties.us_resident === "Yes")
    ) {
      setShowSsn(true);
    }

    // hide ssn if no us citizenship and us resident is null
    if (
      formProperties.us_citizen &&
      formProperties.us_citizen === "No" &&
      (formProperties.us_resident === null || formProperties.us_resident === "")
    ) {
      setShowSsn(false);
    }

    // hide ssn if no us resident and us citizen is null
    if (formProperties.us_resident && formProperties.us_resident === "No" && formProperties.us_citizen === null) {
      setShowSsn(false);
    }

    // TOGGLE TIN NUMBER
    // hide tin if no other citizenship and no other resident selected
    if (
      formProperties.other_citizen &&
      formProperties.other_citizen === "No" &&
      formProperties.resident_of_other_country &&
      formProperties.resident_of_other_country === "No"
    ) {
      setShowTin(false);
    }

    // show tin if other resident
    if (formProperties.resident_of_other_country && formProperties.resident_of_other_country === "Yes") {
      setShowTin(true);
    }

    // hide tin if no other citizenship and other resident is null
    if (
      formProperties.other_citizen &&
      formProperties.other_citizen === "No" &&
      (formProperties.resident_of_other_country === null || formProperties.resident_of_other_country === "")
    ) {
      setShowTin(false);
    }

    // hide tin if no other resident and other citizen is null
    if (
      formProperties.resident_of_other_country &&
      formProperties.resident_of_other_country === "No" &&
      formProperties.other_citizen === null
    ) {
      setShowTin(false);
    }

    // hide tin if no other citizen and other resident is null
    if (
      formProperties.resident_of_other_country &&
      formProperties.resident_of_other_country === "No" &&
      (formProperties.other_citizen === null || !formProperties.other_citizen)
    ) {
      setShowTin(false);
    }

    //TOGGLE OTHER CITIZEN COUNTRY
    // show other citizen country if other citizen is selected
    if (formProperties.other_citizen && formProperties.other_citizen === "Yes") {
      setShowOtherCitizenCountry(true);
    }

    // hide other citizen country if other citizen is not selected
    if (formProperties.other_citizen && formProperties.other_citizen === "No") {
      setShowOtherCitizenCountry(false);
    }

    // show other resident country if other resident is selected
    if (formProperties.resident_of_other_country && formProperties.resident_of_other_country === "Yes") {
      setShowOtherResidentCountry(true);
    }

    // hide other resident country if other resident is not selected
    if (formProperties.resident_of_other_country && formProperties.resident_of_other_country === "No") {
      setShowOtherResidentCountry(false);
    }
  }, [formProperties]);

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

  return (
    <>
      <Tile>
        <Flex direction={"column"} gap={"md"}>
          <Heading>Tax Residency Profile</Heading>
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
          <Text format={{ fontWeight: "demibold" }}>Canadian Citizenship and Residency</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="canadian-citizen"
                label={"Canadian Citizen"}
                tooltip="Is the client a Canadian citizen?"
                options={checklistOptions}
                toggleType="radioButtonList"
                inline={true}
                value={formProperties.canadian_citizen ? formProperties.canadian_citizen : property.canadian_citizen}
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties,
                    canadian_citizen: items!,
                    canadian_resident: "",
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {(property.canadian_citizen && property.canadian_citizen === "No") ||
          (formProperties.canadian_citizen && formProperties.canadian_citizen === "No") ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <ToggleGroup
                  name="canadian-resident"
                  label={"Canadian Resident"}
                  tooltip="Is the client a resident of Canada for tax purposes?"
                  options={checklistOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={
                    formProperties.canadian_resident ? formProperties.canadian_resident : property.canadian_resident
                  }
                  onChange={(items) => {
                    setFormProperties({
                      ...formProperties,
                      canadian_resident: items!,
                    });
                  }}
                />
              </Flex>
              <Flex direction={"column"}>
                <Box></Box>
              </Flex>
              <Flex direction={"column"}>
                <Box></Box>
              </Flex>
            </Flex>
          ) : (
            <></>
          )}
          {showSin ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  name="sin"
                  label={"Social Insurance Number (SIN)"}
                  description={"Please provide the client's SIN"}
                  value={formProperties.sin ? formProperties.sin : property.sin}
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      sin: value,
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
          ) : (
            <></>
          )}
          <Divider />
          <Text format={{ fontWeight: "demibold" }}>United States Citizenship and Residency</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="us-citizen"
                label={"US Citizen"}
                tooltip="Is the client a United States citizen?"
                options={checklistOptions}
                toggleType="radioButtonList"
                inline={true}
                value={formProperties.us_citizen ? formProperties.us_citizen : property.us_citizen}
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties,
                    us_citizen: items!,
                    us_resident: "",
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {(property.us_citizen && property.us_citizen === "No") ||
          (formProperties.us_citizen && formProperties.us_citizen === "No") ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <ToggleGroup
                  name="us-resident"
                  label={"US Resident"}
                  tooltip="Is the client a resident of the United States for tax purposes?"
                  options={checklistOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={formProperties.us_resident ? formProperties.us_resident : property.us_resident}
                  onChange={(items) => {
                    setFormProperties({
                      ...formProperties,
                      us_resident: items!,
                    });
                  }}
                />
              </Flex>
              <Flex direction={"column"}>
                <Box></Box>
              </Flex>
              <Flex direction={"column"}>
                <Box></Box>
              </Flex>
            </Flex>
          ) : (
            <></>
          )}
          {showSsn ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  name="sin"
                  label={"Social Security Number (SSN)"}
                  description={"Please provide the client's SSN"}
                  value={formProperties.ssn ? formProperties.ssn : property.ssn}
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      ssn: value,
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
          ) : (
            <></>
          )}
          <Divider />
          <Text format={{ fontWeight: "demibold" }}>Other Citizenship and Residency</Text>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="other-citizen"
                label={"Other Citizenship"}
                tooltip="Is the client a citizen of any country other than Canada or the United States?"
                options={checklistOptions}
                toggleType="radioButtonList"
                inline={true}
                value={formProperties.other_citizen ? formProperties.other_citizen : property.other_citizen}
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties,
                    other_citizen: items!,
                    // us_resident: ''
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {showOtherCitizenCountry ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Select
                  name="other-citizen-country"
                  label={"Country of Citizenship"}
                  placeholder={"Select an option"}
                  description={
                    "Please provide the country of which the client is a citizen other than Canada or the United States"
                  }
                  value={
                    formProperties.country_of_residency
                      ? formProperties.country_of_residency
                      : property.country_of_residency
                  }
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      citizenship: value,
                    });
                  }}
                  options={countryOptions}
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
          ) : (
            <></>
          )}
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Flex direction={"column"}>
              <ToggleGroup
                name="other-resident"
                label={"Other Residency"}
                tooltip="Is the client a resident of the a country other than Canada or the United States for tax purposes?"
                options={checklistOptions}
                toggleType="radioButtonList"
                inline={true}
                value={
                  formProperties.resident_of_other_country
                    ? formProperties.resident_of_other_country
                    : property.resident_of_other_country
                }
                onChange={(items) => {
                  setFormProperties({
                    ...formProperties,
                    resident_of_other_country: items!,
                  });
                }}
              />
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
            <Flex direction={"column"}>
              <Box></Box>
            </Flex>
          </Flex>
          {showOtherResidentCountry ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Select
                  name="other-citizen-resident"
                  label={"Country of Residency"}
                  placeholder={"Select an option"}
                  description={
                    "Please provide the country of which the client is a resident for tax purposes other than Canada or the United States"
                  }
                  value={
                    formProperties.country_of_residency
                      ? formProperties.country_of_residency
                      : property.country_of_residency
                  }
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      country_of_residency: value,
                    });
                  }}
                  options={countryOptions}
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
          ) : (
            <></>
          )}
          {showTin ? (
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"}>
                <Input
                  name="tin"
                  label={"Tax Identification Number (TIN)"}
                  description={"Please provide the client's TIN for the above mentioned country"}
                  value={formProperties.tin ? formProperties.tin : property.tin}
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      tin: value,
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
      {/* <Flex direction={'row'} gap={'md'} justify={'start'}>
        <Button onClick={updateContact} variant={'primary'}>Save</Button>
      </Flex> */}
    </>
  );
};
