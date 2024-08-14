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
  NumberInput,
  DateInput,
  Select,
  Alert,
  ToggleGroup,
  StepIndicator,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@hubspot/ui-extensions";

import { CrmAssociationTable } from "@hubspot/ui-extensions/crm";
import { KycQuestions } from "./accounts/KycQuestions";
import { Model } from "./accounts/Model";

import type { AccountDetailProps, Kyc } from "../types";
import { TransferForm } from "./accounts/TransferForms";
import { RespApplication } from "./accounts/RespApplication";
import { RdspApplication } from "./accounts/RdspApplication";
// import { RrspApplication } from "./accounts/RrspApplication";
import { RrspBeneficiary } from "./accounts/RrspBeneficiary";
import { RifBeneficiary } from "./accounts/RifBeneficiary";
import { InTrustBeneficiary } from "./accounts/InTrustBeneficiary";
import { TfsaBeneficiary } from "./accounts/TfsaBeneficiary";
import { LockedInApplication } from "./accounts/LockedInApplication";
import { SpousalApplication } from "./accounts/SpousalApplication";
// import { ticketProperties } from "../../../../../../../service-module/src/app/extensions/enums/ticketEnums";
import { RifMinimum } from "./accounts/RifMinimum";

export const AccountDetails = ({
  kyc,
  ticketId,
  ticket,
  clients,
  context,
  runServerless,
  fetchCrmObjectProperties,
  onBackClick,
  onSaveClick,
}: AccountDetailProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formProperties, setFormProperties] = useState<Array>([]);
  const [selected, setSelected] = useState(0); // Set selected to conditionally render question set
  const [currentStep, setCurrentStep] = useState(0);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [modelCompleted, setModelCompleted] = useState(false);
  const [beneficiaryCompleted, setBeneficiaryCompleted] = useState(false);
  const [bankAccountCompleted, setBankAccountCompleted] = useState(false);
  const [lockedInCompleted, setLockedInCompleted] = useState(false);
  const [spousalCompleted, setSpousalCompleted] = useState(false);
  const [rifCompleted, setRifCompleted] = useState(false);
  const [idCompleted, setIdCompleted] = useState(false);
  const [transferForms, setTransferForms] = useState("");
  const [updatedKyc, setUpdatedKyc] = useState<Array<Kyc>>([]);
  const [currentKyc, setCurrentKyc] = useState<Object<Kyc>>(kyc);
  const [modelMessage, setModelMessage] = useState("");
  const [hasNull, setHasNull] = useState(false);
  const [propsChanged, setPropsChanged] = useState(false); // Set state variable to indicate whether or not props have been saved in any subview so that kyc data can be re-fetched on backclick

  const showBeneficiary = [
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
    "In Trust",
  ];
  const showLockedIn = ["LIRA", "LRSP", "RLSP", "LIF", "RLIF", "LRIF", "PRIF"];
  const showSpousal = ["Spousal RSP", "Spousal RIF"];
  const showRif = ["RIF", "Spousal RIF", "LIF", "RLIF", "LRIF", "PRIF"];

  // Check for null kyc values
  const checkNullValues = (obj) => {
    const nullKeys = Object.keys(obj).filter((key) => obj[key] === null);

    const anyNull = nullKeys.length === 0;
    return anyNull; // return true if one or more keys have null values
  };

  // Check for null model values
  const checkNullModelValues = (obj) => {
    const nullModelKeys = Object.keys(obj).filter((key) => obj[key] === null);
    return nullModelKeys.length === 0; // return true if one or more keys have null values
  };

  useEffect(() => {
    const allModelProps = Object.entries(currentKyc).every(([key, value]) => {
      if (key != "assigned_model" || key != "model_suitability") {
        return true; // Skip the check for this property
      }
      return value != null;
    });

    const spouseDobRequiredBySpousalCheck = false;
    const spouseDobRequiredByRifCheck = false;

    const kycPortion = { ...currentKyc };

    const modelPortion = { ...currentKyc };

    const bankAccountPortion = { ...currentKyc };

    const idPortion = { ...currentKyc };

    const transferPortion = { ...currentKyc };

    const beneficiaryPortion = { ...currentKyc };

    const lockedInPortion = { ...currentKyc };

    const spousalPortion = { ...currentKyc };

    const rifPortion = { ...currentKyc };

    // Deleting nonmodel keys
    Object.keys(modelPortion).forEach((key) => {
      if (key !== "assigned_model" && key !== "model_suitability") {
        delete modelPortion[key];
      }
    });

    // Deleting nonid keys
    Object.keys(idPortion).forEach((key) => {
      if (
        key !== "verification_method" &&
        key !== "verified_by" &&
        key !== "verification_date" &&
        key !== "id_type" &&
        key !== "id_number" &&
        key !== "id_expiry" &&
        key !== "id_province_state" &&
        key !== "id_country"
      ) {
        delete idPortion[key];
      }
    });

    // Deleting non transfer keys
    Object.keys(transferPortion).forEach((key) => {
      if (key !== "transfers") {
        delete transferPortion[key];
      }
    });

    // Deleting bank account keys
    Object.keys(bankAccountPortion).forEach((key) => {
      if (
        key !== "bank_name" &&
        key !== "bank_institution_number" &&
        key !== "bankaccountnumber" &&
        key !== "bank_transit_number" &&
        key !== "bank_address" &&
        key !== "bank_city" &&
        key !== "bank_province" &&
        key !== "bank_postal_code"
      ) {
        delete bankAccountPortion[key];
      }
    });

    // Deleting non beneficiary keys
    Object.keys(beneficiaryPortion).forEach((key) => {
      if (key !== "beneficiary") {
        delete beneficiaryPortion[key];
      }
    });

    // Deleting non locked in keys
    Object.keys(lockedInPortion).forEach((key) => {
      if (key !== "legislation" && key !== "pension_fund_source") {
        delete lockedInPortion[key];
      }
    });

    if (kycPortion.account_type.label !== "LIF") {
      delete lockedInPortion["pension_fund_source"];
    }

    // Deleting non spousal application keys
    Object.keys(spousalPortion).forEach((key) => {
      if (key !== "spouse_sin" && key !== "spouse_email") {
        delete spousalPortion[key];
      }
    });

    // Deleting non rif minimum keys
    Object.keys(rifPortion).forEach((key) => {
      if (key !== "minimum_calculated_based_on" && key !== "spouse_date_of_birth") {
        delete rifPortion[key];
      }
    });

    if (rifPortion?.minimum_calculated_based_on?.label === "Annuitant") {
      delete rifPortion["spouse_date_of_birth"];
      delete kycPortion["spouse_date_of_birth"];
    }

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
    ];

    // CHANGED TO ADJUST SECONDARY
    if (clients.length === 2) {
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

    for (const key of Object.keys(kycPortion)) {
      if (!allowedKycKeys.includes(key as any)) {
        delete kycPortion[key];
      }
    }

    if (showLockedIn.includes(kycPortion.account_type.label)) {
      const lockedInComp = checkNullValues(lockedInPortion);
      setLockedInCompleted(lockedInComp);
    } else {
      setLockedInCompleted(true);
    }

    if (showBeneficiary.includes(kycPortion.account_type.label)) {
      const beneComp = checkNullValues(beneficiaryPortion);
      setBeneficiaryCompleted(beneComp);
    } else {
      delete kycPortion.beneficiary;
      setBeneficiaryCompleted(true);
    }

    if (showSpousal.includes(kycPortion.account_type.label)) {
      const spousalComp = checkNullValues(spousalPortion);
      setSpousalCompleted(spousalComp);
    } else {
      delete kycPortion.spouse_sin;
      delete kycPortion.spouse_email;
      setSpousalCompleted(true);
    }

    if (showRif.includes(kycPortion.account_type.label)) {
      const rifComp = checkNullValues(rifPortion);
      setRifCompleted(rifComp);
    } else {
      delete kycPortion.minimum_calculated_based_on;
      delete kycPortion.spouse_date_of_birth;
      setRifCompleted(true);
    }

    delete kycPortion.assigned_model; // Delete assigned model
    delete kycPortion.model_suitability; // Delete model stuitability
    delete kycPortion.associations; // Delete associations
    delete kycPortion.transfers; // Delete transfers

    const transferPortionStr = transferPortion.transfers;

    const kycComp = checkNullValues(kycPortion);
    const modelComp = checkNullModelValues(modelPortion);

    setKycCompleted(kycComp);
    setModelCompleted(modelComp);
  }, [currentKyc]);

  useEffect(() => {
    if (kycCompleted && modelCompleted) {
      setModelMessage("Complete");
    }

    if (kycCompleted && !modelCompleted) {
      setModelMessage("Incomplete");
    }

    if (!kycCompleted) {
      setModelMessage("Please complete KYC Questions");
    }
  }, [kycCompleted, modelCompleted]);

  const handleBackClick = propsChanged ? onSaveClick : onBackClick;

  const handleCancelClick = () => {
    setSelected(undefined);
  };

  const handleSaveClick = (updatedProperties) => {
    setSelected(undefined);
    setPropsChanged(true);

    const transformedUpdatedKyc: Partial<Kyc> = Object.keys(updatedProperties).reduce((acc, key) => {
      acc[key] = { label: updatedProperties[key], value: updatedProperties[key] };
      return acc;
    }, {} as Partial<Kyc>);

    const mergedKyc: Kyc = {
      ...currentKyc,
      ...transformedUpdatedKyc,
    };

    setCurrentKyc(mergedKyc);
  };

  if (selected && selected === 1) {
    return (
      <KycQuestions
        kyc={currentKyc}
        clients={clients}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Model Assignment
  if (selected && selected === 2) {
    return (
      <Model
        kyc={currentKyc}
        ticket={ticket}
        clients={clients}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiaries for RESP
  if (selected && selected === 3 && kyc.account_type.label === "RESP") {
    return (
      <RespApplication
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiaries for RDSP
  if (selected && selected === 3 && kyc.account_type.label === "RDSP") {
    return (
      <RdspApplication
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiaries for RRSP
  if (
    selected &&
    selected === 3 &&
    (kyc.account_type.label === "RRSP" ||
      kyc.account_type.label === "Spousal RSP" ||
      kyc.account_type.label === "LIRA" ||
      kyc.account_type.label === "LRSP" ||
      kyc.account_type.label === "RLSP" ||
      kyc.account_type.label === "RSP")
  ) {
    return (
      <RrspBeneficiary
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiaries for RIF
  if (
    selected &&
    selected === 3 &&
    (kyc.account_type.label === "RIF" ||
      kyc.account_type.label === "Spousal RIF" ||
      kyc.account_type.label === "LIF" ||
      kyc.account_type.label === "PRIF" ||
      kyc.account_type.label === "LRIF" ||
      kyc.account_type.label === "RLIF")
  ) {
    return (
      <RifBeneficiary
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiary for In Trust
  if (selected && selected === 3 && kyc.account_type.label === "In Trust") {
    return (
      <InTrustBeneficiary
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Beneficiaries for RIF
  if (selected && selected === 3 && kyc.account_type.label === "TFSA") {
    return (
      <TfsaBeneficiary
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Transfer Forms
  if (selected && selected === 4) {
    return (
      <TransferForm
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Locked In Application
  if (selected && selected === 5) {
    return (
      <LockedInApplication
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Spousal Application
  if (selected && selected === 6) {
    return (
      <SpousalApplication
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  // Render Rif Minimum Application
  if (selected && selected === 7) {
    return (
      <RifMinimum
        kyc={currentKyc}
        ticketId={ticketId}
        runServerless={runServerless}
        onCancelClick={handleCancelClick}
        onSaveClick={handleSaveClick}
      />
    );
  }

  //Set loading state
  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"row"} gap={"md"} justify={"betweem"}>
        <Button onClick={handleBackClick}>{"< Back"}</Button>
      </Flex>
      <Flex direction={"column"} gap={"extra-small"}>
        <Flex direction={"row"} gap={"md"} justify={"betweem"}>
          <Heading>
            {kyc.type.label} {kyc.account_type.label}
          </Heading>
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
                        KYC Questions
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Complete the client's KYC information for this account"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {kycCompleted ? "Complete" : "Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(1)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Model Suitability and Assignment
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Assess the client's KYC information to determine a suitable model"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {modelCompleted ? "Complete" : "Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(2)} disabled={!kycCompleted}>
                        View
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                {showBeneficiary.includes(kyc.account_type.label) ? (
                  <TableRow>
                    <TableCell>
                      <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                        <Text format={{ fontWeight: "demibold" }}>
                          Beneficiary Information
                          <Text variant="microcopy" format={{ italic: true }} inline={false}>
                            {"Specify and provide details on the beneficiaries for this account"}
                          </Text>
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Box flex={"none"}>
                          <Text format={{ italic: true }} inline={false}>
                            {beneficiaryCompleted ? "Complete" : "Incomplete"}
                          </Text>
                        </Box>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        {/* <Button onClick={() => setSelected(3)} disabled={!kycCompleted}>View</Button> */}
                        <Button onClick={() => setSelected(3)} disabed={!kycCompleted}>
                          View
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {showLockedIn.includes(kyc.account_type.label) ? (
                  <TableRow>
                    <TableCell>
                      <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                        <Text format={{ fontWeight: "demibold" }}>
                          Locked In Application
                          <Text variant="microcopy" format={{ italic: true }} inline={false}>
                            {"Specify the legislation details for this account"}
                          </Text>
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Box flex={"none"}>
                          <Text format={{ italic: true }} inline={false}>
                            {lockedInCompleted ? "Complete" : "Incomplete"}
                          </Text>
                        </Box>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Button onClick={() => setSelected(5)} disabled={!kycCompleted}>
                          View
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {showSpousal.includes(kyc.account_type.label) ? (
                  <TableRow>
                    <TableCell>
                      <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                        <Text format={{ fontWeight: "demibold" }}>
                          Spousal Application
                          <Text variant="microcopy" format={{ italic: true }} inline={false}>
                            {"Collect the necessary spousal information for this account"}
                          </Text>
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Box flex={"none"}>
                          <Text format={{ italic: true }} inline={false}>
                            {spousalCompleted ? "Complete" : "Incomplete"}
                          </Text>
                        </Box>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Button onClick={() => setSelected(6)} disabled={!kycCompleted}>
                          View
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {showRif.includes(kyc.account_type.label) ? (
                  <TableRow>
                    <TableCell>
                      <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                        <Text format={{ fontWeight: "demibold" }}>
                          RIF Application
                          <Text variant="microcopy" format={{ italic: true }} inline={false}>
                            {"Collect the necessary information to calculate the annual minimum for this account"}
                          </Text>
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Box flex={"none"}>
                          <Text format={{ italic: true }} inline={false}>
                            {rifCompleted ? "Complete" : "Incomplete"}
                          </Text>
                        </Box>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                        <Button onClick={() => setSelected(7)} disabled={!kycCompleted}>
                          View
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Transfer Forms
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Transfer assets from a delivering institution to this account"}
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
                      <Button onClick={() => setSelected(4)} disabled={!kycCompleted}>
                        View
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
