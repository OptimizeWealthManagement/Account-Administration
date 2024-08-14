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
  EmptyState,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@hubspot/ui-extensions";

import { CrmCardActions, CrmAssociationTable, CrmActionButton } from "@hubspot/ui-extensions/crm";

import { Applications } from "./Applications";
import { ProfileHome } from "./profiles/ProfileHome";
import { PersonalProfile } from "./profiles/PersonalProfile";
import { PersonalProfileTest } from "./profiles/PersonalProfileTest"; // FOR TESTING ONLY
import { EmploymentProfile } from "./profiles/EmploymentProfile";
import { FinancialProfile } from "./profiles/FinancialProfile";
import { TaxResidencyProfile } from "./profiles/TaxResidencyProfile";
import { IndividualApplication } from "./newApplications/IndividualApplication";
import { JointApplication } from "./newApplications/JointApplication";
import { EntityApplication } from "./newApplications/EntityApplication";
import type {
  HomeProps,
  PersonalProperties,
  EmploymentProperties,
  FinancialProperties,
  Ticket,
  KycContactProps,
  PrimaryKycProps,
  SecondaryKycProps,
  TaxResidencyProperties,
  PersonalProfileProps,
  InvestorProperties,
  SpouseProperties,
} from "../types";
import { TicketsSearch } from "./TicketsSearch";
import { TicketDetails } from "./TicketDetails";
import { InvestorProfile } from "./profiles/InvestorProfile";
import { ModalDefault } from "./ModalDefault";

export const Home = ({ fetchCrmObjectProperties, context, runServerless, sendAlert, actions }: HomeProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [render, setRender] = useState(false);
  const [profiles, setProfiles] = useState<Array<Profile>>([]); //get list of profiles
  const [selected, setSelected] = useState<number>(); //set selected profile to determine profile view
  const [contactName, setContactName] = useState("");
  const [openedAccordion, setOpenedAccordion] = useState<number>(1);
  const [numberOfApplications, setNumberOfApplications] = useState<number>();
  const [applicationType, setApplicationType] = useState<number>();
  const [tickets, setTickets] = useState<Array<Ticket>>([]); // Set ticket id for selected new application ticket
  const [kycs, setKycs] = useState<KycContactProps | null>(null); // Set ticket id for selected new application ticket
  const [selectedTicket, setSelectedTicket] = useState<number>(); // Set ticket id for selected new application ticket
  const [personalProperties, setPersonalProperties] = useState<Array<PersonalProperties>>([]); //set fetched personal properties
  const [employmentProperties, setEmploymentProperties] = useState<Array<EmploymentProperties>>([]); //set fetched employment properties
  const [financialProperties, setFinancialProperties] = useState<Array<FinancialProperties>>([]); //set fetched financial properties
  const [taxProperties, setTaxProperties] = useState<Array<TaxResidencyProperties>>([]); //set fetched tax residency properties
  const [investorProperties, setInvestorProperties] = useState<Array<InvestorProperties>>([]); //set fetched investor properties

  //State variables to determine if profile properties are complete
  const [missingPersonal, setMissingPersonal] = useState(false);
  const [missingEmployment, setMissingEmployment] = useState(false);
  const [missingFinancial, setMissingFinancial] = useState(false);
  const [missingInvestor, setMissingInvestor] = useState(false);
  const [missingTax, setMissingTax] = useState(false);
  const missingClientProfileProps =
    missingPersonal || missingEmployment || missingFinancial || missingInvestor || missingTax; //Toggle lock screen for new applications
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLicensedUser, setIsLicensedUser] = useState(false);

  const [contact, setContact] = useState("");

  // Identify user
  const [user, setUser] = useState(context.user.id);

  // 43631193 // 28537004

  const usersAndOwners = {
    28537004: "147544330", // Tom Durston
    60348996: "531990163", // Loretta Carbonelli
    27385623: "122943925", // Arman Syed
    27579176: "126905115", // Tanvir Hossain
    50019710: "342803281", // Nikita Tiwari
    49906798: "337910566", // Prem Pranaven
    48571265: "280078747", // Tim Owen
    60182069: "523119712", // Sean Dorian
    60182081: "523113745", // Anish?
    27947344: "135206579", // Dylan Kerney
    48483287: "276348505", // Nick Cup
    43823372: "153725249", // Derrick Marcelino
    28373486: "144322101", // Justin Yee (needs to be deactivated)
    52415497: "456495472", // Adam Newsome
    24634268: "75595795", // Steven McMackon
    24634269: "75595796", // Luca Ciminelli
    25025765: "82554503", // Dave Taylor
    26497843: "107203752", // David Ferreira
    24586898: "74514019", // Chris Coholan
    26497852: "107203756", // Devon Kirkham
    27219156: "119682180", // Alan Kruss
    61497650: "592392885", // Tao To
    61148546: "571225771", // Banu Kandiah
    24634267: "75596723", // Nick Swinton
    26448243: "106520747", // Patrick Bellmore
    24634266: "75596722", // Brian Wells
    50708612: "371512931", // Ryan Moroney
    61643682: "600887337", // Ryan Kesten
    62522426: "650189184", // Thomas Goguen
    62267828: "635890469", // Nik Rogan
    52048788: "436208030", // Sameer Amin
    61802707: "609491024", // Cesar Cossio
    65057812: "1582654549", // Samuel Fraser
    63670188: "715142581", // Earl Lopez
    66601666: "938910658", // Rajalakshmi Manoharan
    65057811: "858807790", // Pratik Harjani
    66690440: "114855881", // Samin Bahrami
    66909288: "1692993745", // Michael Spagnoletti
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
    // Fetch personal profile properties
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
      setPersonalProperties(properties);

      // delete contact id from personal properties and add to contact state variable
      delete personalProperties.hs_object_id;
      setContact(properties.hs_object_id);
    });

    // Fetch employment profile properties
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
      setEmploymentProperties(properties);
    });

    // Fetch financial profile properties
    fetchCrmObjectProperties([
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
      "type_of_other_investments",
      "other_investments",
    ]).then((properties) => {
      setFinancialProperties(properties);
    });

    // Fetch tax residency profile properties
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
      setTaxProperties(properties);
    });

    // Fetch investor profile properties
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
      setInvestorProperties(properties);
    });
  }, [sendAlert]);

  useEffect(() => {
    const name = `${context.user.firstName} ${context.user.lastName}`;
    // const role = `${context.user.teams[-1].name}`;

    setUserName(name);
    // setUserRole(role);
  }, []);

  // Update missing personal properties
  useEffect(() => {
    const ignorePersonal = ["middlename", "spouse_middle_name"];

    const hasNoSpouse =
      personalProperties.marital_status_options === "Single" ||
      personalProperties.marital_status_options === "Widowed" ||
      personalProperties.marital_status_options === "Divorced" ||
      personalProperties.marital_status_options === "Separated";
    const hasPhone = personalProperties.phone != null || personalProperties.mobilephone != null;

    if (hasNoSpouse) {
      ignorePersonal.push(
        "secondary_first_name",
        "spouse_last_name",
        "employment_status_spouse",
        "employer_name_spouse",
        "occupation_spouse",
        "not_employed_reason_spouse",
        "not_employed_reason_other_spouse",
        "years_until_retirement_spouse"
      );
    }

    if (personalProperties.employment_status_spouse && personalProperties.employment_status_spouse === "Not Employed") {
      ignorePersonal.push("employer_name_spouse", "occupation_spouse", "years_until_retirement_spouse");
    }

    if (personalProperties.employment_status_spouse && personalProperties.employment_status_spouse !== "Not Employed") {
      ignorePersonal.push("not_employed_reason_spouse", "not_employed_reason_other_spouse");
    }

    if (personalProperties.employment_status_spouse && personalProperties.employment_status_spouse === "Retired") {
      ignorePersonal.push("years_until_retirement_spouse");
    }

    if (personalProperties.not_employed_reason_spouse && personalProperties.not_employed_reason_spouse !== "Other") {
      ignorePersonal.push("not_employed_reason_other_spouse");
    }

    if (hasPhone) {
      ignorePersonal.push("phone", "mobilephone");
    }

    const invalidPersonalPropsCount = Object.entries(personalProperties).reduce((count, [key, value]) => {
      let inList = ignorePersonal.includes(key);
      if (inList) {
        return count;
      } else {
      }

      return value === null ? count + 1 : count;
    }, 0);

    setMissingPersonal(invalidPersonalPropsCount > 0);
  }, [personalProperties]);

  // Update missing employment properties
  useEffect(() => {
    const ignoreEmployment = [];

    const isNotEmployed = employmentProperties.employment_status === "Not Employed";

    if (isNotEmployed) {
      ignoreEmployment.push("employer_name", "occupation");
    }

    if (isNotEmployed && employmentProperties.not_employed_reason != "Other") {
      ignoreEmployment.push("not_employed_reason_other");
    }

    if (!isNotEmployed) {
      ignoreEmployment.push("not_employed_reason", "not_employed_reason_other");
    }

    if (employmentProperties.is_this_account_a_pro_account_ === "No") {
      ignoreEmployment.push("name_of_individual_cro", "employer_name_cro");
    }

    if (employmentProperties.is_the_client_considered_a_reporting_insider_ === "No") {
      ignoreEmployment.push("reporting_insider_symbol", "reporting_insider_company");
    }

    if (employmentProperties.foreign_politically_exposed_person === "No") {
      ignoreEmployment.push("name_of_foreign_pep", "relationship_to_pep_foreign", "wealth_pep_foreign");
    }

    if (employmentProperties.domestic_politically_exposed_person === "No") {
      ignoreEmployment.push("name_of_domestic_pep", "relationship_to_pep_domestic", "wealth_pep_domestic");
    }

    if (employmentProperties.head_of_an_international_organization === "No") {
      ignoreEmployment.push(
        "name_of_international_organization",
        "relationship_to_international_organization",
        "wealth_international_organization"
      );
    }

    if (
      employmentProperties.employment_status === "Retired" ||
      employmentProperties.employment_status === "Not Employed"
    ) {
      ignoreEmployment.push("years_until_retirement");
    }

    const invalidEmploymentPropsCount = Object.entries(employmentProperties).reduce((count, [key, value]) => {
      let inList = ignoreEmployment.includes(key);
      if (inList) {
        return count;
      } else {
      }
      return value === null ? count + 1 : count;
    }, 0);

    setMissingEmployment(invalidEmploymentPropsCount > 0);
  }, [employmentProperties]);

  // Update missing financial properties
  useEffect(() => {
    const ignoreFinancial = [];

    if (financialProperties && financialProperties.other_assets && financialProperties.other_assets === "No") {
      ignoreFinancial.push(...["financial_institution", "other_investments", "type_of_other_investments"]);
    }

    if (
      financialProperties &&
      financialProperties.other_income &&
      (financialProperties.other_income === 0 || financialProperties.other_income === "0")
    ) {
      ignoreFinancial.push(...["source_of_other_income"]);
    }

    const invalidFinancialProps = Object.entries(financialProperties).reduce((count, [key, value]) => {
      let inList = ignoreFinancial.includes(key);
      if (inList) {
        return count;
      } else {
      }

      return value === null ? count + 1 : count;
    }, 0);

    setMissingFinancial(invalidFinancialProps > 0);
  }, [financialProperties]);

  // Update missing tax residency properties
  useEffect(() => {
    const ignoreTax = [];

    // If not a canadian citizen or resident, ignore SIN
    if (taxProperties.canadian_citizen === "No" && taxProperties.canadian_resident === "No") {
      ignoreTax.push("sin");
    }

    // If canadian citizen, ignore canadian resident
    if (taxProperties.canadian_citizen === "Yes") {
      ignoreTax.push("canadian_resident");
    }

    // If not a us citizen or resident, ignore SSN
    if (taxProperties.us_citizen === "No" && taxProperties.us_resident === "No") {
      ignoreTax.push("ssn");
    }

    // If us citizen, ignore us resident
    if (taxProperties.us_citizen === "Yes") {
      ignoreTax.push("us_resident");
    }

    // If not a canadian citizen and not a us citizen, ignore other_citizen and has_tin as they must be a citizen of elsewhere
    if (taxProperties.canadian_citizen === "No" && taxProperties.us_citizen === "No") {
      ignoreTax.push("other_citizen", "has_tin");
    }

    // If not a resident or citizen of country other than Canada or US, ignore other residency and tin properties
    if (taxProperties.resident_of_other_country === "No" || taxProperties.other_citizen === "No") {
      ignoreTax.push("country_of_residency", "has_tin", "tin", "reason_for_no_tin");
    }

    // If a resident of another country and has TIN, ignore reason for not having TIN
    if (taxProperties.has_tin === "Yes") {
      ignoreTax.push("reason_for_no_tin");
    }

    const invalidTaxProps = Object.entries(taxProperties).reduce((count, [key, value]) => {
      let inList = ignoreTax.includes(key);
      if (inList) {
        return count;
      } else {
      }
      return value === null ? count + 1 : count;
    }, 0);

    setMissingTax(invalidTaxProps > 0);
  }, [taxProperties]);

  // Update missing investor properties
  useEffect(() => {
    const ignoreInvestor = [];

    if (investorProperties.trusted_contact_person === "No") {
      ignoreInvestor.push(
        "trusted_contact_first_name",
        "trusted_contact_last_name",
        "trusted_contact_email",
        "trusted_contact_phone",
        "trusted_contact_address",
        "trusted_contact_city",
        "trusted_contact_province",
        "trusted_contact_postal_code",
        "trusted_contact_relationship"
      );
    }

    if (investorProperties.vulnerable_client_ === "No") {
      ignoreInvestor.push("vulnerable_client_details");
    }

    const invalidInvestorPropsCount = Object.entries(investorProperties).reduce((count, [key, value]) => {
      let inList = ignoreInvestor.includes(key);
      if (inList) {
        return count;
      } else {
      }
      return value === null ? count + 1 : count;
    }, 0);

    setMissingInvestor(invalidInvestorPropsCount > 0);
  }, [investorProperties]);

  const getTickets = useCallback(() => {
    setLoading(true);
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "tickets",
      propertiesToSend: ["hs_object_id"],
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          const ticketObject =
            resp.response.data.CRM.contact.associations.ticket_collection__contact_to_ticket.items.map((object) => {
              return object as Ticket;
            });

          setTickets(ticketObject);

          const licensedOwnerId = usersAndOwners[user];
          if (licensedOwnerId) {
            setIsLicensedUser(true);
          }

          let individualKycObject: PrimaryKycProps[] = [];

          if (resp.response.data.CRM.contact.associations.p_kyc_collection__individual_account_kyc) {
            individualKycObject =
              resp.response.data.CRM.contact.associations.p_kyc_collection__individual_account_kyc.items.map(
                (object) => {
                  return object as PrimaryKycProps;
                }
              );
          }

          let primaryKycObject: PrimaryKycProps[] = [];

          if (resp.response.data.CRM.contact.associations.p_kyc_collection__primary_account_holder_kyc) {
            primaryKycObject =
              resp.response.data.CRM.contact.associations.p_kyc_collection__primary_account_holder_kyc.items.map(
                (object) => {
                  return object as PrimaryKycProps;
                }
              );
          }

          let secondaryKycObject: SecondaryKycProps[] = [];

          if (resp.response.data.CRM.contact.associations.p_kyc_collection__secondary_account_holder_kyc) {
            secondaryKycObject =
              resp.response.data.CRM.contact.associations.p_kyc_collection__secondary_account_holder_kyc.items.map(
                (object) => {
                  return object as SecondaryKycProps;
                }
              );
          }

          setKycs((prevState) => {
            const updatedState = {
              primary_account_holder: [
                ...(prevState?.primary_account_holder || []),
                ...individualKycObject,
                ...primaryKycObject,
              ],
              secondary_account_holder: [...(prevState?.secondary_account_holder || []), ...secondaryKycObject],
            };

            return updatedState;
          });
        } else {
          setError(resp.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [runServerless]);

  useEffect(() => {
    getTickets();
  }, []);

  //Toggle opened accordion
  const toggleOpenedAccordion = (accordionNumber: number) => {
    if (openedAccordion === accordionNumber) {
      setOpenedAccordion(null);
    } else {
      setOpenedAccordion(accordionNumber);
    }
  };

  //Cancel application submission
  const handleCancelledApplication = () => {
    setSelected(undefined);
    setApplicationType(undefined);
  };

  const clearSelection = useCallback(() => {
    setSelected(undefined);
    setSelectedTicket(undefined);
  }, []);

  const handleTicketRender = useCallback(() => {
    setSelected(undefined);
    setSelectedTicket(undefined);
    getTickets();
  }, []);

  const handleProfileSave = useCallback(
    (message: string) => {
      // setLoading(true);
      setSelected(undefined);

      sendAlert({
        type: "success",
        message: "Saved",
      });
      setApplicationType(undefined);

      getTickets();
    },
    [sendAlert]
  );

  const handlePersonalSave = (updatedProperties: PersonalProfileProps) => {
    setSelected(undefined);
    sendAlert({
      type: "info",
      message: "Changes saved",
    });

    setPersonalProperties((prevProps) => ({ ...prevProps, ...updatedProperties }));
  };

  const handleEmploymentSave = (updatedProperties: EmploymentProperties) => {
    setSelected(undefined);
    sendAlert({
      type: "info",
      message: "Changes saved",
    });

    setEmploymentProperties((prevProps) => ({ ...prevProps, ...updatedProperties }));
  };

  const handleFinancialSave = (updatedProperties: FinancialProperties) => {
    setSelected(undefined);
    sendAlert({
      type: "info",
      message: "Changes saved",
    });

    setFinancialProperties((prevProps) => ({ ...prevProps, ...updatedProperties }));
  };

  const handleInvestorSave = (updatedProperties: InvestorProperties) => {
    setSelected(undefined);
    sendAlert({
      type: "info",
      message: "Changes saved",
    });

    setInvestorProperties((prevProps) => ({ ...prevProps, ...updatedProperties }));
  };

  const handleTaxSave = (updatedProperties: TaxResidencyProperties) => {
    setSelected(undefined);
    sendAlert({
      type: "info",
      message: "Changes saved",
    });

    setTaxProperties((prevProps) => ({ ...prevProps, ...updatedProperties }));
  };

  const cancelApplication = useCallback(() => handleCancelledApplication, []);

  //Toggle opened accordion
  const handleApplicationClick = (applicationNumber: number) => {
    setApplicationType(applicationNumber);
  };

  // Small utility function for help below
  const getSelectedTicket = (id?: number) => {
    return tickets.find((t) => t.hs_object_id === id);
    // setSelectedKycId(id);
  };

  const selectedTicketObject = getSelectedTicket(selectedTicket);

  //Set loading state
  if (selectedTicket) {
    return (
      <TicketDetails
        // ticket={selectedTicket}
        ticket={selectedTicketObject}
        context={context}
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        runServerless={runServerless}
        onBackClick={handleTicketRender}
        sendAlert={sendAlert}
        // onBackClick={clearSelection}
      />
    );
  }

  const handleSelection = (id: number) => {
    setSelected(id);
  };

  // Render personal profile profile
  if (selected && selected === 1) {
    return (
      <PersonalProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={handlePersonalSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render personal profile profile (CAMERON AND TOM TEST)
  if (selected && selected === 6) {
    return (
      <PersonalProfileTest
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        kycs={kycs}
        context={context}
        runServerless={runServerless}
        onClick={handlePersonalSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render employment profile profile
  if (selected && selected === 2) {
    return (
      <EmploymentProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={handleEmploymentSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render financial profile profile
  if (selected && selected === 3) {
    return (
      <FinancialProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={handleFinancialSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render investor profile profile
  if (selected && selected === 4) {
    return (
      <InvestorProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        sendAlert={sendAlert}
        runServerless={runServerless}
        onClick={handleInvestorSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render tax residency profile
  if (selected && selected === 5) {
    return (
      <TaxResidencyProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={handleTaxSave}
        onBackClick={clearSelection}
      />
    );
  }

  // Render new individual application
  if (applicationType && applicationType === 1) {
    return (
      <IndividualApplication
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onSubmit={handleProfileSave}
        onCancelClick={handleCancelledApplication}
      />
    );
  }

  // Render new joint application
  if (applicationType && applicationType === 2) {
    return (
      <JointApplication
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onSubmit={handleProfileSave}
        onCancelClick={handleCancelledApplication}
      />
    );
  }

  // Render new entity application
  if (applicationType && applicationType === 3) {
    return (
      <EntityApplication
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onSubmit={handleProfileSave}
        onCancelClick={handleCancelledApplication}
      />
    );
  }

  //Set loading state
  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"column"} gap={"extra-small"}>
        <Flex direction={"row"} justify={"start"}>
          <Heading>Client Profile</Heading>
        </Flex>
        <Divider distance="sm" />
        <Flex direction={"row"} gap={"md"} justify={"between"}>
          <Flex direction={"column"} gap={"md"}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Personal Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Personal contact details and other related information"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {missingPersonal ? "Incomplete" : "Complete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button
                        onClick={() => {
                          setSelected(1);
                        }}
                      >
                        View
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Employment Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {
                            "Information related to a client's employment details, such as status, employer, and occupation"
                          }
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Incomplete' : 'Please complete KYC Questions'} */}
                          {missingEmployment ? "Incomplete" : "Complete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(2)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Financial Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"A breakdown of the client's sources of income and net worth"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {missingFinancial ? "Incomplete" : "Complete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(3)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Investor Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Information related to investments at the client-level"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {missingInvestor ? "Incomplete" : "Complete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(4)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Tax Residency Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Information related to a client's citizenship and tax residency"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {missingTax ? "Incomplete" : "Complete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(5)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Associate a Contact
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Associate a contact and specify their relationship to the client"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          Optional
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <CrmActionButton
                        actionType="OPEN_RECORD_ASSOCIATION_FORM"
                        actionContext={{
                          objectTypeId: "0-1",
                          association: {
                            objectTypeId: "0-1",
                            objectId: Number(contact),
                          },
                        }}
                      >
                        {"Add "}
                      </CrmActionButton>
                    </Flex>
                  </TableCell>
                </TableRow>
                {user && (user === 43631193 || user === 28537004) ? (
                  <>
                    <TableRow>
                      <TableCell>
                        <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                          <Text format={{ fontWeight: "demibold" }}>
                            Personal Profile
                            <Text variant="microcopy" format={{ italic: true }} inline={false}>
                              {"Test"}
                            </Text>
                          </Text>
                        </Flex>
                      </TableCell>
                      <TableCell>
                        <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                          <Box flex={"none"}>
                            <Text format={{ italic: true }} inline={false}>
                              {missingPersonal ? "Incomplete" : "Complete"}
                            </Text>
                          </Box>
                        </Flex>
                      </TableCell>
                      <TableCell>
                        <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                          <Button
                            onClick={() => {
                              setSelected(6);
                            }}
                          >
                            View
                          </Button>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <></>
                )}
              </TableBody>
            </Table>
          </Flex>
        </Flex>
      </Flex>
      <Flex direction={"column"} gap={"extra-small"}>
        <Flex direction={"row"} gap={"md"} justify={"betweem"}>
          <Flex direction={"row"} justify={"start"}>
            <Heading>New Account Applications</Heading>
          </Flex>
        </Flex>
        <Divider distance="sm" />
        {missingClientProfileProps || !isLicensedUser ? (
          <>
            <Flex direction={"column"} gap={"md"} align={"stretch"}>
              <Box></Box>
              <Box alignSelf={"center"}>
                <ErrorState
                  title={isLicensedUser ? "Client profile is not complete." : "You need access to view this page."}
                  layout="vertical"
                  reverseOrder={true}
                  type="lock"
                >
                  <Text>
                    {isLicensedUser
                      ? "All client profiles must be complete before submitting a new account application."
                      : "Only licensed representatives are able to submit new account applications."}
                  </Text>
                </ErrorState>
              </Box>
              <Box></Box>
            </Flex>
          </>
        ) : (
          <TicketsSearch tickets={tickets} onTicketClick={setSelectedTicket} onApplicationClick={setSelectedTicket} />
        )}
      </Flex>
      <Flex direction={"row"} justify={"end"}>
        {missingClientProfileProps || !isLicensedUser ? (
          <></>
        ) : (
          <>
            <Select
              label=""
              name="application-toggle"
              variant="transparent"
              placeholder="New Application"
              options={[
                { label: "Individual Application", value: 1 },
                { label: "Joint Application", value: 2 },
                { label: "Entity Application", value: 3 },
              ]}
              onChange={(value) => {
                handleApplicationClick(value);
              }}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
};
