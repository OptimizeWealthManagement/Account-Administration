import React, { useCallback, useState, useEffect } from "react";
import {
  Heading,
  Button,
  Divider,
  Flex,
  Tag,
  Accordion,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  LoadingSpinner,
  Text,
  Box,
} from "@hubspot/ui-extensions";
import { CrmStageTracker, CrmAssociationPivot } from "@hubspot/ui-extensions/crm";
import { AccountDetails } from "./AccountDetails";
import type { TicketDetailProps, Kyc, ApplicationLevelProps, AccountHoldersProps, AccountHolder } from "../types";
import { IdVerification } from "./accounts/IdVerification";
import { BankAccountDetails } from "./accounts/BankAccountDetails";
import { JointAccountProfile } from "./accounts/JointAccountProfile";
import { EntityAccountProfile } from "./accounts/EntityAccountProfile";
import { AdditionalQuestions } from "./accounts/AdditionalQuestions";
import { Cancel } from "./accounts/Cancel";

const PAGE_SIZE = 4;

export const TicketDetails = ({
  ticket,
  context,
  fetchCrmObjectProperties,
  runServerless,
  onBackClick,
  sendAlert,
}: TicketDetailProps) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number>();
  const [kycs, setKYCs] = useState<Array<Kyc>>([]); // Set fetched associated kycs
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedKycId, setSelectedKycId] = useState<number>(); // Set selected kyc as kyc hs_object_id
  const [showAccounts, setShowAccounts] = useState(true); // Set toggle to show / hide accounts being opened
  const [allComplete, setAllComplete] = useState(false);
  const [applicationTypeInfo, setApplicationTypeInfo] = useState(["Bank Account Details", "ID Verification"]);
  const [selectedApplicationInfoId, setSelectedApplicationInfoId] = useState<number>();
  const [ticketObject, setTicketObject] = useState();
  const [applicationProps, setApplicationProps] = useState<ApplicationLevelProps | null>(null); // fetched application-level props
  const [accountHolders, setAccountHolders] = useState({} as AccountHolder[]);
  const [idCompleted, setIdCompleted] = useState(false);
  const [bankingCompleted, setBankingCompleted] = useState(false);
  const [entityCompleted, setEntityCompleted] = useState(false);
  const [jointCompleted, setJointCompleted] = useState(false);
  const [meetingDetailsCompleted, setMeetingDetailsCompleted] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [error, setError] = useState<string>();

  const [user, setUser] = useState(context.user.id);
  const [isLicensedUser, setIsLicensedUser] = useState(false);
  const [isCompleted, setIsCompleted] = useState(ticket.hs_pipeline_stage === "103949237");

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
    24634266: "75596722",
    50708612: "371512931", // Ryan Moroney
    26448243: "106520747", // Pat Bellmore
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
  }, [user]);

  const kycCount = kycs.length;

  const handleCancelClick = useCallback(() => {
    setSelectedKycId(undefined);
    setSelectedApplicationInfoId(undefined);
    setShowCancel(false);
    // getKYCs();
  }, []);

  const handleSaveClick = useCallback(() => {
    setSelectedKycId(undefined);
    setSelectedApplicationInfoId(undefined);
    getKYCs();
  }, []);

  const handleCancelApplication = useCallback(() => {
    sendAlert({
      type: "success",
      message: "Application has been cancelled.",
    });
    setSelectedKycId(undefined);
    setSelectedApplicationInfoId(undefined);
    setShowCancel(false);
    onBackClick();
  }, []);

  useEffect(() => {
    const userTeam = context.user.teams;
  }, []);

  const handleBackClick = selected ? handleCancelClick : onBackClick;

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setPageNumber(1);
  }, []);

  // Function to fetch kyc data that is initialized on load and can be initialized onClick to refresh the data
  const getKYCs = useCallback(() => {
    setLoading(true);
    // Fetch a list of associated new account application tickets
    const tId = ticket.hs_object_id;
    runServerless({
      name: "kycs",
      propertiesToSend: ["hs_object_id"],
      parameters: { tId }, // Send ticket id used to be ticket
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          const kycObject = resp.response?.["data"].CRM.ticket.associations.p_kyc_collection__kyc_to_ticket.items.map(
            (object) => {
              return object as Kyc;
            }
          );

          const firstObject = `${kycObject[0].firstname} ${kycObject[0].lastname}`;

          if (kycObject[0].firstname_secondary === null || kycObject[0].lastname_secondary === null) {
            // const secondObject = `${kycObject[0].secondary_firstname} ${kycObject[0].secondary_lastname}`;
            setAccountHolders([{ id: 0, name: firstObject }]);
          } else {
            const secondObject = `${kycObject[0].firstname_secondary} ${kycObject[0].lastname_secondary}`;
            setAccountHolders([
              { id: 0, name: firstObject },
              { id: 1, name: secondObject },
            ]);
          }

          const appData = resp.response?.["data"].CRM.ticket;

          setApplicationProps(appData as ApplicationLevelProps);

          setKYCs(kycObject);
        } else {
          setError(`Fetch KYC resulted in an error ${resp.message}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [runServerless]);

  const updateTicket = useCallback(() => {
    setLoading(true);
    const ticketId = ticket.hs_object_id;
    const ticketStatus = "103949235";
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "updateApplicationTicket",
      propertiesToSend: ["hs_object_id"],
      parameters: { ticketId, ticketStatus }, // Send ticket props
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          console.log("Response: ", resp.status);
        } else {
          setError(`Update application ticket resulted in an error ${resp.message}`);
        }
      })
      .finally(() => {
        // setLoading(false);
        getKYCs();
      });
  }, [runServerless]);

  // Fetch KYC data on load
  useEffect(() => {
    getKYCs();
  }, []);

  const updatedKYCs = kycs.map((obj) => {
    // Initialize a flag to keep track of undefined properties
    let hasUndefined = false;

    const beneList = [
      "RESP",
      "RDSP",
      "RRSP",
      "RSP",
      "Spousal RSP",
      "LIRA",
      "LRSP",
      "RLSP",
      "RIF",
      "Spousal RIF",
      "LIF",
      "PRIF",
      "LRIF",
      "RLIF",
      "TFSA",
    ];
    const spousalList = ["Spousal RSP", "Spousal RIF"];
    const rifList = ["RIF", "Spousal RIF", "LIF", "LRIF", "RLIF", "PRIF"];

    const allowedKycKeys = [
      "hs_object_id",
      "account_type",
      "date_of_birth",
      "investment_experience",
      "investment_knowledge",
      "intended_use_of_account",
      "source_of_funds",
      "risk_tolerance",
      "risk_capacity",
      "investment_objective",
      "time_horizon",
      "liquidity_needs",
      "does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_",
      "other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_",
      "will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_",
      "does_anyone_other_than_the_client_guarantee_this_account_",
      "do_you_trade_or_intend_to_trade_with_other_investment_firms_",
      "do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_",
      "employment_status",
      "date_of_birth",
      "assigned_model",
      "model_suitability",
    ];

    // CHANGED TO ADJUST SECONDARY
    if (accountHolders?.length === 2) {
      // allowedKycKeys.push(...["investment_experience__secondary_account_holder_", "investment_knowledge__secondary_account_holder_", "intended_use_of_account__secondary_account_holder_", "source_of_funds__secondary_account_holder_", "risk_tolerance__secondary_account_holder_", "risk_capacity__secondary_account_holder_", "investment_objective__secondary_account_holder_", "time_horizon__secondary_account_holder_", "liquidity_needs__secondary_account_holder_", "employment_status__secondary_account_holder_", "date_of_birth__secondary_account_holder_"]);
      allowedKycKeys.push(
        ...[
          "investment_experience__secondary_account_holder_",
          "investment_knowledge__secondary_account_holder_",
          "employment_status__secondary_account_holder_",
          "date_of_birth__secondary_account_holder_",
        ]
      );
    }

    if (beneList.includes(obj.account_type?.label)) {
      allowedKycKeys.push(...["beneficiary"]);
    }

    if (spousalList.includes(obj.account_type?.label)) {
      allowedKycKeys.push(...["spouse_sin", "spouse_email"]);
    }

    if (rifList.includes(obj.account_type?.label)) {
      allowedKycKeys.push(...["minimum_calculated_based_on"]);
      if (obj?.minimum_calculated_based_on?.label === "Spouse") {
        allowedKycKeys.push(...["spouse_date_of_birth"]);
      }
    }

    // Check each property in the object
    for (const key in obj) {
      if (allowedKycKeys.includes(key as any) && obj[key] === null) {
        hasUndefined = true;
        break;
      }
    }

    // const kycsComp = !hasUndefined;
    // setAllComplete(kycsComp)

    // Based on the flag, set the Status property accordingly
    if (hasUndefined) {
      return { ...obj, status: "In Process" };
    } else {
      return { ...obj, status: "Complete" };
    }
  });

  // Check for null kyc values
  const checkNullValues = (obj) => {
    const nullKeys = Object.keys(obj).filter((key) => obj[key] === null);
    const anyNull = nullKeys.length === 0;
    return anyNull; // return true if one or more keys have null values
  };

  useEffect(() => {
    const idPortion = { ...applicationProps };
    const bankAccountPortion = { ...applicationProps };
    const jointPortion = { ...applicationProps };
    const entityPortion = { ...applicationProps };
    // const additionalQuestionsPortion = { ...applicationProps };
    const meetingDetailsPortion = { ...applicationProps };

    const allowedIdKeys = [
      "verification_method",
      "verified_by",
      "verification_date",
      "id_type",
      "id_number",
      "id_expiry",
      "id_province_state",
      "id_country",
    ];

    if (accountHolders) {
      if (accountHolders.length === 2) {
        allowedIdKeys.push(
          ...[
            "secondary_verification_method",
            "secondary_verified_by",
            "secondary_verification_date",
            "second_id_type",
            "secondary_id_number",
            "secondary_id_expiry",
            "secondary_id_province_state",
            "secondary_id_country",
          ]
        );
      }

      // delete non idkeys
      for (const key of Object.keys(idPortion)) {
        if (!allowedIdKeys.includes(key as any)) {
          delete idPortion[key];
        }
      }

      if (accountHolders.length === 2) {
        // delete id keys if using dual method
        for (const key of Object.keys(idPortion)) {
          if (
            accountHolders.length === 2 &&
            key !== "secondary_verification_method" &&
            idPortion["secondary_verification_method"] &&
            idPortion["secondary_verification_method"].label === "Dual Verification Method"
          ) {
            delete idPortion[key];
          }
        }
      }

      if (accountHolders.length === 2) {
        // delete id keys if using dual method
        for (const key of Object.keys(idPortion)) {
          if (
            accountHolders.length === 2 &&
            key !== "verification_method" &&
            idPortion["verification_method"] &&
            idPortion["verification_method"].label === "Dual Verification Method"
          ) {
            delete idPortion[key];
          }
        }
      }

      if (accountHolders.length === 1) {
        // delete id keys if using dual method
        for (const key of Object.keys(idPortion)) {
          if (
            accountHolders.length === 1 &&
            key !== "verification_method" &&
            idPortion["verification_method"] &&
            idPortion["verification_method"].label === "Dual Verification Method"
          ) {
            delete idPortion[key];
          }
        }
      }

      const allowedMeetingDetailsKeys = [
        "meeting_type",
        "wp_present",
        "other_attendees_present",
        "onboarding_documentation_delivery_method",
        "disclosures_provided",
        "family_office_services",
        "additional_questions_options",
        "client_confirmations",
      ];

      if (meetingDetailsPortion.meeting_type && meetingDetailsPortion.meeting_type === "In Person") {
        allowedMeetingDetailsKeys.push(...["meeting_location"]);
      }

      if (meetingDetailsPortion.wp_present && meetingDetailsPortion.wp_present === "Yes") {
        allowedMeetingDetailsKeys.push(...["wp_name"]);
      }

      if (meetingDetailsPortion.other_attendees_present && meetingDetailsPortion.other_attendees_present === "Yes") {
        allowedMeetingDetailsKeys.push(...["other_attendees"]);
      }

      if (
        meetingDetailsPortion.additional_questions_options &&
        meetingDetailsPortion.additional_questions_options === "Yes"
      ) {
        allowedMeetingDetailsKeys.push(...["additional_questions"]);
      }

      // delete non meeting keys
      for (const key of Object.keys(meetingDetailsPortion)) {
        if (!allowedMeetingDetailsKeys.includes(key as any)) {
          delete meetingDetailsPortion[key];
        }
      }

      const allowedBankKeys = [
        "bank_name",
        "bank_address",
        "bank_city",
        "bank_province",
        "bank_postal_code",
        "bank_institution_number",
        "bankaccountnumber",
        "bank_transit_number",
      ];

      if (accountHolders.length === 2) {
        allowedBankKeys.push(
          ...[
            "bank_name_2",
            "bank_address_2",
            "bank_city_2",
            "bank_province_2",
            "bank_postal_code_2",
            "bank_institution_number_2",
            "bankaccountnumber_2",
            "bank_transit_number_2",
          ]
        );
      }

      for (const key of Object.keys(bankAccountPortion)) {
        if (!allowedBankKeys.includes(key as any)) {
          delete bankAccountPortion[key];
        }
      }

      const allowedEntityKeys = [
        "entity_type",
        "entity_name",
        "nature_of_business",
        "business_number",
        "entity_address",
        "entity_city",
        "entity_province",
        "entity_postal_code",
        "individual_1_role",
        "entity_income",
        "entity_cash",
        "entity_registered_investments",
        "entity_non_registered_investments",
        "entity_fixed_assets",
        "entity_mortgages_and_other_liabilities",
      ];

      if (accountHolders.length === 2) {
        allowedEntityKeys.push(...["individual_2_role"]);
      }

      for (const key of Object.keys(entityPortion)) {
        if (!allowedEntityKeys.includes(key as any)) {
          delete entityPortion[key];
        }
      }

      const allowedJointKeys = ["ownership_type"];

      for (const key of Object.keys(jointPortion)) {
        if (!allowedJointKeys.includes(key as any)) {
          delete jointPortion[key];
        }
      }

      const idComp = checkNullValues(idPortion);
      const bankComp = checkNullValues(bankAccountPortion);
      const entityComp = checkNullValues(entityPortion);
      const jointComp = checkNullValues(jointPortion);
      const meetingDetailsComp = checkNullValues(meetingDetailsPortion);

      setIdCompleted(idComp);
      setBankingCompleted(bankComp);
      setMeetingDetailsCompleted(meetingDetailsComp);

      if (
        applicationProps &&
        applicationProps.application_type &&
        applicationProps.application_type.label === "Entity"
      ) {
        setEntityCompleted(entityComp);
        setJointCompleted(true);
      } else if (
        applicationProps &&
        applicationProps.application_type &&
        applicationProps.application_type.label === "Joint"
      ) {
        setJointCompleted(jointComp);
        setEntityCompleted(true);
      } else {
        setJointCompleted(true);
        setEntityCompleted(true);
      }
    }
  }, [applicationProps]);

  const applicationInfoDescriptions = {
    "Bank Account Details": "Provide primary bank account details",
    "ID Verification": "Verify the indentity of the account holder",
    "Joint Account Profile": "Specify the rights of survivorship",
    "Entity Information": "Provide details on the legal entity",
    "Meeting Details": "Location, attendeeds, additional topics discussed, etc.",
  };

  useEffect(() => {
    const corpAppItems = ["Entity Information"];
    const jointAppItems = ["Joint Account Profile"];
    const additionalQuestionItems = ["Meeting Details"];

    if (!applicationTypeInfo.includes("Meeting Details")) {
      applicationTypeInfo.splice(0, 0, ...additionalQuestionItems);
    }

    if (
      applicationProps &&
      applicationProps.application_type.label === "Joint" &&
      !applicationTypeInfo.includes("Joint Account Profile")
    ) {
      applicationTypeInfo.splice(0, 0, ...jointAppItems);
    }

    if (
      applicationProps &&
      applicationProps.application_type.label === "Entity" &&
      !applicationTypeInfo.includes("Entity Information")
    ) {
      applicationTypeInfo.splice(0, 0, ...corpAppItems);
    }
  }, [applicationProps]);

  const getStatus = (name: string) => {
    if (name === "Entity Information" && entityCompleted) {
      return "Complete";
    }

    if (name === "Joint Account Profile" && jointCompleted) {
      return "Complete";
    }

    if (name === "Bank Account Details" && bankingCompleted) {
      return "Complete";
    }

    if (name === "ID Verification" && idCompleted) {
      return "Complete";
    }

    if (name === "Meeting Details" && meetingDetailsCompleted) {
      return "Complete";
    }

    return "Incomplete";
  };

  const updatedApplicationInfo = applicationTypeInfo.map((n, index) => ({
    id: index,
    name: n,
    description: applicationInfoDescriptions[n],
    status: getStatus(n),
  }));

  useEffect(() => {
    const allKycsComplete = kycs.every((obj) => {
      // Use Object.values to get an array of all values in the object
      let hasUndefined = false;
      let spouseRequiredByRifCheck = false;

      const beneList = [
        "RESP",
        "RDSP",
        "RRSP",
        "RSP",
        "Spousal RSP",
        "LIRA",
        "LRSP",
        "RLSP",
        "RIF",
        "Spousal RIF",
        "LIF",
        "PRIF",
        "LRIF",
        "RLIF",
        "TFSA",
      ];
      const legislationList = ["LIRA", "LRSP", "RLSP", "LIF", "RLIF", "LRIF", "PRIF"];
      const spousalList = ["Spousal RSP", "Spousal RIF"];
      const rifList = ["RIF", "Spousal RIF", "LIF", "LRIF", "RLIF", "PRIF"];

      const allowedKycKeys = [
        "hs_object_id",
        "account_type",
        "date_of_birth",
        "investment_experience",
        "investment_knowledge",
        "intended_use_of_account",
        "source_of_funds",
        "risk_tolerance",
        "risk_capacity",
        "investment_objective",
        "time_horizon",
        "liquidity_needs",
        "does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_",
        "other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_",
        "will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_",
        "does_anyone_other_than_the_client_guarantee_this_account_",
        "do_you_trade_or_intend_to_trade_with_other_investment_firms_",
        "do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_",
        "employment_status",
        "date_of_birth",
        "assigned_model",
        "model_suitability",
      ];

      // CHANGED TO ADJUST SECONDARY
      if (accountHolders.length === 2) {
        // allowedKycKeys.push(...["investment_experience__secondary_account_holder_", "investment_knowledge__secondary_account_holder_", "intended_use_of_account__secondary_account_holder_", "source_of_funds__secondary_account_holder_", "risk_tolerance__secondary_account_holder_", "risk_capacity__secondary_account_holder_", "investment_objective__secondary_account_holder_", "time_horizon__secondary_account_holder_", "liquidity_needs__secondary_account_holder_", "employment_status__secondary_account_holder_", "date_of_birth__secondary_account_holder_"]);
        allowedKycKeys.push(
          ...[
            "investment_experience__secondary_account_holder_",
            "investment_knowledge__secondary_account_holder_",
            "employment_status__secondary_account_holder_",
            "date_of_birth__secondary_account_holder_",
          ]
        );
      }

      if (beneList.includes(obj.account_type.label)) {
        allowedKycKeys.push(...["beneficiary"]);
      }

      if (legislationList.includes(obj.account_type.label)) {
        allowedKycKeys.push(...["legislation"]);
      }

      if (obj.account_type.label === "LIF") {
        allowedKycKeys.push(...["pension_fund_source"]);
      }

      if (spousalList.includes(obj.account_type.label)) {
        allowedKycKeys.push(...["spouse_sin", "spouse_email"]);
      }

      if (rifList.includes(obj.account_type.label)) {
        allowedKycKeys.push(...["minimum_calculated_based_on"]);
        if (obj?.minimum_calculated_based_on?.label === "Spouse") {
          spouseRequiredByRifCheck = true;
        }
      }

      if (spouseRequiredByRifCheck) {
        allowedKycKeys.push(...["spouse_date_of_birth"]);
      }

      // Check each property in the object
      for (const key in obj) {
        if (allowedKycKeys.includes(key as any) && obj[key] === null) {
          hasUndefined = true;
          break;
        }
      }

      return !hasUndefined;
    });

    setAllComplete(allKycsComplete);
  }, [kycs]);

  const pageCount = Math.ceil(kycs.length / PAGE_SIZE);
  const paginatedKYCs = kycs.slice((pageNumber - 1) * PAGE_SIZE, (pageNumber - 1) * PAGE_SIZE + PAGE_SIZE);

  // Small utility function for help below
  const getSelectedKyc = (id?: number) => {
    return kycs.find((k) => k.hs_object_id === id);
    // setSelectedKycId(id);
  };

  const selectedKyc = getSelectedKyc(selectedKycId);

  // Small utility function for help below
  const getSelectedApplicationInfo = (id?: number) => {
    return updatedApplicationInfo.find((k) => k.id === id);
  };

  const selectedApplicationInfo = getSelectedApplicationInfo(selectedApplicationInfoId);

  const handleAccountToggle = useCallback(() => {
    setShowAccounts((current) => !current);
  }, []);

  // Set cancel view
  if (showCancel) {
    return (
      <Cancel
        ticket={applicationProps}
        kycs={kycs}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleCancelApplication}
      />
    );
  }

  // Set bank account details view
  if (selectedApplicationInfo && selectedApplicationInfo.name === "Bank Account Details") {
    return (
      <BankAccountDetails
        ticket={applicationProps}
        clients={accountHolders}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Set id verification view
  if (selectedApplicationInfo && selectedApplicationInfo.name === "ID Verification") {
    return (
      <IdVerification
        ticket={applicationProps}
        clients={accountHolders}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Set joint account profile view
  if (selectedApplicationInfo && selectedApplicationInfo.name === "Joint Account Profile") {
    return (
      <JointAccountProfile
        ticket={applicationProps}
        clients={accountHolders}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Set entity account profile view
  if (selectedApplicationInfo && selectedApplicationInfo.name === "Entity Information") {
    return (
      <EntityAccountProfile
        ticket={applicationProps}
        clients={accountHolders}
        kycs={kycs}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Set entity account profile view
  if (selectedApplicationInfo && selectedApplicationInfo.name === "Meeting Details") {
    return (
      <AdditionalQuestions
        ticket={applicationProps}
        clients={accountHolders}
        kycs={kycs}
        context={context}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
        sendAlert={sendAlert}
      />
    );
  }

  // Set delete state
  if (showDelete) {
    return <DeleteView />;
  }

  //Set loading state
  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction="column" gap="md">
      {selectedKyc ? (
        // <Button onClick={handleCancelClick}>Selected KYC</Button>
        <AccountDetails
          kyc={selectedKyc}
          ticketId={ticket.hs_object_id}
          ticket={applicationProps}
          clients={accountHolders}
          context={context}
          runServerless={runServerless}
          onBackClick={handleCancelClick}
          onSaveClick={handleSaveClick}
        />
      ) : (
        <>
          <Flex direction="column" gap="md" justify={"start"}>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"row"} gap={"sm"} justify={"start"} align={"end"}>
                <Button onClick={handleBackClick}>{"< Back"}</Button>
              </Flex>
              {isLicensedUser ? (
                <>
                  <Flex direction={"row"} gap={"xs"} justify={"end"} align={"end"}>
                    {applicationProps && applicationProps.hs_pipeline_stage.value !== "103949234" ? (
                      <>
                        <Button
                          onClick={() => {
                            setShowCancel(true);
                          }}
                          disabled={isCompleted}
                          variant={"destructive"}
                        >
                          {"Cancel"}
                        </Button>
                        <Button onClick={() => console.log("Hi")} disabled={true}>
                          {"Submit"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            setShowCancel(true);
                          }}
                          disabled={isCompleted}
                          variant={"destructive"}
                        >
                          {"Cancel"}
                        </Button>
                        <Button
                          onClick={() => {
                            updateTicket();
                          }}
                          variant={
                            allComplete &&
                            idCompleted &&
                            bankingCompleted &&
                            entityCompleted &&
                            jointCompleted &&
                            meetingDetailsCompleted
                              ? "primary"
                              : "secondary"
                          }
                          disabled={
                            allComplete &&
                            idCompleted &&
                            bankingCompleted &&
                            entityCompleted &&
                            jointCompleted &&
                            meetingDetailsCompleted
                              ? false
                              : true
                          }
                        >
                          {"Submit"}
                        </Button>
                        {/* <Button onClick={() => {updateTicket();}} variant={allComplete && idCompleted && bankingCompleted && meetingDetailsCompleted ? 'primary' : 'secondary'} disabled={false}>{'Submit'}</Button> */}
                      </>
                    )}
                  </Flex>
                </>
              ) : (
                <>
                  <Flex direction={"row"} gap={"md"} justify={"end"} align={"end"}>
                    {applicationProps && applicationProps.hs_pipeline_stage.value !== "103949234" ? (
                      <>
                        <Button onClick={() => console.log("Hi")} disabled={true}>
                          {"Submit"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            updateTicket();
                          }}
                          variant={
                            allComplete &&
                            idCompleted &&
                            bankingCompleted &&
                            entityCompleted &&
                            jointCompleted &&
                            meetingDetailsCompleted
                              ? "primary"
                              : "secondary"
                          }
                          disabled={
                            allComplete &&
                            idCompleted &&
                            bankingCompleted &&
                            entityCompleted &&
                            jointCompleted &&
                            meetingDetailsCompleted
                              ? false
                              : true
                          }
                        >
                          {"Submit"}
                        </Button>
                      </>
                    )}
                  </Flex>
                </>
              )}
            </Flex>
            <Divider />
            <CrmStageTracker
              objectId={ticket.hs_object_id}
              objectTypeId="0-5"
              properties={["createdate", "application_type", "application_id"]}
            />
          </Flex>
          <Accordion title={"Application Information"} size="small" defaultOpen={true}>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"} gap={"md"}>
                <Table bordered={true}>
                  <TableBody>
                    {updatedApplicationInfo.map(({ id, name, description, status }) => {
                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <Flex direction={"row"} justify={"start"}>
                              <Text format={{ fontWeight: "demibold", italic: true }}>
                                {name}
                                <Text variant="microcopy" format={{ italic: true }} inline={false}>
                                  {description}
                                </Text>
                              </Text>
                            </Flex>
                          </TableCell>
                          <TableCell>
                            <Flex direction={"row"} gap={"md"} justify={"end"}>
                              <Box flex={"none"}>
                                <Text format={{ italic: true }} inline={false}>
                                  {status}
                                </Text>
                              </Box>
                            </Flex>
                          </TableCell>
                          <TableCell>
                            <Flex direction={"row"} justify={"end"}>
                              <Button onClick={() => setSelectedApplicationInfoId(id)}>View</Button>
                            </Flex>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Flex>
            </Flex>
          </Accordion>
          <Accordion title={"Account Information"} size="small" defaultOpen={true}>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Flex direction={"column"} gap={"md"}>
                <Table bordered={true}>
                  <TableBody>
                    {updatedKYCs.map(({ hs_object_id, account_type, type, currency, status }) => {
                      return (
                        <TableRow key={hs_object_id}>
                          <TableCell>
                            <Flex direction={"row"} justify={"start"}>
                              <Text format={{ fontWeight: "demibold", italic: true }}>
                                {type.label} {account_type.label}
                                <Text variant="microcopy" format={{ italic: true }} inline={false}>
                                  {currency.label}
                                </Text>
                              </Text>
                            </Flex>
                          </TableCell>
                          <TableCell>
                            <Flex direction={"row"} gap={"md"} justify={"end"}>
                              <Box flex={"none"}>
                                <Text format={{ italic: true }} inline={false}>
                                  {status}
                                </Text>
                              </Box>
                            </Flex>
                          </TableCell>
                          <TableCell>
                            <Flex direction={"row"} justify={"end"}>
                              <Button onClick={() => setSelectedKycId(hs_object_id)}>View</Button>
                            </Flex>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Flex>
            </Flex>
          </Accordion>
        </>
      )}
    </Flex>
  );
};
