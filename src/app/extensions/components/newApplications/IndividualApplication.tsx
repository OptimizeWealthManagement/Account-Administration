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
} from "@hubspot/ui-extensions";
import type {
  IndividualApplicationProps,
  EmploymentProperties,
  AssociatedAccounts,
  AssociationsGQL,
  Accounts,
  AccountArrayProps,
  ApplicationFormProperties,
  ContactKycProperties,
} from "../../types";

export const IndividualApplication = ({
  fetchCrmObjectProperties,
  context,
  onSubmit,
  onCancelClick,
  runServerless,
}: IndividualApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [ticketId, setTicketId] = useState(""); // Set success message for when new account application ticket is created successfully
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [currentSubStep, setCurrentSubStep] = useState(0); // Set current sub-step of multi-step steps
  // const [associatedAccounts, setAssociatedAccounts] = useState<AssociationsGQL>(); // Set fetched associated accounts
  const [accounts, setAccounts] = useState<Array<Accounts>>([]); // Set fetched associated accounts
  const [accountCount, setAccountCount] = useState(0); // Set number of associated accounts
  const [roots, setRoots] = useState<Array<{ label: string; value: string }>>([]); // Set unique roots for fetched associated accounts
  const [selectedCADAccounts, setSelectedCADAccounts] = useState<Array<string>>([]); // Set selected accounts being opened
  const [selectedUSAccounts, setSelectedUSAccounts] = useState<Array<string>>([]); // Set selected accounts being opened
  const [selectedExistingRoot, setSelectedExistingRoot] = useState(""); // Set the selected existing root that the new accounts are being opened under
  const [applicationType, setApplicationType] = useState(""); // Set the application type
  // const disableButton = currentStep === 1 && selectedCADAccounts.length + selectedUSAccounts.length  === 0;
  const [existingCAD, setExistingCAD] = useState<Array<string>>([]); // Set account types of existing accounts of selected root
  const [existingUS, setExistingUS] = useState<Array<string>>([]); // Set account types of existing accounts of selected root
  const [finalCAD, setFinalCAD] = useState<Array<string>>([]); //Set final list of cad accounts to open with this application
  const [finalUS, setFinalUS] = useState<Array<string>>([]); //Set final list of cad accounts to open with this application
  const [confirmation, setConfirmation] = useState(false); // Set confirmation of information for new account application
  const [formProperties, setFormProperties] = useState<Array<ApplicationFormProperties>>([]); // Set form properties for creating new account application ticket
  const [contactKycProperties, setContactKycProperties] = useState<Array<ContactKycProperties>>([]);
  const [nextSteps, setNextSteps] = useState<string>("");
  const [ticketOwner, setTicketOwner] = useState<string>();
  const [associateAdvisingRep, setAssociateAdvisingRep] = useState<string>();
  const [advisingRep, setAdvisingRep] = useState<string>();
  const [assignees, setAssignees] = useState({});

  const handleBackClick = onCancelClick;
  const handleSaveClick = onSubmit;

  useEffect(() => {
    // Fetch personal profile properties
    fetchCrmObjectProperties([
      "investment_knowledge",
      "investment_experience",
      "employment_status",
      "employer_name",
      "occupation",
      "hubspot_owner_id",
      "assigned_pm_test",
      "advising_representative",
      "not_employed_reason",
      "not_employed_reason_other",
      "firstname",
      "middlename",
      "lastname",
      "date_of_birth",
      "phone",
      "mobilephone",
      "email",
      "marital_status_options",
      "number_of_dependants",
      "secondary_first_name",
      "spouse_middle_name",
      "spouse_last_name",
      "address",
      "city",
      "province__state",
      "postal_code___zip_code",
      "country_address",
      "is_this_account_a_pro_account_",
      "is_the_client_considered_a_reporting_insider_",
      "foreign_politically_exposed_person",
      "domestic_politically_exposed_person",
      "head_of_an_international_organization",
      "employment_income",
      "disability_or_ei",
      "company_pension",
      "cpp_income",
      "oas_income",
      "bank_withdrawals",
      "investment_withdrawals",
      "other_income",
      "source_of_other_income",
      "cash",
      "registered_investments",
      "non_registered_investments",
      "fixed_assets",
      "mortgages_and_other_liabilities",
      "other_assets",
      "financial_institution",
      "other_investments",
      "type_of_other_investments",
      "vulnerable_client",
      "trusted_contact_person",
      "trusted_contact_first_name",
      "trusted_contact_last_name",
      "trusted_contact_phone",
      "trusted_contact_email",
      "trusted_contact_address",
      "trusted_contact_city",
      "trusted_contact_province",
      "trusted_contact_postal_code",
      "canadian_citizen",
      "canadian_resident",
      "sin",
      "us_citizen",
      "us_resident",
      "ssn",
      "other_citizen",
      "resident_of_other_country",
      "citizenship",
      "country_of_residency",
      "tin",
      "years_until_retirement",
      "employment_status_spouse",
      "employer_name_spouse",
      "occupation_spouse",
      "not_employed_reason_spouse",
      "not_employed_reason_other_spouse",
      "years_until_retirement_spouse",
      "owner_config",
      "associate_portfolio_manager",
      "portfolio_manager",
      "supervising_portfolio_manager",
      "wealth_planner",
    ]).then((properties) => {
      // setPersonalProperties(properties);

      // Create a copy of properties object to map to contactKycProperties
      let newProperties = { ...properties };

      // Create copy of assignee props to set assignees to formProperties
      const {
        owner_config,
        hubspot_owner_id,
        associate_portfolio_manager,
        portfolio_manager,
        supervising_portfolio_manager,
        wealth_planner,
        assigned_pm_test,
        advising_representative,
      } = properties;

      let updatedAssignees = {};

      if (owner_config === "Config 1") {
        updatedAssignees = {
          owner_config: owner_config,
          hubspot_owner_id: hubspot_owner_id,
          portfolio_manager: portfolio_manager,
        };
      } else if (owner_config === "Config 2") {
        updatedAssignees = {
          owner_config: owner_config,
          hubspot_owner_id: hubspot_owner_id,
          portfolio_manager: portfolio_manager,
          wealth_planner: wealth_planner,
        };
      } else if (owner_config === "Config 3") {
        updatedAssignees = {
          owner_config: owner_config,
          hubspot_owner_id: hubspot_owner_id,
          portfolio_manager: portfolio_manager,
          supervising_portfolio_manager: supervising_portfolio_manager,
          wealth_planner: wealth_planner,
        };
      } else if (owner_config === "Config 4") {
        updatedAssignees = {
          owner_config: owner_config,
          hubspot_owner_id: hubspot_owner_id,
          associate_portfolio_manager: associate_portfolio_manager,
          supervising_portfolio_manager: supervising_portfolio_manager,
          wealth_planner: wealth_planner,
        };
      } else if (owner_config === "Config 5") {
        updatedAssignees = {
          owner_config: owner_config,
          hubspot_owner_id: hubspot_owner_id,
          associate_portfolio_manager: associate_portfolio_manager,
          supervising_portfolio_manager: supervising_portfolio_manager,
        };
      } else {
        updatedAssignees = {
          hubspot_owner_id: hubspot_owner_id,
          associate_portfolio_manager: assigned_pm_test,
          portfolio_manager: advising_representative,
          supervising_portfolio_manager: advising_representative,
        };
      }

      setAssignees((prevProps) => ({
        ...prevProps,
        ...updatedAssignees,
      }));

      // Rename keys
      newProperties.kyc_owner = newProperties.hubspot_owner_id; // Rename KYC Owner
      newProperties.transition_pm = newProperties.assigned_pm_test; // Rename AAR
      newProperties.phone_number = newProperties.phone; // Rename Phone Number
      newProperties.mobile_phone = newProperties.mobilephone; // Rename Mobile Phone Number
      newProperties.street_address = newProperties.address; // Rename Street Address
      newProperties.province___state = newProperties.province__state; // Rename Province
      newProperties.middle_name = newProperties.middlename; // Rename Middle Name

      // Delete old keys
      delete newProperties.hubspot_owner_id; // Delete Contact Owner
      delete newProperties.assigned_pm_test; // Delete Contact AAR
      delete newProperties.phone; // Delete Contact Phone
      delete newProperties.mobilephone; // Delete Contact Mobile
      delete newProperties.address; // Delete Contact Street
      delete newProperties.province__state; // Delete Contact Province
      delete newProperties.middlename; // Delete Contact Province
      delete newProperties.sin;
      delete newProperties.ssn;
      delete newProperties.tin;

      // Delete owner and assignee props
      delete newProperties.owner_config;
      delete newProperties.associate_portfolio_manager;
      delete newProperties.portfolio_manager;
      delete newProperties.supervising_portfolio_manager;
      delete newProperties.wealth_planner;

      setContactKycProperties(newProperties);
      setTicketOwner(newProperties.kyc_owner);
      setAssociateAdvisingRep(newProperties.transition_pm);
      setAdvisingRep(newProperties.advising_representative);
    });
  }, []);

  useEffect(() => {
    setAccounts([]);
    setAccountCount([]);
    setRoots([]);
    setSelectedCADAccounts([]);
    setSelectedUSAccounts([]);
    setSelectedExistingRoot([]);
    setExistingCAD([]);
    setExistingUS([]);
    setLoading(true);
    runServerless({
      name: "fetchAssociations",
      propertiesToSend: ["hs_object_id"],
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          // Set associations of individually held accounts with response data
          const accountObject =
            resp.response.data.CRM.contact.associations.p_account_object_collection__individual_account.items.map(
              (object) => {
                return object as Accounts;
              }
            );
          const accountObjectCount =
            resp.response.data.CRM.contact.associations.p_account_object_collection__individual_account.total;
          setAccounts(accountObject);
          setAccountCount(accountObjectCount);
          setFormProperties({
            ...formProperties, // copy current form properties
            application_type: "Individual", // update property with value
            hs_pipeline: "50936872",
            hs_pipeline_stage: "103949234",
            subject: "New account application",
          });
        } else {
          setError(resp.message); // Set error message from response
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const submitApplication = () => {
    setLoading(true);
    runServerless({
      name: "newAccountApplication",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, contactKycProperties }, // Send form properties as parameters
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        const id = resp.response;
        handleSaveClick();
      } else {
        setError(resp.message); // Set error message from response
      }
    });
  };

  // Set the unique root numbers of the individually held accounts that the client has opened
  useEffect(() => {
    const uniqueRootNumbers = Array.from(new Set(accounts.map((account) => account.account_number.substring(0, 6))));
    const rootObjects = uniqueRootNumbers.map((item) => ({ label: item, value: item }));
    setRoots(rootObjects);
  }, [accounts]);

  // Function to get the existing cad and us account types based on the selected Root if the client is opening a new account under and existing root
  const getExistingAcccounts = useCallback((selectedRoot: string) => {
    const filteredCAD = accounts.filter(
      (account) => account.account_number.startsWith(selectedRoot) && account.currency.label === "CAD"
    );
    const filteredUS = accounts.filter(
      (account) => account.account_number.startsWith(selectedRoot) && account.currency.label === "USD"
    );

    const accountTypesCAD = filteredCAD.map((account) => account.account_type.label);
    const accountTypesUS = filteredUS.map((account) => account.account_type.label);

    setExistingCAD(accountTypesCAD);
    setExistingUS(accountTypesUS);
  });

  // All available options for Canadian Accounts
  const cadOptions = [
    "Cash",
    "RRSP",
    "Spousal RSP",
    "TFSA",
    "RIF",
    "Spousal RIF",
    "LIRA",
    "LRSP",
    "RLSP",
    "LIF",
    "LRIF",
    "RLIF",
    "PRIF",
    "RESP",
    "RDSP",
    "In Trust",
    "FHSA",
  ].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: n === "In Trust" ? "For minors" : "",
  }));

  // All available options for US Accounts
  const usOptions = ["Cash", "RRSP", "Spousal RSP", "TFSA", "RIF", "LIRA", "LRSP", "RLSP", "In Trust"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: n === "In Trust" ? "For minors" : "",
  }));

  // Update available account options for Canadian Accounts when opening a new account for a client under an existing root
  const availableCADOptions = cadOptions.map((option) => {
    if (existingCAD.includes(option.value)) {
      return {
        ...option,
        readonly: true,
        description: "Already opened under this root",
      };
    }

    if (
      (option.value === "Cash" || option.value === "TFSA") &&
      contactKycProperties?.["country_address"] !== "Canada"
    ) {
      return {
        ...option,
        readonly: true,
        description: "TFSA & Cash is only available for Canadian or US residents",
      };
    }

    if (option.value === "LRSP" && (existingCAD.includes("LIRA") || existingCAD.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LRSP" && (selectedCADAccounts.includes("LIRA") || selectedCADAccounts.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LIRA" && (existingCAD.includes("LRSP") || existingCAD.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LIRA" && (selectedCADAccounts.includes("LRSP") || selectedCADAccounts.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "RLSP" && (existingCAD.includes("LRSP") || existingCAD.includes("LIRA"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "RLSP" && (selectedCADAccounts.includes("LRSP") || selectedCADAccounts.includes("LIRA"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "LIF" &&
      (existingCAD.includes("LRIF") || existingCAD.includes("RLIF") || existingCAD.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "LIF" &&
      (selectedCADAccounts.includes("LRIF") ||
        selectedCADAccounts.includes("RLIF") ||
        selectedCADAccounts.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "LRIF" &&
      (existingCAD.includes("LIF") || existingCAD.includes("RLIF") || existingCAD.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "LRIF" &&
      (selectedCADAccounts.includes("LIF") ||
        selectedCADAccounts.includes("RLIF") ||
        selectedCADAccounts.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "RLIF" &&
      (existingCAD.includes("LIF") || existingCAD.includes("LRIF") || existingCAD.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "RLIF" &&
      (selectedCADAccounts.includes("LIF") ||
        selectedCADAccounts.includes("LRIF") ||
        selectedCADAccounts.includes("PRIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "PRIF" &&
      (existingCAD.includes("LIF") || existingCAD.includes("LRIF") || existingCAD.includes("RLIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value === "PRIF" &&
      (selectedCADAccounts.includes("LIF") ||
        selectedCADAccounts.includes("LRIF") ||
        selectedCADAccounts.includes("RLIF"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "In Trust") {
      if (existingCAD.length > 0 || existingUS.length > 0) {
        return {
          ...option,
          readonly: true,
        };
      } else if (
        selectedCADAccounts.some((account) => account !== "In Trust") ||
        selectedUSAccounts.some((account) => account !== "In Trust")
      ) {
        return {
          ...option,
          readonly: true,
        };
      }
    }

    if (option.value !== "In Trust" && (existingCAD.includes("In Trust") || existingUS.includes("In Trust"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value !== "In Trust" &&
      (selectedCADAccounts.includes("In Trust") || selectedUSAccounts.includes("In Trust"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    // if (option.value === 'FHSA') {
    //   return {
    //     ...option,
    //     readonly: true,
    //     description: 'Coming soon'
    //   };
    // }

    return option;
  });

  // Get a final array of canadian accounts being opened on this application
  const getCADAccountsToOpen = useCallback(() => {
    const finalCADAccounts = selectedCADAccounts.map((item) => ({
      label: item,
      value: item,
      initialIsChecked: true,
      readonly: true,
    }));
    const finalUSAccounts = selectedUSAccounts.map((item) => ({
      label: item,
      value: item,
      initialIsChecked: true,
    }));

    return finalCADAccounts;
  });

  // Get a final array of us accounts being opened on this application
  const getUSAccountsToOpen = useCallback(() => {
    const finalUSAccounts = selectedUSAccounts.map((item) => ({
      label: item,
      value: item,
      initialIsChecked: true,
      readonly: true,
    }));

    return finalUSAccounts;
  });

  // Update available account options for US Accounts when opening a new account for a client under an existing root
  const availableUSOptions = usOptions.map((option) => {
    if (existingUS.includes(option.value)) {
      return {
        ...option,
        readonly: true,
        description: "Already opened under this root",
      };
    }
    if (
      (option.value === "Cash" || option.value === "TFSA") &&
      contactKycProperties?.["country_address"] !== "Canada"
    ) {
      return {
        ...option,
        readonly: true,
        description: "TFSA & Cash is only available for Canadian or US residents",
      };
    }

    if (option.value === "LRSP" && (existingUS.includes("LIRA") || existingUS.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LRSP" && (selectedUSAccounts.includes("LIRA") || selectedUSAccounts.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LIRA" && (existingUS.includes("LRSP") || existingUS.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "LIRA" && (selectedUSAccounts.includes("LRSP") || selectedUSAccounts.includes("RLSP"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "RLSP" && (existingUS.includes("LRSP") || existingUS.includes("LIRA"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "RLSP" && (selectedUSAccounts.includes("LRSP") || selectedUSAccounts.includes("LIRA"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (option.value === "In Trust") {
      if (existingCAD.length > 0 || existingUS.length > 0) {
        return {
          ...option,
          readonly: true,
        };
      } else if (
        selectedCADAccounts.some((account) => account !== "In Trust") ||
        selectedUSAccounts.some((account) => account !== "In Trust")
      ) {
        return {
          ...option,
          readonly: true,
        };
      }
    }

    if (option.value !== "In Trust" && (existingCAD.includes("In Trust") || existingUS.includes("In Trust"))) {
      return {
        ...option,
        readonly: true,
      };
    }

    if (
      option.value !== "In Trust" &&
      (selectedCADAccounts.includes("In Trust") || selectedUSAccounts.includes("In Trust"))
    ) {
      return {
        ...option,
        readonly: true,
      };
    }

    // if (option.value === 'FHSA') {
    //   return {
    //     ...option,
    //     readonly: true,
    //     description: 'Coming soon'
    //   };
    // }

    return option;
  });

  // Options for opening a new account under an existing root or new accounts under a new root
  const typeOptions = ["New Root", "Existing Root"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description:
      n === "New Root"
        ? "Select to open a new set of accounts under a different root"
        : "Select to open one or more new accounts under the same root of existing accounts",
  }));

  // Options for opening a new account under an existing root or new accounts under a new root when the client does not have any existing accounts
  const typeOptionsNoAccount = ["New Root", "Existing Root"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: n === "Existing Root",
    description:
      n === "New Root"
        ? "Select to open a new set of accounts under a different root"
        : "Select to open one or more new accounts under the same root of existing accounts",
  }));

  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  const renderExistingAccounts = () => {
    if (currentStep === 0) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Box flex={1}>
                    <Heading>Are you opening new accounts under an existing account root?</Heading>
                  </Box>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="application-type"
                    label="Application Type"
                    options={typeOptions}
                    toggleType="radioButtonList"
                    onChange={(items) => {
                      setApplicationType(items!);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        new_or_existing_client_id: items!, // update property with value
                      });
                    }}
                    value={applicationType}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  <Button
                    onClick={() => {
                      if (applicationType === "New Root") {
                        setCurrentStep(currentStep + 2);
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={applicationType.length === 0}
                  >
                    {"Next >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 1) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>Select an existing account root.</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Select
                    label="Existing roots"
                    name="existing-roots"
                    placeholder="Please choose"
                    options={roots}
                    // onChange={value => {
                    //   getExistingAcccounts(value);
                    //   setSelectedExistingRoot(value);
                    // }}
                    onChange={(value) => {
                      getExistingAcccounts(value);
                      setSelectedExistingRoot(value);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        root: value, // update property with value
                      });
                    }}
                    value={selectedExistingRoot}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  <Button
                    onClick={() => {
                      getExistingAcccounts(selectedExistingRoot);
                      setCurrentStep(currentStep + 1);
                    }}
                    disabled={selectedExistingRoot.length === 0}
                  >
                    {"Next >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 2) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>What types of accounts are you opening?</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"row"} gap={"flush"} justify={"start"}>
                  <ToggleGroup
                    name="cad-accounts"
                    label="Accounts (CAD)"
                    options={selectedExistingRoot ? availableCADOptions : cadOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    // onChange={items => setSelectedCADAccounts(items!)}
                    onChange={(items) => {
                      setSelectedCADAccounts(items!);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        account_type_cad: String(items!.join(";")), // update property with value
                      });
                    }}
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"row"} gap={"flush"} justify={"end"}>
                  <ToggleGroup
                    name="us-accounts"
                    label="Accounts (US)"
                    options={selectedExistingRoot ? availableUSOptions : usOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    onChange={(items) => {
                      setSelectedUSAccounts(items!);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        account_type_us: String(items!.join(";")), // update property with value
                      });
                    }}
                    value={selectedUSAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button
                    onClick={() => {
                      // setSelectedExistingRoot('');
                      if (applicationType === "Existing Root") {
                        setSelectedExistingRoot("");
                        setSelectedCADAccounts([]);
                        setSelectedUSAccounts([]);
                        setCurrentStep(currentStep - 1);
                      } else {
                        setSelectedExistingRoot("");
                        setSelectedCADAccounts([]);
                        setSelectedUSAccounts([]);
                        setCurrentStep(currentStep - 2);
                      }
                    }}
                    disabled={currentStep === 0}
                  >
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  <Button
                    onClick={() => {
                      // const {finalCAD, finalUS} = getAccountsToOpen();
                      setCurrentStep(currentStep + 1);
                    }}
                  >
                    {"Next >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 3 && applicationType === "Existing Root") {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>A few final details</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Select
                    label="Root Account"
                    name="root-account"
                    description="The accounts listed below will be opened under the following root of existing accounts"
                    readOnly={true}
                    options={[{ label: selectedExistingRoot, value: selectedExistingRoot }]}
                    value={selectedExistingRoot}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"} gap={"flush"} justify={"start"}>
                  <ToggleGroup
                    name="cad-accounts-to-open"
                    label="Canadian Accounts"
                    options={getCADAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="us-accounts-to-open"
                    label="US Accounts"
                    options={getUSAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedUSAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="application-confirmation"
                    label=""
                    options={[
                      {
                        label:
                          "* I confirm that the client is expecting to have the above accounts opened under the existing account root displayed above. This new account application is as a result of a discussion with the client where we discussed their desire to open these accounts.",
                        value: true,
                      },
                    ]}
                    // onChange={items => setConfirmation(true)}
                    onChange={(items) => {
                      setConfirmation(true);
                      setFormProperties({
                        ...formProperties,
                        hubspot_owner_id: ticketOwner,
                        transition_pm: associateAdvisingRep,
                        advising_representative: advisingRep,
                        ...assignees,
                      });
                    }}
                    toggleType="checkboxList"
                    required={true}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button
                    onClick={() => {
                      setConfirmation(false);
                      setCurrentStep(currentStep - 1);
                    }}
                    disabled={currentStep === 0}
                  >
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  {/* <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!confirmation}>
                    {"Submit >"}
                  </Button> */}
                  <Button onClick={submitApplication} disabled={!confirmation}>
                    {"Submit >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 3) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>A few final details</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"} gap={"flush"} justify={"start"}>
                  <ToggleGroup
                    name="cad-accounts-to-open"
                    label="Canadian Accounts"
                    options={getCADAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="us-accounts-to-open"
                    label="US Accounts"
                    options={getUSAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedUSAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="application-confirmation"
                    label=""
                    options={[
                      {
                        label:
                          "* I confirm that the client is expecting to have the above accounts opened under a new account root displayed above. This new account application is as a result of a discussion with the client where we discussed their desire to open these accounts.",
                        value: true,
                      },
                    ]}
                    onChange={(items) => {
                      setConfirmation(true);
                      setFormProperties({
                        ...formProperties,
                        hubspot_owner_id: ticketOwner,
                        transition_pm: associateAdvisingRep,
                        advising_representative: advisingRep,
                        ...assignees,
                      });
                    }}
                    toggleType="checkboxList"
                    required={true}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button
                    onClick={() => {
                      setConfirmation(false);
                      setCurrentStep(currentStep - 1);
                    }}
                    disabled={currentStep === 0}
                  >
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  {/* <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!confirmation}>
                    {"Submit >"}
                  </Button> */}
                  <Button onClick={submitApplication} disabled={!confirmation}>
                    {"Submit >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    }
  };

  const renderNoExistingAccounts = () => {
    if (currentStep === 0) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>What types of accounts are you opening?</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"row"} gap={"flush"} justify={"start"}>
                  <ToggleGroup
                    name="cad-accounts"
                    label="Accounts (CAD)"
                    options={availableCADOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    // onChange={items => setSelectedCADAccounts(items!)}
                    onChange={(items) => {
                      setSelectedCADAccounts(items!);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        account_type_cad: String(items!.join(";")), // update property with value
                        new_or_existing_client_id: "New Root", // update property with value
                      });
                    }}
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"row"} gap={"flush"} justify={"end"}>
                  <ToggleGroup
                    name="us-accounts"
                    label="Accounts (US)"
                    options={availableUSOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    onChange={(items) => {
                      setSelectedUSAccounts(items!);
                      setFormProperties({
                        ...formProperties, // copy current form properties
                        account_type_us: String(items!.join(";")), // update property with value
                        new_or_existing_client_id: "New Root", // update property with value
                      });
                    }}
                    value={selectedUSAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button
                    onClick={() => {
                      setApplicationType("");
                      setSelectedCADAccounts([]);
                      setSelectedUSAccounts([]);
                      setCurrentStep(currentStep - 1);
                    }}
                    disabled={currentStep === 0}
                  >
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  <Button
                    onClick={() => {
                      setApplicationType("New Root");
                      setCurrentStep(currentStep + 1);
                    }}
                  >
                    {"Next >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 1) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator currentStep={currentStep} stepNames={["Accounts", "Details"]} circleSize={"extra-small"} />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>A few final details</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"} gap={"flush"} justify={"start"}>
                  <ToggleGroup
                    name="cad-accounts-to-open"
                    label="Canadian Accounts"
                    options={getCADAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="us-accounts-to-open"
                    label="US Accounts"
                    options={getUSAccountsToOpen()}
                    toggleType="checkboxList"
                    inline={true}
                    variant="default"
                    value={selectedUSAccounts}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <ToggleGroup
                    name="application-confirmation"
                    label=""
                    options={[
                      {
                        label:
                          "* I confirm that the client is expecting to have the above accounts opened under a new account root. This new account application is as a result of a discussion with the client where we discussed their desire to open these accounts.",
                        value: true,
                      },
                    ]}
                    onChange={(items) => {
                      setConfirmation(true);
                      setFormProperties({
                        ...formProperties,
                        hubspot_owner_id: ticketOwner,
                        transition_pm: associateAdvisingRep,
                        advising_representative: advisingRep,
                        ...assignees,
                      });
                    }}
                    toggleType="checkboxList"
                    required={true}
                  />
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Button
                    onClick={() => {
                      setConfirmation(false);
                      setCurrentStep(currentStep - 1);
                    }}
                    disabled={currentStep === 0}
                  >
                    {"< Back"}
                  </Button>
                  <Button onClick={handleBackClick} variant="destructive">
                    Cancel
                  </Button>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"end"}>
                  <Button onClick={submitApplication} disabled={!confirmation}>
                    {"Submit >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    }
  };

  return <>{accounts.length > 0 ? renderExistingAccounts() : renderNoExistingAccounts()}</>;
};
