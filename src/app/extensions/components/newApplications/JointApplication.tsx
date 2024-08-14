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
  JointApplicationProps,
  EmploymentProperties,
  AssociatedAccounts,
  AssociationsGQL,
  Accounts,
  AccountArrayProps,
  Contacts,
  ApplicationFormProperties,
  JointContactKycProperties,
  JointAccounts,
} from "../../types";

export const JointApplication = ({
  fetchCrmObjectProperties,
  context,
  onSubmit,
  onCancelClick,
  runServerless,
}: JointApplicationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [currentSubStep, setCurrentSubStep] = useState(0); // Set current sub-step of multi-step steps
  // const [associatedAccounts, setAssociatedAccounts] = useState<AssociationsGQL>(); // Set fetched associated accounts
  const [accounts, setAccounts] = useState<Array<Accounts>>([]); // Set fetched associated accounts
  // const [accounts, setAccounts] = useState<Array<JointAccounts>>([]); // Set fetched associated accounts
  const [accountCount, setAccountCount] = useState(0); // Set number of associated accounts
  const [roots, setRoots] = useState<Array<{ label: string; value: string }>>([]); // Set unique roots for fetched associated accounts
  const [selectedCADAccounts, setSelectedCADAccounts] = useState<Array<string>>([]); // Set selected accounts being opened
  const [selectedUSAccounts, setSelectedUSAccounts] = useState<Array<string>>([]); // Set selected accounts being opened
  const [selectedExistingRoot, setSelectedExistingRoot] = useState(""); // Set the selected existing root that the new accounts are being opened under
  const [applicationType, setApplicationType] = useState(""); // Set the application type
  const [formProperties, setFormProperties] = useState<Array<ApplicationFormProperties>>([]);
  const [ticketOwner, setTicketOwner] = useState<string>();
  const [associateAdvisingRep, setAssociateAdvisingRep] = useState<string>();
  const [advisingRep, setAdvisingRep] = useState<string>();
  const [assignees, setAssignees] = useState({});

  // Contact associations
  const [associatedContacts, setAssociatedContacts] = useState<Array<Contacts>>([]); // Set fetched associated contacts
  // const [jointAccountHolder, setJointAccountHolder] = useState<Array<Contacts>>([]); // Set fetched associated contacts
  const [associatedContactCount, setAssociatedContactCount] = useState<number>(0); // Set number of fetched associated contacts
  const [selectedContactId, setSelectedContactId] = useState<number>(); // set hs object id for selected associated contact
  const [associationError, setAssociationError] = useState(false);
  const [associationErrorValidation, setAssociationErrorValidation] = useState("");

  // const disableButton = currentStep === 1 && selectedCADAccounts.length + selectedUSAccounts.length  === 0;
  const [existingCAD, setExistingCAD] = useState<Array<string>>([]); // Set account types of existing accounts of selected root
  const [existingUS, setExistingUS] = useState<Array<string>>([]); // Set account types of existing accounts of selected root
  const [finalCAD, setFinalCAD] = useState<Array<string>>([]); //Set final list of cad accounts to open with this application
  const [finalUS, setFinalUS] = useState<Array<string>>([]); //Set final list of cad accounts to open with this application
  const [confirmation, setConfirmation] = useState(false); // Set confirmation of information for new account application
  const [contactKycProperties, setContactKycProperties] = useState<Array<JointContactKycProperties>>([]);

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
      delete newProperties.middlename; // Delete Contact Middle Name
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
    // Request association data from serverless function
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
      name: "fetchJointAssociations",
      propertiesToSend: ["hs_object_id"],
    })
      .then((resp) => {
        // setLoading(false); // End loading state
        console.log(resp);
        if (resp.status === "SUCCESS") {
          // Set associations of jointly held accounts with response data
          const accountObject =
            resp.response.data.CRM.contact.associations.p_account_object_collection__joint_account.items.map(
              (object) => {
                return object as Accounts;
              }
            );

          const accountObjectCount =
            resp.response.data.CRM.contact.associations.p_account_object_collection__joint_account.total;
          setAccounts(accountObject);
          setAccountCount(accountObjectCount);
          setFormProperties({
            ...formProperties, // copy current form properties
            application_type: "Joint", // update property with value
            hs_pipeline: "50936872",
            hs_pipeline_stage: "103949234",
            subject: "New joint account application",
          });

          // Set associations of contacts with response data
          const contactObject =
            resp.response.data.CRM.contact.associations.contact_collection__contact_to_contact.items.map((object) => {
              return object as Contacts;
            });
          const contactObjectCount =
            resp.response.data.CRM.contact.associations.contact_collection__contact_to_contact.total;

          setError(contactObjectCount === 0);
          setAssociatedContacts(contactObject);
          setAssociatedContactCount(contactObjectCount);
        } else {
          setError(resp.message); // Set error message from response
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Dependency array is empty, so this effect runs only once

  // Set the unique root numbers of the individually held accounts that the client has opened
  useEffect(() => {
    const uniqueRootNumbers = Array.from(new Set(accounts.map((account) => account.account_number.substring(0, 6))));
    const rootObjects = uniqueRootNumbers.map((item) => ({ label: item, value: item }));
    setRoots(rootObjects);
  }, [accounts]);

  const contactOptions = associatedContacts.map((obj) => {
    return {
      label: `${obj.firstname} ${obj.lastname}`,
      value: obj.hs_object_id,
    };
  });

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

  // Small utility function for help below
  const getSelectedContact = (id?: number) => {
    return associatedContacts.find((c) => c.hs_object_id === id);
  };

  const selectedContact = getSelectedContact(selectedContactId);

  const handleSelectedContact = (contactId: number) => {
    setSelectedContactId(contactId);
  };

  useEffect(() => {
    if (selectedContact) {
      const transformedObj = Object.fromEntries(
        Object.entries(selectedContact).map(([key, value]) => {
          if (value && typeof value === "object" && "label" in value) {
            return [key, value.label];
          }

          if (Array.isArray(value) && value.every((item) => item.label)) {
            return [key, value.map((item) => item.label).join(";")];
          }

          return [key, value];
        })
      );

      // Make a shallow copy of the transformed object
      const modifiedObj = { ...transformedObj };

      // Conditionally delete keys
      if (modifiedObj.phone !== null && modifiedObj.mobilephone === null) {
        delete modifiedObj.mobilephone;
      } else if (modifiedObj.phone === null && modifiedObj.mobilephone !== null) {
        delete modifiedObj.phone;
      }

      // marital status
      if (
        modifiedObj.marital_status_options === "Single" ||
        modifiedObj.marital_status_options === "Divorced" ||
        modifiedObj.marital_status_options === "Widowed"
      ) {
        delete modifiedObj.secondary_first_name; // delete spouse firstname
        delete modifiedObj.spouse_middle_name; // delete spouse middlename
        delete modifiedObj.spouse_last_name; // delete spouse lastname
        delete modifiedObj.employment_status_spouse; // delete spouse lastname
        delete modifiedObj.employer_name_spouse; // delete spouse lastname
        delete modifiedObj.occupation_spouse; // delete spouse lastname
        delete modifiedObj.not_employed_reason_spouse; // delete spouse lastname
        delete modifiedObj.not_employed_reason_other_spouse; // delete spouse lastname
        delete modifiedObj.years_until_retirement_spouse; // delete spouse lastname
      }

      // employment status
      if (modifiedObj.employment_status === "Not Employed" && modifiedObj.not_employed_reason === "Other") {
        delete modifiedObj.employer_name;
        delete modifiedObj.occupation;
      } else if (modifiedObj.employment_status === "Not Employed") {
        delete modifiedObj.employer_name;
        delete modifiedObj.occupation;
        delete modifiedObj.not_employed_reason_other;
      } else {
        delete modifiedObj.not_employed_reason;
        delete modifiedObj.not_employed_reason_other;
      }

      if (modifiedObj.employment_status === "Retired" || modifiedObj.employment_status === "Not Employed") {
        delete modifiedObj.years_until_retirement;
      }

      // employment status spouse
      if (
        modifiedObj.employment_status_spouse === "Not Employed" &&
        modifiedObj.not_employed_reason_spouse === "Other"
      ) {
        delete modifiedObj.employer_name_spouse;
        delete modifiedObj.occupation_spouse;
      } else if (modifiedObj.employment_status_spouse === "Not Employed") {
        delete modifiedObj.employer_name_spouse;
        delete modifiedObj.occupation_spouse;
        delete modifiedObj.not_employed_reason_other_spouse;
      } else {
        delete modifiedObj.not_employed_reason_spouse;
        delete modifiedObj.not_employed_reason_other_spouse;
      }

      if (
        modifiedObj.employment_status_spouse === "Retired" ||
        modifiedObj.employment_status_spouse === "Not Employed"
      ) {
        delete modifiedObj.years_until_retirement_spouse;
      }

      // pro account
      if (modifiedObj.is_this_account_a_pro_account_ === "No") {
        delete modifiedObj.name_of_individual_cro;
        delete modifiedObj.employer_name_cro;
      }

      // reporting insider
      if (modifiedObj.is_the_client_considered_a_reporting_insider_ === "No") {
        delete modifiedObj.reporting_insider_company;
        delete modifiedObj.reporting_insider_symbol;
      }

      // foreign PEP
      if (modifiedObj.foreign_politically_exposed_person === "No") {
        delete modifiedObj.name_of_foreign_pep;
        delete modifiedObj.relationship_to_pep_foreign;
        delete modifiedObj.wealth_pep_foreign;
      }

      // other income source
      if (modifiedObj.other_income === 0 || modifiedObj.other_income === "0") {
        delete modifiedObj.source_of_other_income;
      }

      // other assets props if "Yes"
      if (modifiedObj.other_assets === "No") {
        delete modifiedObj.financial_institution;
        delete modifiedObj.type_of_other_investments;
        delete modifiedObj.other_investments;
      }

      // domestic PEP
      if (modifiedObj.domestic_politically_exposed_person === "No") {
        delete modifiedObj.name_of_domestic_pep;
        delete modifiedObj.relationship_to_pep_domestic;
        delete modifiedObj.wealth_pep_domestic;
      }

      // HIO
      if (modifiedObj.head_of_an_international_organization === "No") {
        delete modifiedObj.name_of_international_organization;
        delete modifiedObj.relationship_to_international_organization;
        delete modifiedObj.wealth_international_organization;
      }

      // TCP
      if (modifiedObj.trusted_contact_person === "No") {
        delete modifiedObj.trusted_contact_first_name;
        delete modifiedObj.trusted_contact_last_name;
        delete modifiedObj.trusted_contact_phone;
        delete modifiedObj.trusted_contact_email;
        delete modifiedObj.trusted_contact_address;
        delete modifiedObj.trusted_contact_city;
        delete modifiedObj.trusted_contact_province;
        delete modifiedObj.trusted_contact_postal_code;
      }

      // Canadian Citizenship
      if (modifiedObj.canadian_citizen === "Yes") {
        delete modifiedObj.canadian_resident;
      } else if (modifiedObj.canadian_citizen === "No" && modifiedObj.canadian_resident === "No") {
        // delete modifiedObj.sin;
      }
      delete modifiedObj.sin;

      // // US Citizenship
      // if (modifiedObj.us_citizen === "No") {
      //   delete modifiedObj.ssn;
      // }
      delete modifiedObj.ssn;

      // Other Citizenship
      if (modifiedObj.other_citizen === "No") {
        delete modifiedObj.citizenship;
      }

      // Other Residency
      if (modifiedObj.resident_of_other_country === "No") {
        delete modifiedObj.country_of_residency;
        // delete modifiedObj.tin;
      }
      delete modifiedObj.tin;

      // Check for null values in the transformedObj
      for (const [key, value] of Object.entries(modifiedObj)) {
        if (value === null) {
          setAssociationError(true);
          setAssociationErrorValidation(
            "This contact's client profile is incomeplete. Please fill out all missing properties before continuing."
          );
          return; // Exit the function once you find a null value
        }
      }

      setAssociationError(false); // Reset to false if all values are non-null
      setAssociationErrorValidation("");
    }
  }, [selectedContactId]);

  useEffect(() => {
    if (selectedContact && currentStep === 3) {
      const transformedObj = Object.fromEntries(
        Object.entries(selectedContact).map(([key, value]) => {
          if (value && typeof value === "object" && "label" in value) {
            return [key, value.label];
          }

          if (Array.isArray(value) && value.every((item) => item.label)) {
            return [key, value.map((item) => item.label).join(";")];
          }

          return [key, value];
        })
      );

      setContactKycProperties({
        ...contactKycProperties,
        investment_knowledge__secondary_account_holder_: transformedObj.investment_knowledge,
        investment_experience__secondary_account_holder_: transformedObj.investment_experience,
        employment_status__secondary_account_holder_: transformedObj.employment_status,
        employer_name__secondary_account_holder_: transformedObj.employer_name,
        occupation__secondary_account_holder_: transformedObj.occupation,
        not_employed_reason_secondary: transformedObj.not_employed_reason,
        not_employed_reason_other_secondary: transformedObj.not_employed_reason_other,
        firstname_secondary: transformedObj.firstname,
        lastname_secondary: transformedObj.lastname,
        date_of_birth__secondary_account_holder_: transformedObj.date_of_birth,
        phone_number__secondary_account_holder_: transformedObj.phone,
        mobile_phone_number__secondary_account_holder_: transformedObj.mobilephone,
        email__secondary_account_holder_: transformedObj.email,
        marital_status_options_secondary: transformedObj.marital_status_options,
        number_of_dependants__secondary_account_holder_: transformedObj.number_of_dependants,
        spouse_first_name_secondary: transformedObj.secondary_first_name,
        spouse_last_name_secondary: transformedObj.spouse_last_name,
        street_address__secondary_account_holder_: transformedObj.address,
        city__secondary_account_holder_: transformedObj.city,
        province___state__secondary_account_holder_: transformedObj.province__state,
        postal_code___zip_code__secondary_account_holder_: transformedObj.postal_code___zip_code,
        country__secondary_account_holder_: transformedObj.country_address,
        is_this_account_a_pro_account___secondary_account_holder_: transformedObj.is_this_account_a_pro_account_,
        is_the_client_considered_a_reporting_insider___secondary_account_holder_:
          transformedObj.is_the_client_considered_a_reporting_insider_,
        foreign_politically_exposed_person__secondary_account_holder_:
          transformedObj.foreign_politically_exposed_person,
        domestic_politically_exposed_person__secondary_account_holder_:
          transformedObj.domestic_politically_exposed_person,
        head_of_an_international_organization__secondary_account_holder_:
          transformedObj.head_of_an_international_organization,
        employment_income_secondary: transformedObj.employment_income,
        disability_or_ei_secondary: transformedObj.disability_or_ei,
        company_pension_secondary: transformedObj.company_pension,
        cpp_income_secondary: transformedObj.cpp_income,
        oas_income_secondary: transformedObj.oas_income,
        bank_withdrawals_secondary: transformedObj.bank_withdrawals,
        investment_withdrawals_secondary: transformedObj.investment_withdrawals,
        other_income__secondary_account_holder_: transformedObj.other_income,
        source_of_other_income__secondary_account_holder_: transformedObj.source_of_other_income,
        cash_secondary: transformedObj.cash,
        registered_investments__secondary_account_holder_: transformedObj.registered_investments,
        non_registered_investments__secondary_account_holder_: transformedObj.non_registered_investments,
        fixed_assets_secondary: transformedObj.fixed_assets,
        mortgages_and_other_liabilities_secondary: transformedObj.mortgages_and_other_liabilities,
        other_assets__secondary_account_holder_: transformedObj.other_assets,
        financial_institution__secondary_account_holder_: transformedObj.financial_institution,
        type_of_other_investments__secondary_account_holder_: transformedObj.type_of_other_investments,
        other_investments__secondary_account_holder_: transformedObj.other_investments,
        vulnerable_client: transformedObj.vulnerable_client_,
        trusted_contact_person_secondary: transformedObj.trusted_contact_person,
        trusted_contact_first_name_secondary: transformedObj.trusted_contact_first_name,
        trusted_contact_last_name_secondary: transformedObj.trusted_contact_last_name,
        trusted_contact_phone_secondary: transformedObj.trusted_contact_phone,
        trusted_contact_email_secondary: transformedObj.trusted_contact_email,
        trusted_contact_address_secondary: transformedObj.trusted_contact_address,
        trusted_contact_city_secondary: transformedObj.trusted_contact_city,
        trusted_contact_province_secondary: transformedObj.trusted_contact_province,
        trusted_contact_postal_code_secondary: transformedObj.trusted_contact_postal_code,
        canadian_citizen_secondary: transformedObj.canadian_citizen,
        canadian_resident_secondary: transformedObj.canadian_resident,
        // sin__secondary_account_holder_: transformedObj.sin,
        us_citizen_secondary: transformedObj.us_citizen,
        us_resident_secondary: transformedObj.us_resident,
        ssn_secondary: transformedObj.ssn,
        other_citizen_secondary: transformedObj.other_citizen,
        other_resident_secondary: transformedObj.resident_of_other_country,
        citizenship__secondary_account_holder_: transformedObj.citizenship,
        country_of_residency_secondary: transformedObj.country_of_residency,
        tin_secondary: transformedObj.tin,
        years_until_retirement_secondary: transformedObj.years_until_retirement,
        employment_status_spouse__secondary_account_holder_: transformedObj.employment_status_spouse,
        employer_name_spouse__secondary_account_holder_: transformedObj.employer_name_spouse,
        occupation_spouse__secondary_account_holder_: transformedObj.occupation_spouse,
        not_employed_reason_spouse_secondary: transformedObj.not_employed_reason_spouse,
        not_employed_reason_other_spouse_secondary: transformedObj.not_employed_reason_other_spouse,
        years_until_retirement_spouse_secondary: transformedObj.years_until_retirement_spouse,
      });
    }
  }, [currentStep]);

  // All available options for Canadian Accounts
  const cadOptions = ["Cash", "RESP", "RDSP", "In Trust"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  // All available options for US Accounts
  const usOptions = ["Cash", "In Trust"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
  }));

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

    if (option.value === "RDSP" && existingCAD.includes("RESP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a RDSP and a RESP open under the same root",
      };
    }

    if (option.value === "RDSP" && existingCAD.includes("Cash")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "RDSP" && existingUS.includes("Cash")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "RESP" && existingCAD.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint RESP open under the same root",
      };
    }

    if (option.value === "Cash" && existingCAD.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "Cash" && selectedCADAccounts.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "RDSP" && selectedCADAccounts.includes("RESP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint RESP open under the same root",
      };
    }

    if (option.value === "RDSP" && selectedCADAccounts.includes("Cash")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "RDSP" && selectedUSAccounts.includes("Cash")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "RESP" && selectedCADAccounts.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint RESP open under the same root",
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

    if (option.value === "Cash" && existingCAD.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
      };
    }

    if (option.value === "Cash" && selectedCADAccounts.includes("RDSP")) {
      return {
        ...option,
        readonly: true,
        description: "Cannot have a Joint RDSP and a Joint Cash open under the same root",
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

    return option;
  });

  const hasAccountsTypeDescription = {
    "New Root": "Select to open a new set of accounts under a different root",
    "Existing Root": "Select to open one or more new accounts under the same root of existing accounts",
  };

  const noAccountsTypeDescription = {
    "New Root": "Select to open a new set of accounts under a different root",
    "Existing Root": "Client does not have any existing joint accounts",
  };

  // Options for opening a new account under an existing root or new accounts under a new root
  const typeOptions = ["New Root", "Existing Root"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: accounts.length === 0 && n === "Existing Root" ? true : false,
    description: accounts.length > 0 ? hasAccountsTypeDescription[n] : noAccountsTypeDescription[n],
    // description: n === "New Root" ? "Select to open a new set of accounts under a different root" : "Select to open one or more new accounts under the same root of existing accounts",
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

  // Function to handle creating a new account application ticket
  const submitApplication = () => {
    setLoading(true);
    const jointAccountId = selectedContactId;
    runServerless({
      name: "newJointAccountApplication",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, contactKycProperties, jointAccountId }, // Send form properties as parameters
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        const id = resp.response;
        handleSaveClick();
      } else {
        setError(resp.message); // Set error message from response
        console.log("Error: ", resp.message);
      }
    });
  };

  if (error) {
    return (
      <ErrorState title="No associated contacts." layout="vertical" reverseOrder={true} type="support">
        <Text>Please create or associate an existing contact and try again. </Text>
        <Flex direction={"row"} gap={"xs"} justify={"between"}>
          <Flex direction={"row"} gap={"flush"} justify={"end"}>
            <Button onClick={handleBackClick}>{"< Back"}</Button>
          </Flex>
          <Flex direction={"row"} gap={"flush"} justify={"start"}>
            <Button onClick={handleBackClick}>{"Reload"}</Button>
          </Flex>
        </Flex>
      </ErrorState>
    );
  }

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
              stepNames={["Type", "Root", "Joint Account Holder", "Accounts", "Details"]}
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
              stepNames={["Type", "Root", "Joint Account Holder", "Accounts", "Details"]}
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
                      setCurrentStep(currentStep + 2);
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
              stepNames={["Type", "Root", "Joint Account Holder", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>Select the joint account holder</Heading>
                </Flex>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Select
                    name="joint-account-holder"
                    label="Associated contacts"
                    error={associationError}
                    validationMessage={associationErrorValidation}
                    options={contactOptions}
                    onChange={(value) => {
                      handleSelectedContact(value);
                    }}
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
                        setSelectedContactId(undefined);
                        setCurrentStep(currentStep - 2);
                      } else {
                        setSelectedExistingRoot("");
                        setSelectedCADAccounts([]);
                        setSelectedUSAccounts([]);
                        setSelectedContactId(undefined);
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
                      // setApplicationType("New Root");
                      setCurrentStep(currentStep + 1);
                    }}
                    disabled={selectedContactId && !associationError ? false : true}
                  >
                    {"Next >"}
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
              stepNames={["Type", "Root", "Joint Account Holder", "Accounts", "Details"]}
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
                        setCurrentStep(currentStep - 2);
                      } else {
                        setSelectedExistingRoot("");
                        setSelectedCADAccounts([]);
                        setSelectedUSAccounts([]);
                        setCurrentStep(currentStep - 1);
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
    } else if (currentStep === 4 && applicationType === "Existing Root") {
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
                  <Button onClick={submitApplication} disabled={!confirmation}>
                    {"Submit >"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Tile>
      );
    } else if (currentStep === 4) {
      return (
        <Tile>
          <Flex direction={"column"} gap={"extra-large"}>
            <StepIndicator
              currentStep={currentStep}
              stepNames={["Type", "Root", "Joint Account Holder", "Accounts", "Details"]}
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
              stepNames={["Joint Account Holder", "Type", "Accounts", "Details"]}
              circleSize={"extra-small"}
            />
            <Flex direction={"column"} gap={"md"}>
              <Flex direction={"row"} gap={"flush"} justify={"between"}>
                <Flex direction={"column"}>
                  <Box></Box>
                </Flex>
                <Flex direction={"column"}>
                  <Heading>Select the joint account holder</Heading>
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
                  <Select
                    name="cad-accounts"
                    label="Associated contacts"
                    options={cadOptions}
                    // value={selectedCADAccounts}
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
                    options={cadOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    onChange={(items) => setSelectedCADAccounts(items!)}
                    value={selectedCADAccounts}
                  />
                </Flex>
                <Flex direction={"row"} gap={"flush"} justify={"end"}>
                  <ToggleGroup
                    name="us-accounts"
                    label="Accounts (US)"
                    options={usOptions}
                    toggleType="checkboxList"
                    inline={false}
                    variant="default"
                    onChange={(items) => setSelectedUSAccounts(items!)}
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
    } else if (currentStep === 2) {
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

  return <>{accounts.length > 0 ? renderExistingAccounts() : renderExistingAccounts()}</>;
};
