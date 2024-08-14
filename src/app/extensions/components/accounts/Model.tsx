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
  List,
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
  Checkbox,
} from "@hubspot/ui-extensions";
import type { ModelProps, ModelFormProps, Kyc } from "../../types";

export const Model = ({ kyc, clients, runServerless, onCancelClick, onSaveClick }: ModelProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<ModelFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [modelWarning, setModelWarning] = useState(false);
  const [mismatchedKycCriteria, setMismatchedKycCriteria] = useState([]);
  const [modelApproved, setModelApproved] = useState(true);
  // const [kycProperties, setKycProperties] = useState<Array<Kyc>>([]); // Set form props to update KYC object with information gathered
  // const [intendedUse, setIntendedUse] = useState<string>(kyc.intended_use_of_account.label);
  // const [sourceOfFunds, setSourceOfFunds] = useState<string>(kyc.source_of_funds.label);
  const [validationMessage, setValidationMessage] = useState("");
  // const [kycId, setKycId] = useState(0);
  const [experienceString, setExperienceString] = useState("");
  const [modelSuitabilityString, setModelSuitabilityString] = useState("");
  const [summaryModelSutability, setSummaryModelSutability] = useState("");

  // Helper function to validate investment experience
  const validateInvestmentExperience = (investmentExperiences, option) => {
    // Check for single unacceptable experiences
    if (investmentExperiences.length === 1) {
      const experience = investmentExperiences[0].value;
      if (
        option === "Optimize All Growth Portfolio" &&
        [
          "None",
          "Bonds",
          "Mutual Funds",
          "Real Estate",
          "Stocks",
          "Derivatives, Options, Futures, or Currency Trading",
        ].includes(experience)
      ) {
        return true;
      }

      if (option === "Optimize Growth Balanced Portfolio" && ["None", "Bonds", "Real Estate"].includes(experience)) {
        return true;
      }

      if (option === "Optimize Balanced Growth Portfolio" && ["None", "Bonds"].includes(experience)) {
        return true;
      }

      if (option === "Optimize Income Balanced Portfolio" && ["None", "Bonds"].includes(experience)) {
        return true;
      }

      return false;
    }

    // Unacceptable combinations of investment experience
    const unacceptableCombinations = {
      "Optimize All Growth Portfolio": [
        ["Bonds", "Mutual Funds"],
        ["Bonds", "Real Estate"],
        ["Bonds", "Derivatives, Options, Futures, or Currency Trading"],
        ["Mutual Funds", "Real Estate"],
        ["Real Estate", "Stocks"],
        ["Real Estate", "Derivatives, Options, Futures, or Currency Trading"],
        ["Bonds", "Mutual Funds", "Real Estate"],
        ["Bonds", "Real Estate", "Derivatives, Options, Futures, or Currency Trading"],
      ],
      "Optimize Growth Balanced Portfolio": [["Bonds", "Mutual Funds"]],
    };

    // Check unacceptable combinations for models that have unacceptable combinations in the framework
    if (option === "Optimize All Growth Portfolio" || option === "Optimize Growth Balanced Portfolio") {
      // Normalize user experiences
      const normalizedInvestmentExperiences = investmentExperiences.map((exp) => exp.value).sort();

      // Check against each unacceptable combination
      return unacceptableCombinations[option].some((unacceptable) => {
        if (unacceptable.length !== normalizedInvestmentExperiences.length) {
          return false;
        }
        return unacceptable.every((exp, index) => exp === normalizedInvestmentExperiences[index]);
      });
    }

    return false;
  };

  const validateModel = (option) => {
    // Reset warning state
    setModelWarning(false);

    let mismatches = [];

    if (kyc.type.label === "Entity") {
      // Conditions for Optimize All Growth Portfolio
      if (option === "Optimize All Growth Portfolio") {
        if (Number(kyc.entity_income || 0) < 75000.0) mismatches.push("Entity Income");
        if (
          Number(kyc.entity_cash || 0) +
            Number(kyc.entity_registered_investments || 0) +
            Number(kyc.entity_non_registered_investments || 0) +
            Number(kyc.entity_fixed_assets || 0) -
            Number(kyc.entity_mortgages_and_other_liabilities || 0) <
          200000.0
        )
          mismatches.push("Entity Net Worth");

        // Age
        if (clients.length === 2) {
          if (getAge(kyc.date_of_birth) >= 70 && getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
            mismatches.push(`Age (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (getAge(kyc.date_of_birth) >= 70) {
            mismatches.push(`Age (${kyc.firstname})`);
          } else if (getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
            mismatches.push(`Age (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (getAge(kyc.date_of_birth) >= 70) {
            mismatches.push(`Age`);
          } else {
            // Pass
          }
        }

        // Investment Knowledge
        if (clients.length === 2) {
          if (
            ["None", "Beginner"].includes(kyc.investment_knowledge.label) &&
            ["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)
          ) {
            mismatches.push(`Investment Knowledge (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
            mismatches.push(`Investment Knowledge (${kyc.firstname})`);
          } else if (["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)) {
            mismatches.push(`Investment Knowledge (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
            mismatches.push(`Investment Knowledge`);
          } else {
            // Pass
          }
        }

        // Investment Experience
        if (clients.length === 2) {
          if (
            validateInvestmentExperience(kyc.investment_experience, option) &&
            validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
          ) {
            mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname})`);
          } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience`);
          } else {
            // Pass
          }
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years", "5 - 10 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Minimal to moderate", "Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label))
          mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Growth Balanced Portfolio
      if (option === "Optimize Growth Balanced Portfolio") {
        if (Number(kyc.entity_income || 0) < 20000.0) mismatches.push("Entity Income");
        if (
          Number(kyc.entity_cash || 0) +
            Number(kyc.entity_registered_investments || 0) +
            Number(kyc.entity_non_registered_investments || 0) +
            Number(kyc.entity_fixed_assets || 0) -
            Number(kyc.entity_mortgages_and_other_liabilities || 0) <
          200000.0
        )
          mismatches.push("Entity Net Worth");

        // Age
        if (clients.length === 2) {
          if (getAge(kyc.date_of_birth) >= 70 && getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
            mismatches.push(`Age (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (getAge(kyc.date_of_birth) >= 70) {
            mismatches.push(`Age (${kyc.firstname})`);
          } else if (getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
            mismatches.push(`Age (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (getAge(kyc.date_of_birth) >= 70) {
            mismatches.push(`Age`);
          } else {
            // Pass
          }
        }

        // Investment Knowledge
        if (clients.length === 2) {
          if (
            ["None", "Beginner"].includes(kyc.investment_knowledge.label) &&
            ["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)
          ) {
            mismatches.push(`Investment Knowledge (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
            mismatches.push(`Investment Knowledge (${kyc.firstname})`);
          } else if (["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)) {
            mismatches.push(`Investment Knowledge (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
            mismatches.push(`Investment Knowledge`);
          } else {
            // Pass
          }
        }

        // Investment Experience
        if (clients.length === 2) {
          if (
            validateInvestmentExperience(kyc.investment_experience, option) &&
            validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
          ) {
            mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname})`);
          } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience`);
          } else {
            // Pass
          }
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Balanced Growth Portfolio
      if (option === "Optimize Balanced Growth Portfolio") {
        // Investment Experience
        if (clients.length === 2) {
          if (
            validateInvestmentExperience(kyc.investment_experience, option) &&
            validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
          ) {
            mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname})`);
          } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience`);
          } else {
            // Pass
          }
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Income Balanced Portfolio
      if (option === "Optimize Income Balanced Portfolio") {
        // Investment Experience
        if (clients.length === 2) {
          if (
            validateInvestmentExperience(kyc.investment_experience, option) &&
            validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
          ) {
            mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
          } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname})`);
          } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
            mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
          } else {
            // Pass
          }
        } else {
          if (validateInvestmentExperience(kyc.investment_experience, option)) {
            mismatches.push(`Investment Experience`);
          } else {
            // Pass
          }
        }

        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
      }

      // Conditions for Optimize Income Portfolio
      if (option === "Optimize Income Portfolio") {
        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }

      // Conditions for Optimize Money Market Portfolio
      if (option === "Optimize Money Market Portfolio") {
        if (["5 - 10 years", "11 - 15 years", "More than 15 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }
    }

    // Validate Jointly-Held Non-Entity Accounts
    if (kyc.type.label === "Joint") {
      // Conditions for Optimize All Growth Portfolio
      if (option === "Optimize All Growth Portfolio") {
        // Employment Status
        if (
          ["Not Employed", "Retired"].includes(kyc.investment_knowledge.label) &&
          ["Not Employed", "Retired"].includes(kyc.investment_knowledge__secondary_account_holder_.label)
        ) {
          mismatches.push(`Employment Status (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (["Not Employed", "Retired"].includes(kyc.investment_knowledge.label)) {
          mismatches.push(`Employment Status (${kyc.firstname})`);
        } else if (["Not Employed", "Retired"].includes(kyc.investment_knowledge__secondary_account_holder_.label)) {
          mismatches.push(`Employment Status (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Income
        if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
            75000.0 &&
          Number(kyc.employment_income_secondary || 0) +
            Number(kyc.disability_or_ei_secondary || 0) +
            Number(kyc.company_pension_secondary || 0) +
            Number(kyc.cpp_income_secondary || 0) +
            Number(kyc.oas_income_secondary || 0) +
            Number(kyc.investment_withdrawals_secondary || 0) +
            Number(kyc.bank_withdrawals_secondary || 0) +
            Number(kyc.other_income__secondary_account_holder_ || 0) <
            75000.0
        ) {
          mismatches.push(`Income (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
          75000.0
        ) {
          mismatches.push(`Income (${kyc.firstname})`);
        } else if (
          Number(kyc.employment_income_secondary || 0) +
            Number(kyc.disability_or_ei_secondary || 0) +
            Number(kyc.company_pension_secondary || 0) +
            Number(kyc.cpp_income_secondary || 0) +
            Number(kyc.oas_income_secondary || 0) +
            Number(kyc.investment_withdrawals_secondary || 0) +
            Number(kyc.bank_withdrawals_secondary || 0) +
            Number(kyc.other_income__secondary_account_holder_ || 0) <
          75000.0
        ) {
          mismatches.push(`Income (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Net Worth
        if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
            200000.0 &&
          Number(kyc.cash_secondary || 0) +
            Number(kyc.registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.fixed_assets_secondary || 0) -
            Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
            Number(kyc.other_investments__secondary_account_holder_ || 0) <
            200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
          200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname})`);
        } else if (
          Number(kyc.cash_secondary || 0) +
            Number(kyc.registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.fixed_assets_secondary || 0) -
            Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
            Number(kyc.other_investments__secondary_account_holder_ || 0) <
          200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Age
        if (getAge(kyc.date_of_birth) >= 70 && getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
          mismatches.push(`Age (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (getAge(kyc.date_of_birth) >= 70) {
          mismatches.push(`Age (${kyc.firstname})`);
        } else if (getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
          mismatches.push(`Age (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Investment Knowledge
        if (
          ["None", "Beginner"].includes(kyc.investment_knowledge.label) &&
          ["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)
        ) {
          mismatches.push(`Investment Knowledge (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
          mismatches.push(`Investment Knowledge (${kyc.firstname})`);
        } else if (["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)) {
          mismatches.push(`Investment Knowledge (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Investment Experience
        if (
          validateInvestmentExperience(kyc.investment_experience, option) &&
          validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
        ) {
          mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname})`);
        } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years", "5 - 10 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Minimal to moderate", "Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label))
          mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Growth Balanced Portfolio
      if (option === "Optimize Growth Balanced Portfolio") {
        // Income
        if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
            20000.0 &&
          Number(kyc.employment_income_secondary || 0) +
            Number(kyc.disability_or_ei_secondary || 0) +
            Number(kyc.company_pension_secondary || 0) +
            Number(kyc.cpp_income_secondary || 0) +
            Number(kyc.oas_income_secondary || 0) +
            Number(kyc.investment_withdrawals_secondary || 0) +
            Number(kyc.bank_withdrawals_secondary || 0) +
            Number(kyc.other_income__secondary_account_holder_ || 0) <
            20000.0
        ) {
          mismatches.push(`Income (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
          20000.0
        ) {
          mismatches.push(`Income (${kyc.firstname})`);
        } else if (
          Number(kyc.employment_income_secondary || 0) +
            Number(kyc.disability_or_ei_secondary || 0) +
            Number(kyc.company_pension_secondary || 0) +
            Number(kyc.cpp_income_secondary || 0) +
            Number(kyc.oas_income_secondary || 0) +
            Number(kyc.investment_withdrawals_secondary || 0) +
            Number(kyc.bank_withdrawals_secondary || 0) +
            Number(kyc.other_income__secondary_account_holder_ || 0) <
          20000.0
        ) {
          mismatches.push(`Income (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Net Worth
        if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
            200000.0 &&
          Number(kyc.cash_secondary || 0) +
            Number(kyc.registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.fixed_assets_secondary || 0) -
            Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
            Number(kyc.other_investments__secondary_account_holder_ || 0) <
            200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
          200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname})`);
        } else if (
          Number(kyc.cash_secondary || 0) +
            Number(kyc.registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
            Number(kyc.fixed_assets_secondary || 0) -
            Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
            Number(kyc.other_investments__secondary_account_holder_ || 0) <
          200000.0
        ) {
          mismatches.push(`Net Worth (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Age
        if (getAge(kyc.date_of_birth) >= 70 && getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
          mismatches.push(`Age (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (getAge(kyc.date_of_birth) >= 70) {
          mismatches.push(`Age (${kyc.firstname})`);
        } else if (getAge(kyc.date_of_birth__secondary_account_holder_) >= 70) {
          mismatches.push(`Age (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Investment Knowledge
        if (
          ["None", "Beginner"].includes(kyc.investment_knowledge.label) &&
          ["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)
        ) {
          mismatches.push(`Investment Knowledge (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) {
          mismatches.push(`Investment Knowledge (${kyc.firstname})`);
        } else if (["None", "Beginner"].includes(kyc.investment_knowledge__secondary_account_holder_.label)) {
          mismatches.push(`Investment Knowledge (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        // Investment Experience
        if (
          validateInvestmentExperience(kyc.investment_experience, option) &&
          validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
        ) {
          mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname})`);
        } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Balanced Growth Portfolio
      if (option === "Optimize Balanced Growth Portfolio") {
        // Investment Experience
        if (
          validateInvestmentExperience(kyc.investment_experience, option) &&
          validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
        ) {
          mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname})`);
        } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Income Balanced Portfolio
      if (option === "Optimize Income Balanced Portfolio") {
        // Investment Experience
        if (
          validateInvestmentExperience(kyc.investment_experience, option) &&
          validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)
        ) {
          mismatches.push(`Investment Experience (${kyc.firstname} and ${kyc.firstname_secondary})`);
        } else if (validateInvestmentExperience(kyc.investment_experience, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname})`);
        } else if (validateInvestmentExperience(kyc.investment_experience__secondary_account_holder_, option)) {
          mismatches.push(`Investment Experience (${kyc.firstname_secondary})`);
        } else {
          // Pass
        }

        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
      }

      // Conditions for Optimize Income Portfolio
      if (option === "Optimize Income Portfolio") {
        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }

      // Conditions for Optimize Money Market Portfolio
      if (option === "Optimize Money Market Portfolio") {
        if (["1 - 4 years", "5 - 10 years", "11 - 15 years", "More than 15 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }
    }

    // Validate Individual Accounts
    if (kyc.type.label === "Individual") {
      // Conditions for Optimize All Growth Portfolio
      if (option === "Optimize All Growth Portfolio") {
        if (["Not Employed", "Retired"].includes(kyc.employment_status.label)) mismatches.push("Employment Status");
        if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
          75000.0
        )
          mismatches.push("Income");
        if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
          200000.0
        )
          mismatches.push("Net Worth");
        if (getAge(kyc.date_of_birth) >= 70) mismatches.push("Age");
        if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) mismatches.push("Investment Knowledge");
        if (validateInvestmentExperience(kyc.investment_experience, option)) mismatches.push("Investment Experience");
        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years", "5 - 10 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Minimal to moderate", "Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label))
          mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Growth Balanced Portfolio
      if (option === "Optimize Growth Balanced Portfolio") {
        if (
          Number(kyc.employment_income || 0) +
            Number(kyc.disability_or_ei || 0) +
            Number(kyc.company_pension || 0) +
            Number(kyc.cpp_income || 0) +
            Number(kyc.oas_income || 0) +
            Number(kyc.investment_withdrawals || 0) +
            Number(kyc.bank_withdrawals || 0) +
            Number(kyc.other_income || 0) <
          20000.0
        )
          mismatches.push("Income");
        if (
          Number(kyc.cash || 0) +
            Number(kyc.registered_investments || 0) +
            Number(kyc.non_registered_investments || 0) +
            Number(kyc.fixed_assets || 0) -
            Number(kyc.mortgages_and_other_liabilities || 0) +
            Number(kyc.other_investments || 0) <
          200000.0
        )
          mismatches.push("Net Worth");
        if (getAge(kyc.date_of_birth) >= 70) mismatches.push("Age");
        if (["None", "Beginner"].includes(kyc.investment_knowledge.label)) mismatches.push("Investment Knowledge");
        if (validateInvestmentExperience(kyc.investment_experience, option)) mismatches.push("Investment Experience");
        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Balanced Growth Portfolio
      if (option === "Optimize Balanced Growth Portfolio") {
        if (validateInvestmentExperience(kyc.investment_experience, option)) mismatches.push("Investment Experience");
        if (["Short term savings for a specific purpose"].includes(kyc.intended_use_of_account.label))
          mismatches.push("Intended Use of Account");
        if (["Less than a year", "1 - 4 years"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on income, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low", "Low / Medium"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low", "Low / Medium"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
        if (["Moderate", "Moderate to high"].includes(kyc.liquidity_needs.label)) mismatches.push("Liquidity Needs");
      }

      // Conditions for Optimize Income Balanced Portfolio
      if (option === "Optimize Income Balanced Portfolio") {
        if (validateInvestmentExperience(kyc.investment_experience, option)) mismatches.push("Investment Experience");
        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on generating income with lower levels of volatility",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
        if (["Low"].includes(kyc.risk_tolerance.label)) mismatches.push("Risk Tolerance");
        if (["Low"].includes(kyc.risk_capacity.label)) mismatches.push("Risk Capacity");
      }

      // Conditions for Optimize Income Portfolio
      if (option === "Optimize Income Portfolio") {
        if (["Less than a year"].includes(kyc.time_horizon.label)) mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }

      // Conditions for Optimize Money Market Portfolio
      if (option === "Optimize Money Market Portfolio") {
        if (["1 - 4 years", "5 - 10 years", "11 - 15 years", "More than 15 years"].includes(kyc.time_horizon.label))
          mismatches.push("Time Horizon");
        if (
          [
            "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
            "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment retur",
            "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
          ].includes(kyc.investment_objective.label)
        )
          mismatches.push("Investment Objective");
      }
    }

    if (mismatches.length > 0) {
      setModelWarning(true);
    }

    setMismatchedKycCriteria(mismatches);
  };

  useEffect(() => {
    const experienceLabels = kyc?.investment_experience.map((obj) => obj.label);
    const formattedString =
      experienceLabels?.length > 1
        ? `${experienceLabels?.slice(0, -1).join(", ")} and ${experienceLabels?.slice(-1)}`
        : experienceLabels[0] || "";
    setExperienceString(formattedString);
    if (kyc && kyc?.assigned_model && kyc?.assigned_model?.value) {
      validateModel(kyc?.assigned_model?.value);
    }
  }, []);

  useEffect(() => {
    if (kyc) {
      const getValue = (property) => {
        if (property === "assigned_model") {
          return formProperties[property] || kyc[property]?.value || "";
        }
        return formProperties[property]?.toLowerCase() || kyc[property]?.value?.toLowerCase() || "";
      };
      let updatedInvestmentObjective = "";
      const investmentObjective = getValue("investment_objective");

      if (
        investmentObjective ===
        "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return"
      ) {
        updatedInvestmentObjective = "a focus on balancing income and growth";
      } else if (investmentObjective === "A focus on generating income with lower levels of volatility") {
        updatedInvestmentObjective = "a focus on generating income";
      } else if (
        investmentObjective ===
        "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this"
      ) {
        updatedInvestmentObjective = "a focus on seeking maximum asset growth";
      } else if (
        investmentObjective === "A focus on income, and you can tolerate some fluctuation in your investment return"
      ) {
        updatedInvestmentObjective = "a focus on income";
      } else if (
        investmentObjective ===
        "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return"
      ) {
        updatedInvestmentObjective = "a focus on seeking better-than-average growth";
      }

      setSummaryModelSutability(
        `Time horizon is ${getValue(
          "time_horizon"
        )}, investment objective is ${updatedInvestmentObjective}, risk profile is ${getValue(
          "risk_tolerance"
        )} and liquidity needs are ${getValue("liquidity_needs")}. Therefore, the ${getValue(
          "assigned_model"
        )} is suitable.`
      );
    }
  }, [kyc, formProperties]);

  const getExperienceString = (experience) => {
    // Map the array of investment experience objects to an array of labels
    const experienceLabels = experience.map((obj) => obj.label);

    // Format the array into a single string
    const formattedString =
      experienceLabels.length > 1
        ? `${experienceLabels.slice(0, -1).join(", ")} and ${experienceLabels.slice(-1)}`
        : experienceLabels[0] || "";

    return formattedString;
  };

  useEffect(() => {
    if (formProperties && formProperties.assigned_model) {
      let reason = `Based on your assessment of the client\'s risk profile and overall financial situation, please explain why the ${formProperties.assigned_model} is the most suitable recommendation for this account.`;
      setModelSuitabilityString(reason);
    } else if (kyc && kyc.assigned_model && kyc.assigned_model.label) {
      let reason = `Based on your assessment of the client\'s risk profile and overall financial situation, please explain why the ${kyc.assigned_model.label} is the most suitable recommendation for this account.`;
      setModelSuitabilityString(reason);
    } else {
      let reason =
        "Based on your assessment of the client's risk profile and overall financial situation, please explain why the assigned model is the most suitable recommendation for this account.";
      setModelSuitabilityString(reason);
    }
  }, [formProperties, kyc]);

  const updateKyc = () => {
    setLoading(true);
    // setKycId(kyc.hs_object_id);
    const kycId = kyc.hs_object_id;
    runServerless({
      name: "updateKycProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, kycId }, // Send update form properties to update the kyc
    }).then((resp) => {
      setLoading(false);
      if (resp.status === "SUCCESS") {
        const status = resp.response;
        console.log(status);
        onSaveClick(formProperties);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  const getAge = (dateOfBirth) => {
    const offsetUTC = new Date().getTimezoneOffset() / 60; // Local time zone offset in hours
    const offsetEST = 5; // EST is UTC-5
    const offsetToApply = (offsetUTC + offsetEST) * 60 * 60 * 1000; // Convert to milliseconds

    const clientBirthDate = new Date(dateOfBirth + offsetToApply);

    const currentDate = new Date();

    //Calculate age
    let age = currentDate.getFullYear() - clientBirthDate.getFullYear();

    // Adjust age if birthday hasn't occured yet this year
    if (
      currentDate.getMonth() < clientBirthDate.getMonth() ||
      (currentDate.getMonth() === clientBirthDate.getMonth() && currentDate.getDate() < clientBirthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getValue = () => {
    if (formProperties && formProperties.assigned_model) {
      const value = formProperties["assigned_model"];
      return value;
    } else if (kyc && kyc.assigned_model) {
      const value = kyc["assigned_model"];
      return value.label;
    } else {
      return "";
    }
  };

  const getCheckValue = () => {
    try {
      if (formProperties && formProperties.model_overridden) {
        return formProperties["model_overridden"] === "Yes";
      } else if (kyc && kyc.model_overridden) {
        return kyc["model_overridden"].label === "Yes";
      } else {
        return false;
      }
    } catch (error: any) {
      console.error("An error occured:", error.message);
      return false; // Return false in case of an error
    }
  };

  useEffect(() => {
    const isChecked = getCheckValue();
    setModelApproved(isChecked);
  }, [formProperties, kyc]);

  useEffect(() => {
    const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

    const assignedModelExists = kyc?.assigned_model || formProperties?.assigned_model;
    const modelSuitabilityExists = kyc?.model_suitability || formProperties?.model_suitability;
    const modelIsSuitable = (modelWarning && modelApproved) || !modelWarning;
    const suitabilityIsLongEnough = !error;
    const formPropertiesNotEmpty = !isObjectEmpty(formProperties);

    setDisabled(
      !(
        assignedModelExists &&
        modelSuitabilityExists &&
        modelIsSuitable &&
        suitabilityIsLongEnough &&
        formPropertiesNotEmpty
      )
    );
  }, [formProperties, kyc, modelWarning, modelApproved, error]);

  const getIncomeValues = () => {
    if (kyc.type.label === "Entity") {
      const incomeString = `${Number(kyc.entity_income || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`;
      return incomeString;
    }

    return `${(
      Number(kyc.employment_income || 0) +
      Number(kyc.disability_or_ei || 0) +
      Number(kyc.company_pension || 0) +
      Number(kyc.cpp_income || 0) +
      Number(kyc.oas_income || 0) +
      Number(kyc.investment_withdrawals || 0) +
      Number(kyc.bank_withdrawals || 0) +
      Number(kyc.other_income || 0)
    ).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
  };

    const getNetWorthValues = () => {
      if (kyc.type.label === "Entity" && kyc.entity_name) {
        const netWorthString = `${(
          Number(kyc.entity_cash || 0) +
          Number(kyc.entity_registered_investments || 0) +
          Number(kyc.entity_non_registered_investments || 0) +
          Number(kyc.entity_fixed_assets || 0) -
          Number(kyc.entity_mortgages_and_liabilities || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.entity_name})`;
        return netWorthString;
      }

      if (kyc.type.label === "Entity") {
        const netWorthString = `${(
          Number(kyc.entity_cash || 0) +
          Number(kyc.entity_registered_investments || 0) +
          Number(kyc.entity_non_registered_investments || 0) +
          Number(kyc.entity_fixed_assets || 0) -
          Number(kyc.entity_mortgages_and_liabilities || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (Entity)`;
        return netWorthString;
      }

      if (clients.length === 2) {
        const netWorthString = `${(
          Number(kyc.cash || 0) +
          Number(kyc.registered_investments || 0) +
          Number(kyc.non_registered_investments || 0) +
          Number(kyc.fixed_assets || 0) -
          Number(kyc.mortgages_and_other_liabilities || 0) +
          Number(kyc.other_investments || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.firstname}); ${(
          Number(kyc.cash_secondary || 0) +
          Number(kyc.registered_investments__secondary_account_holder_ || 0) +
          Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
          Number(kyc.fixed_assets_secondary || 0) -
          Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
          Number(kyc.other_investments__secondary_account_holder_ || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.firstname_secondary})`;
        return netWorthString;
      }

      return `${(
        Number(kyc.cash || 0) +
        Number(kyc.registered_investments || 0) +
        Number(kyc.non_registered_investments || 0) +
        Number(kyc.fixed_assets || 0) -
        Number(kyc.mortgages_and_other_liabilities || 0) +
        Number(kyc.other_investments || 0)
      ).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
    };

    const getFinancialAssetValues = () => {
      if (kyc.type.label === "Entity" && kyc.entity_name) {
        const netWorthString = `${(
          Number(kyc.entity_cash || 0) +
          Number(kyc.entity_registered_investments || 0) +
          Number(kyc.entity_non_registered_investments || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.entity_name})`;
        return netWorthString;
      }

      if (kyc.type.label === "Entity") {
        const netWorthString = `${(
          Number(kyc.entity_cash || 0) +
          Number(kyc.entity_registered_investments || 0) +
          Number(kyc.entity_non_registered_investments || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (Entity)`;
        return netWorthString;
      }

      if (clients.length === 2) {
        const netWorthString = `${(
          Number(kyc.cash || 0) +
          Number(kyc.registered_investments || 0) +
          Number(kyc.non_registered_investments || 0) +
          Number(kyc.other_investments || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.firstname}); ${(
          Number(kyc.cash_secondary || 0) +
          Number(kyc.registered_investments__secondary_account_holder_ || 0) +
          Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
          Number(kyc.other_investments__secondary_account_holder_ || 0)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${kyc.firstname_secondary})`;
        return netWorthString;
      }

      return `${(
        Number(kyc.cash || 0) +
        Number(kyc.registered_investments || 0) +
        Number(kyc.non_registered_investments || 0) +
        Number(kyc.other_investments || 0)
      ).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
    };

    // Description for investment knowledge
    const knowledgeDescriptions = {
      None: "The client is band new to investing, and has no knowledge of financial markets or investments.",
      Beginner:
        "The client is new to investing and / or they have a limited knowledge of financial markets and investments.",
      Moderate: "The client has good knowledge of financial markets and investments.",
      Advanced: "The client has a string knowledge of financial markets and investments.",
      Expert: "The client has sophisticated knowledge of financial markets and investments.",
    };

    // Description for investment knowledge
    const objectiveDescriptions = {
      "A focus on generating income with lower levels of volatility":
        "In terms of the client's expected long-term return and the risk level that they are prepared to bear, the client's primary investment objective for this account is to focus on income-oriented investments that have low levels of volatility.",
      "A focus on income, and you can tolerate some fluctuation in your investment return":
        "In terms of the client's expected long-term return and the risk level that they are prepared to bear, the client's primary investment objective for this account is to focus on income-oriented investments while achieving modest capital growth.",
      "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return":
        "In terms of the client's expected long-term return and the risk level that they are prepared to bear, the client's primary investment objective for this account is to achieve balanced growth within their portfolio.",
      "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return":
        "In terms of the client's expected long-term return and the risk level that they are prepared to bear, the client's primary investment objective for this account is to achieve better-than-average asset growth.",
      "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this":
        "In terms of the client's expected long-term return and the risk level that they are prepared to bear, the client's primary investment objective for this account is to achieve maximum asset growth.",
    };

    // Description for investment knowledge
    const intendedUseDescriptions = {
      "Saving for a Specific Purchase":
        "The client's intended use for this account is to save for a specific purchase.",
      "Education Savings": "The client's intended use for this account is save for education.",
      "Saving for Retirement": "The client's intended use for this account is saving for retirement.",
      "Funding Retirement":
        "The client's intended use for this account is to fund their retirement and / or supplementing their income in retirement.",
      "Estate Planning":
        "The client's intended use for this account is estate planning, and leaving the assets to their family or other beneficiaries.",
    };

    // Provide descriptions for liquidity options
    const liquidityDescriptions = {
      "None": "0% on an annual basis",
      "Minimal": "Less than 5% on an annual basis",
      "Minimal to moderate": "5% - 10% on an annual basis",
      "Moderate": "11% - 15% on an annual basis",
      "Moderate to high": "More than 15% on an annual basis",
    };

    // Provide descriptions for risk tolerance options
    const riskToleranceDescriptions = {
      "Low": "Cut your losses and sell",
      "Low / Medium": "Hold on but monitor the situation carefully",
      "Medium": "Do nothing and stick with the investment plan you have in place",
      "Medium / High": "Increase exposure to growth oriented investments",
      "High": "Use the opportunity to put new money to work",
    };

    // Provide descriptions for risk capacity options
    const riskCapacityDescriptions = {
      "Low":
        "They cannot afford to withstand a moderate decline in their portfolio over any market cycle before there is an impact on their lifestyle. They require these funds to substantially support their day-to-day living costs and / or will soon need to draw substantial funds from their portfolio.",
      "Low / Medium":
        "They are able to withstand some volatility and decline in their account. They understand their portolio is invested for the long term and minor fluctuations will not impact their required cashflow or investment objectives.",
      "Medium":
        "They could withstand a decline within their portfolio of up to 20% with no material impact on their lifestyle. They have a sufficient time horizon and / or other resources and income sources to withstand a market downturn.",
      "Medium / High":
        "They understand that investments have risk and by taking increased risk, their investments could grow substantially. However, they could also experience a significant decline in their portfolio. They have a sufficient time horizon and / or other resources and income sources that they could draw upon it necessary.",
      "High":
        "They are able to take on extreme risk in the hopes of aggressively growing their portfolio. Even if they experienced a substantial decline of their Optimize portfolio, they have a sufficient time horizon and / or other resources and income sources to sustain their lifestyle.",
    };

    // Define liquidity options
    const liquidityOptions = ["None", "Minimal", "Minimal to moderate", "Moderate", "Moderate to high"].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (kyc && kyc.liquidity_needs && kyc.liquidity_needs.label === n) ? true : false,
      description: liquidityDescriptions[n],
    }));

    // Provide descriptions for risk capacity options
    const modelDescriptions = {
      "Optimize All Growth Portfolio": "An equity-oriented portfolio focused on maximizing asset growth.",
      "Optimize Growth Balanced Portfolio":
        "A portfolio with a focus on equity-oriented investments with better-than-average asset growth potential.",
      "Optimize Balanced Growth Portfolio": "A portfolio focused on achieving balanced growth.",
      "Optimize Income Balanced Portfolio":
        "A portfolio with a focus on income-oriented investments and moderate levels of capital growth.",
      "Optimize Income Portfolio": "An income-oriented portfolio with low levels of overall volatility.",
      "Optimize Money Market Portfolio": "A money market portfolio focused on principal protection.",
    };

    // Define model options
    const modelOptions = [
      "Optimize All Growth Portfolio",
      "Optimize Growth Balanced Portfolio",
      "Optimize Balanced Growth Portfolio",
      "Optimize Income Balanced Portfolio",
      "Optimize Income Portfolio",
      "Optimize Money Market Portfolio",
    ].map((n) => ({
      label: n,
      value: n,
      description: modelDescriptions[n],
    }));

    // Define risk tolerance options
    const riskToleranceOptions = ["Low", "Low / Medium", "Medium", "Medium / High", "High"].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (kyc && kyc.risk_tolerance && kyc.risk_tolerance.label === n) ? true : false,
      description: riskToleranceDescriptions[n],
      initialIsChecked: false,
    }));

    // Define risk capacity options
    const riskCapacityOptions = ["Low", "Low / Medium", "Medium", "Medium / High", "High"].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (kyc && kyc.risk_capacity && kyc.risk_capacity.label === n) ? true : false,
      description: riskCapacityDescriptions[n],
      initialIsChecked: false,
    }));

    // Define time horizon options
    const timeHorizonOptions = [
      "Less than a Year",
      "1 - 4 Years",
      "5 - 10 Years",
      "11 - 15 Years",
      "More than 15 Years",
    ].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (kyc && kyc.time_horizon && kyc.time_horizon.label === n) ? true : false,
    }));

    // Define intended of account use options
    const intendedUseOptions = [
      "Saving for a Specific Purchase",
      "Education Savings",
      "Saving for Retirement",
      "Funding Retirement",
      "Estate Planning",
    ].map((o) => ({
      label: `${o}`,
      value: `${o}`,
      // initialIsChecked: o === intendedUse ? true : false,
      description:
        o === "Saving for a Specific Purchase" ? "e.g. downpayment on a property, car purchase, renovations, etc." : "",
      readonly: kyc && kyc.employment_status && kyc.employment_status.label === o ? true : false,
    }));

    // Define investment objective options
    const objectiveOptions = [
      "A focus on generating income with lower levels of volatility",
      "A focus on income, and you can tolerate some fluctuation in your investment return",
      "A focus on balancing income and growth, and you can tolerate some fluctuation in your investment return",
      "A focus on seeking better-than-average growth, and you can tolerate fluctuation in your investment return",
      "A focus on seeking maximum asset growth, and you can tolerate higher volatility in your investment return to achieve this",
    ].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (kyc && kyc.investment_objective && kyc.investment_objective.label === n) ? true : false,
    }));

    // Define source of funds options
    const sourceOptions = ["Income", "Savings", "Inheritance", "Gift", "Other"].map((n) => ({
      label: n,
      value: n,
      // initialIsChecked: (formProperties && formProperties.source_of_funds === n) ? true : false,
    }));

    const bianaryOptions = ["Yes", "No"].map((n) => ({
      label: n,
      value: n,
    }));

    return (
      <Flex direction={"column"} gap={"md"}>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"column"} gap={"extra-small"}>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Heading>Model and Suitability Assessment</Heading>
          </Flex>
          <Divider distance="sm" />
          <Tile>
            <Flex direction={"column"} gap={"large"}>
              <Flex direction={"column"} gap={"sm"}>
                <Heading>Client Risk Profile</Heading>
                <Text variant="microcopy" format={{ italic: true }}>
                  Based on the information collected from the answers provided to you by the client, the client's Risk
                  Profile for this account has been summarized below.
                </Text>
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>Age:</Text>
                <Text format={{ italic: true }}>{clients.length === 2 && kyc && kyc.date_of_birth && kyc.date_of_birth__secondary_account_holder_ ? `${getAge(kyc.date_of_birth)} (${kyc.firstname}); ${getAge(kyc.date_of_birth__secondary_account_holder_)} (${kyc.firstname_secondary})` : getAge(kyc.date_of_birth)}</Text>
              </Flex> */}
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Age:</Text>
                  </Flex>
                  {clients.length === 2 ? (
                    <>
                      <Flex direction={"column"}>
                        <List variant="unordered">
                          <Text format={{ italic: true }}>{`${getAge(kyc.date_of_birth)} (${kyc.firstname})`}</Text>
                          <Text format={{ italic: true }}>{`${getAge(kyc.date_of_birth__secondary_account_holder_)} (${
                            kyc.firstname_secondary
                          })`}</Text>
                        </List>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>{`${getAge(kyc.date_of_birth)}`}</Text>
                      </Flex>
                    </>
                  )}
                </Flex>
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>Employment Status:</Text>
                <Text format={{ italic: true }}>{clients.length === 2 ? `${kyc.employment_status.label} (${kyc.firstname}); ${kyc.employment_status__secondary_account_holder_.label} (${kyc.firstname_secondary})` : kyc.employment_status.label}</Text>
              </Flex> */}
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Employment Status:</Text>
                  </Flex>
                  {clients.length === 2 ? (
                    <>
                      <Flex direction={"column"}>
                        <List variant="unordered">
                          <Text format={{ italic: true }}>{`${kyc.employment_status.label} (${kyc.firstname})`}</Text>
                          <Text
                            format={{ italic: true }}
                          >{`${kyc.employment_status__secondary_account_holder_.label} (${kyc.firstname_secondary})`}</Text>
                        </List>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>{`${kyc.employment_status.label}`}</Text>
                      </Flex>
                    </>
                  )}
                </Flex>
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>{kyc.type === 'Entity' ? "Entity Income:" : "Approximate Annual Income:"}</Text>
                <Text format={{ italic: true }}>{getIncomeValues()}</Text>
              </Flex> */}
                {kyc && kyc.type && kyc.type.label === "Entity" ? (
                  <>
                    <Flex direction={"row"} gap={"sm"} justify={"start"}>
                      <Flex direction={"column"}>
                        <Text format={{ fontWeight: "demibold" }}>Entity Income:</Text>
                      </Flex>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>
                          {Number(kyc.entity_income || 0).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex direction={"row"} gap={"sm"} justify={"start"}>
                      <Flex direction={"column"}>
                        <Text format={{ fontWeight: "demibold" }}>Approximate Annual Income:</Text>
                      </Flex>
                      {clients.length === 2 ? (
                        <>
                          <Flex direction={"column"}>
                            <List variant="unordered">
                              <Text format={{ italic: true }}>{`${(
                                Number(kyc.employment_income || 0) +
                                Number(kyc.disability_or_ei || 0) +
                                Number(kyc.company_pension || 0) +
                                Number(kyc.cpp_income || 0) +
                                Number(kyc.oas_income || 0) +
                                Number(kyc.investment_withdrawals || 0) +
                                Number(kyc.bank_withdrawals || 0) +
                                Number(kyc.other_income || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
                                kyc.firstname
                              })`}</Text>
                              <Text format={{ italic: true }}>{`${(
                                Number(kyc.employment_income_secondary || 0) +
                                Number(kyc.disability_or_ei_secondary || 0) +
                                Number(kyc.company_pension_secondary || 0) +
                                Number(kyc.cpp_income_secondary || 0) +
                                Number(kyc.oas_income_secondary || 0) +
                                Number(kyc.investment_withdrawals_secondary || 0) +
                                Number(kyc.bank_withdrawals_secondary || 0) +
                                Number(kyc.other_income__secondary_account_holder_ || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
                                kyc.firstname_secondary
                              })`}</Text>
                            </List>
                          </Flex>
                        </>
                      ) : (
                        <>
                          <Flex direction={"column"}>
                            <Text format={{ italic: true }}>
                              {(
                                Number(kyc.employment_income || 0) +
                                Number(kyc.disability_or_ei || 0) +
                                Number(kyc.company_pension || 0) +
                                Number(kyc.cpp_income || 0) +
                                Number(kyc.oas_income || 0) +
                                Number(kyc.investment_withdrawals || 0) +
                                Number(kyc.bank_withdrawals || 0) +
                                Number(kyc.other_income || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            </Text>
                          </Flex>
                        </>
                      )}
                    </Flex>
                  </>
                )}

                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>{kyc.type === 'Entity' ? "Entity Net Worth:" : "Net Worth:"}</Text>
                <Text format={{ italic: true }}>{getNetWorthValues()}</Text>
              </Flex> */}

                {kyc && kyc.type && kyc.type.label === "Entity" ? (
                  <>
                    <Flex direction={"row"} gap={"sm"} justify={"start"}>
                      <Flex direction={"column"}>
                        <Text format={{ fontWeight: "demibold" }}>Entity Net Worth:</Text>
                      </Flex>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>
                          {(
                            Number(kyc.entity_cash || 0) +
                            Number(kyc.entity_registered_investments || 0) +
                            Number(kyc.entity_non_registered_investments || 0) +
                            Number(kyc.entity_fixed_assets || 0) -
                            Number(kyc.entity_mortgages_and_liabilities || 0)
                          ).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex direction={"row"} gap={"sm"} justify={"start"}>
                      <Flex direction={"column"}>
                        <Text format={{ fontWeight: "demibold" }}>Net Worth:</Text>
                      </Flex>
                      {clients.length === 2 ? (
                        <>
                          <Flex direction={"column"}>
                            <List variant="unordered">
                              <Text format={{ italic: true }}>{`${(
                                Number(kyc.cash || 0) +
                                Number(kyc.registered_investments || 0) +
                                Number(kyc.non_registered_investments || 0) +
                                Number(kyc.fixed_assets || 0) -
                                Number(kyc.mortgages_and_other_liabilities || 0) +
                                Number(kyc.other_investments || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
                                kyc.firstname
                              })`}</Text>
                              <Text format={{ italic: true }}>{`${(
                                Number(kyc.cash_secondary || 0) +
                                Number(kyc.registered_investments__secondary_account_holder_ || 0) +
                                Number(kyc.non_registered_investments__secondary_account_holder_ || 0) +
                                Number(kyc.fixed_assets_secondary || 0) -
                                Number(kyc.mortgages_and_other_liabilities_secondary || 0) +
                                Number(kyc.other_investments__secondary_account_holder_ || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })} (${
                                kyc.firstname_secondary
                              })`}</Text>
                            </List>
                          </Flex>
                        </>
                      ) : (
                        <>
                          <Flex direction={"column"}>
                            <Text format={{ italic: true }}>
                              {(
                                Number(kyc.cash || 0) +
                                Number(kyc.registered_investments || 0) +
                                Number(kyc.non_registered_investments || 0) +
                                Number(kyc.fixed_assets || 0) -
                                Number(kyc.mortgages_and_other_liabilities || 0) +
                                Number(kyc.other_investments || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            </Text>
                          </Flex>
                        </>
                      )}
                    </Flex>
                  </>
                )}
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>Financial Assets:</Text>
                <Text format={{ italic: true }}>{getFinancialAssetValues()}</Text>
              </Flex> */}
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>Investment Knowledge:</Text>
                <Text format={{ italic: true }}>{clients.length === 2 ? `${kyc.investment_knowledge.label} (${kyc.firstname}); ${kyc.investment_knowledge__secondary_account_holder_.label} (${kyc.firstname_secondary})` : kyc.investment_knowledge.label}</Text>
              </Flex> */}
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Investment Knowledge:</Text>
                  </Flex>
                  {clients.length === 2 ? (
                    <>
                      <Flex direction={"column"}>
                        <List variant="unordered">
                          <Text
                            format={{ italic: true }}
                          >{`${kyc.investment_knowledge.label} (${kyc.firstname})`}</Text>
                          <Text
                            format={{ italic: true }}
                          >{`${kyc.investment_knowledge__secondary_account_holder_.label} (${kyc.firstname_secondary})`}</Text>
                        </List>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>{`${kyc.investment_knowledge.label}`}</Text>
                      </Flex>
                    </>
                  )}
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Investment Experience:</Text>
                  </Flex>
                  {clients.length === 2 ? (
                    <>
                      <Flex direction={"column"}>
                        <List variant="unordered">
                          <Text format={{ italic: true }}>{`${getExperienceString(kyc.investment_experience)} (${
                            kyc.firstname
                          })`}</Text>
                          <Text format={{ italic: true }}>{`${getExperienceString(
                            kyc.investment_experience__secondary_account_holder_
                          )} (${kyc.firstname_secondary})`}</Text>
                        </List>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex direction={"column"}>
                        <Text format={{ italic: true }}>{`${getExperienceString(kyc.investment_experience)}`}</Text>
                      </Flex>
                    </>
                  )}
                </Flex>
                {/* <Flex direction={'row'} gap={'sm'} justify={'start'}>
                <Text format={{ fontWeight: "demibold" }}>Investment Experience:</Text>
                <Text format={{ italic: true }}>{clients.length === 2 ? `${getExperienceString(kyc.investment_experience)} (${kyc.firstname}); ${getExperienceString(kyc.investment_experience__secondary_account_holder_)} (${kyc.firstname_secondary})` : getExperienceString(kyc.investment_experience)}</Text>
              </Flex> */}
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Intended Use of Account:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.intended_use_of_account.label} (${kyc.firstname}); ${kyc.intended_use_of_account__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.intended_use_of_account.label}
                    </Text>
                  </Flex>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Liquidity Needs:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.liquidity_needs.label} (${kyc.firstname}); ${kyc.liquidity_needs__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.liquidity_needs.label}
                    </Text>
                  </Flex>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Time Horizon:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.time_horizon.label} (${kyc.firstname}); ${kyc.time_horizon__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.time_horizon.label}
                    </Text>
                  </Flex>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Risk Tolerance:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.risk_tolerance.label} (${kyc.firstname}); ${kyc.risk_tolerance__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.risk_tolerance.label}
                    </Text>
                  </Flex>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Risk Capacity:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.risk_capacity.label} (${kyc.firstname}); ${kyc.risk_capacity__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.risk_capacity.label}
                    </Text>
                  </Flex>
                </Flex>
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <Flex direction={"column"}>
                    <Text format={{ fontWeight: "demibold" }}>Investment Objective:</Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text format={{ italic: true }}>
                      {clients.length === 3
                        ? `${kyc.investment_objective.label} (${kyc.firstname}); ${kyc.investment_objective__secondary_account_holder_.label} (${kyc.firstname_secondary})`
                        : kyc.investment_objective.label}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Tile>
          <Tile>
            <Flex direction={"column"} gap={"large"}>
              <Flex direction={"column"} gap={"sm"}>
                <Heading>Model Portfolio</Heading>
                <Text variant="microcopy" format={{ italic: true }}>
                  Based on your discussion with the client and the information you collected to form the above risk
                  profile, please indicate which model portfolio you will be assigning them and provide your assessment
                  as to the suitability of that model given their particular situation.
                </Text>
                {modelWarning && (
                  <Alert title={"Warning"} variant={"warning"}>
                    <Text>
                      Based on the KYC Matrix outlined in the KYC and Model Suitability Guide, the below KYC components
                      do not fit within the context of the {getValue()}:
                    </Text>
                    <List variant="unordered-styled">
                      {mismatchedKycCriteria.map((item, index) => (
                        <Text key={index} format={{ italic: true }}>
                          {item}
                        </Text>
                      ))}
                    </List>
                    <Text>
                      Please provide additional context in your Suitability Assessment as to why the {getValue()} is a
                      suitable recommendation.
                    </Text>
                  </Alert>
                )}
                <Flex direction={"row"} gap={"sm"} justify={"start"}>
                  <ToggleGroup
                    name="assigned-model"
                    label=""
                    options={modelOptions}
                    toggleType="radioButtonList"
                    // value={kyc && kyc.assigned_model ? kyc.assigned_model.label : ''}
                    value={getValue()}
                    onChange={(value) => {
                      validateModel(value);
                      setFormProperties({
                        ...formProperties,
                        assigned_model: value,
                        model_overridden: "No",
                      });
                    }}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Tile>
          <Tile>
            <Flex direction={"column"} gap={"large"}>
              <Flex direction={"column"} gap={"sm"}>
                <Heading>Summary</Heading>
                <Text>{summaryModelSutability}</Text>
              </Flex>
            </Flex>
          </Tile>

          <Tile>
            <Flex direction={"column"} gap={"large"}>
              <Flex direction={"column"} gap={"sm"}>
                <Heading>Suitability Assessment</Heading>
                <Text variant="microcopy" format={{ italic: true }}>
                  {modelSuitabilityString}
                </Text>
                {(kyc && kyc.assigned_model && kyc.assigned_model.label) ||
                (formProperties && formProperties.assigned_model) ? (
                  <Flex direction={"column"} gap={"xs"}>
                    <Flex direction={"row"} gap={"sm"} justify={"between"}>
                      <Flex direction={"column"}>
                        <TextArea
                          label=""
                          name="model-suitability"
                          error={error}
                          validationMessage={validationMessage}
                          onChange={(value) => {
                            setFormProperties({
                              ...formProperties,
                              model_suitability: value,
                            });
                          }}
                          onInput={(value) => {
                            const charactersRemaining = 150 - value.length;
                            if (value.length < 150) {
                              setValidationMessage(`${charactersRemaining} characters required`);
                            } else {
                              setValidationMessage(`${value.length} characters`);
                            }

                            // Set error state based on the length
                            setError(value.length < 150);
                          }}
                          resize={"both"}
                          cols={200}
                          rows={10}
                          readOnly={
                            (kyc && kyc.assigned_model && kyc.assigned_model.label) ||
                            (formProperties && formProperties.assigned_model)
                              ? false
                              : true
                          }
                          value={
                            kyc && kyc.model_suitability ? kyc.model_suitability : formProperties.model_suitability
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex direction={"row"} gap={"sm"} justify={"between"}>
                    <Flex direction={"column"}>
                      <Alert title="Important" variant="info">
                        A model must be assigned to an account before providing a suitability assessment.
                      </Alert>
                    </Flex>
                  </Flex>
                )}
                {modelWarning && (
                  <Checkbox
                    name="model-confirm-check"
                    variant="small"
                    checked={getCheckValue()}
                    onChange={(checked: true, value: "Yes") => {
                      if (checked) {
                        setFormProperties({
                          ...formProperties,
                          model_overridden: "Yes",
                        });
                      } else {
                        setFormProperties({
                          ...formProperties,
                          model_overridden: "No",
                        });
                      }
                    }}
                  >
                    I confirm that my assessment provides additional context as to the suitability of my reccomendation
                    as it relates to the client's KYC components not fitting within the paramaters of the{" "}
                    {formProperties?.assigned_model || kyc?.assigned_model?.label || "model"} as outlined in the KYC and
                    Model Suitability Guide
                  </Checkbox>
                )}
              </Flex>
            </Flex>
          </Tile>
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button
            variant="primary"
            onClick={() => {
              updateKyc();
            }}
            disabled={disabled}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    );
};
