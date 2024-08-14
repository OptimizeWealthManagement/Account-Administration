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
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@hubspot/ui-extensions";
import type { KycQuestionProps, KycFormProps, Kyc } from "../../types";
import { rifMinimums, lifMinimums } from "../../utils";

export const KycQuestions = ({ kyc, clients, runServerless, onCancelClick, onSaveClick }: KycQuestionProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<KycFormProps>>([]); // Set form props to update KYC object with information gathered
  const [kycProps, setKycProps] = useState<KycFormProps | null>(null); // Kyc form props to hold default values
  const [age, setAge] = useState(0);
  const [rifMin, setRifMin] = useState(0);
  const [lifMin, setLifMin] = useState(0);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const offsetUTC = new Date().getTimezoneOffset() / 60; // Local time zone offset in hours
    const offsetEST = 5; // EST is UTC-5
    const offsetToApply = (offsetUTC + offsetEST) * 60 * 60 * 1000; // Convert to milliseconds

    const clientBirthDate = new Date(kyc.date_of_birth + offsetToApply);

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

    setAge(age);
    getMins(age);
  }, []);

  // Loop through the tickets object, find all of the keys that match the IdVerificationFormProps keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = [
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
      // allowedKeys.push(...["investment_experience__secondary_account_holder_", "investment_knowledge__secondary_account_holder_", "intended_use_of_account__secondary_account_holder_", "source_of_funds__secondary_account_holder_", "risk_tolerance__secondary_account_holder_", "risk_capacity__secondary_account_holder_", "investment_objective__secondary_account_holder_", "time_horizon__secondary_account_holder_", "liquidity_needs__secondary_account_holder_", "employment_status__secondary_account_holder_", "date_of_birth__secondary_account_holder_"]);
      allowedKeys.push(
        ...[
          "investment_experience__secondary_account_holder_",
          "investment_knowledge__secondary_account_holder_",
          "employment_status__secondary_account_holder_",
          "date_of_birth__secondary_account_holder_",
        ]
      );
    }

    for (const [key, value] of Object.entries(kyc)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in IdVerificationFormProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label;
      } else {
        newObject[key] = value;
      }
    }

    setKycProps(newObject as KycFormProps);
  }, []); // Dependency array

  const getTime = (date: Object) => {
    const jsDate = new Date(date.year, date.month, date.date);

    // Get Unix timestamp in milliseconds
    const timestampInMilliseconds = jsDate.getTime();

    return timestampInMilliseconds;
  };

  const convertDate = (value: number) => {
    const dateTimestamp = new Date(value);
    const dateYear = dateTimestamp.getFullYear();
    const dateMonth = dateTimestamp.getMonth();
    const dateDay = dateTimestamp.getDate();

    const formattedDateObject = { year: dateYear, month: dateMonth, date: dateDay };

    return formattedDateObject;
  };

  const convertDateToNumber = (value: object) => {
    const dateNumber = new Date(value.year, value.month, value.date).getTime();

    return dateNumber;
  };

  const getValue = (key: keyof KycFormProps, index: number) => {
    const suffix = index === 1 ? "__secondary_account_holder_" : ""; // append '__secondary_account_holder_' for second index, leave empty for first
    const newKey = `${key}${suffix}` as keyof KycFormProps;

    if (kycProps && kycProps[newKey]) {
      const value = kycProps[newKey];

      // Check if the value is a number and convert it to a date object if so
      const formattedValue = typeof value === "number" ? convertDate(value) : value;

      return value;
    } else {
      return null;
    }
  };

  const getValueNew = (key: keyof KycFormProps) => {
    if (kycProps && kycProps[key]) {
      const value = kycProps[key];

      // Check if the value is a number and convert it to a date object if so
      const formattedValue = typeof value === "number" ? convertDate(value) : value;
      // return kycProps[newKey];
      return value;
    } else {
      return null;
    }
  };

  // Get values for properties shared by both account holders
  const getUniqueValue = (key: keyof KycFormProps) => {
    if (kycProps) {
      if (kycProps[key]) {
        const value = kycProps[key];

        // Check if the value is a number and convert it to a date object if so
        const formattedValue = typeof value === "number" ? convertDate(value) : value;
        return formattedValue;
      } else {
        return null;
      }
    }
  };

  const handleChange = (key: keyof KycFormProps, value: any, index: number) => {
    const suffix = index === 1 ? "__secondary_account_holder_" : ""; // append '_2' for second index, leave empty for first
    const newKey = `${key}${suffix}` as keyof KycFormProps;

    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    setFormProperties((prevState) => ({
      ...prevState,
      [newKey]: formattedValue,
    }));

    setKycProps((prevState) => ({
      ...prevState,
      [newKey]: value,
    }));
  };

  const handleChangeNew = (key: keyof KycFormProps, value: any) => {
    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    setFormProperties((prevState) => ({
      ...prevState,
      [key]: formattedValue,
    }));

    setKycProps((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // Handle change for properties shared by both account holders
  const handleUniqueChange = (key: keyof KycFormProps, value: any) => {
    const formattedValue = typeof value === "object" ? convertDateToNumber(value) : value;

    setFormProperties((prevState) => ({
      ...prevState,
      [key]: formattedValue,
    }));

    setKycProps((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  useEffect(() => {
    let shouldDisable = false;
    const allowedKeys = [
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
      allowedKeys.push(
        ...[
          "investment_experience__secondary_account_holder_",
          "investment_knowledge__secondary_account_holder_",
          "employment_status__secondary_account_holder_",
          "date_of_birth__secondary_account_holder_",
        ]
      );
    }

    if (kycProps) {
      for (const key of Object.keys(kycProps)) {
        if (!allowedKeys.includes(key as any)) continue;

        if (kycProps[key as keyof KycFormProps] === null || kycProps[key as keyof KycFormProps] === undefined) {
          shouldDisable = true;
          break;
        }
      }
    }

    setDisabled(shouldDisable);
  }, [kycProps]);

  const getMins = (age: number) => {
    // Set RIF Min
    // Adjust for clients over the age of 95
    if (age > 95) {
      // rifAmt = rifMinimums[95];
      setRifMin(rifMinimums[95]);
    } else {
      // rifAmt = rifMinimums[age];
      setRifMin(rifMinimums[age]);
    }

    // Set LIF Min
    // Adjust for clients over the age of 95
    if (age > 95) {
      // lifAmt = lifMinimums[95];
      setLifMin(lifMinimums[95]);
    } else {
      // lifAmt = lifMinimums[age];
      setLifMin(lifMinimums[age]);
    }
  };

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
        // sendAlert({
        //   type: 'success',
        //   message: 'Saved'
        // });
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  // Eliminate liquidity options
  const updateLiquidityOptions = (selection: string) => {
    let acctType = kyc.account_type.label;

    if (acctType === "RIF" || acctType === "Spousal RIF" || acctType === "PRIF" || acctType === "LRIF") {
      // setLiquidityWarning(`Based on the clients age, their annual RIF minimum of approximately ${(rifMin * 100).toFixed(2)}% eliminates some of the above options.`);
      return liquidityNumbers[selection] < rifMin;
    }

    if (acctType === "LIF" || acctType === "RLIF") {
      // setLiquidityWarning(`Based on the clients age, their annual LIF minimum of approximately ${(lifMin * 100).toFixed(2)}% eliminates some of the above options.`);
      return liquidityNumbers[selection] < lifMin;
    }

    return false;
  };

  // Provide number equivelants for liquidity options
  const liquidityNumbers = {
    "None": 0.01,
    "Minimal": 5,
    "Minimal to moderate": 10,
    "Moderate": 15,
    "Moderate to high": 15.01,
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
    readonly: updateLiquidityOptions(n),
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
    "Less than a year",
    "1 - 4 years",
    "5 - 10 years",
    "11 - 15 years",
    "More than 15 years",
  ].map((n) => ({
    label: n,
    value: n,
    // initialIsChecked: (kyc && kyc.time_horizon && kyc.time_horizon.label === n) ? true : false,
  }));

  const intendedUseDescriptions = {
    "Education Savings": "",
    "Saving for Retirement": "",
    "Funding Retirement": "",
    "Estate Planning": "",
    "Short term savings for a specific purchase": "e.g. saving for a home purchase in under 5 years",
    "Long term savings for a specific purchase": "e.g. saving for a home purchase within the next 5 to 10 years",
  };

  // Define intended of account use options
  const intendedUseOptions = [
    "Saving for Retirement",
    "Funding Retirement",
    "Estate Planning",
    "Education Savings",
    "Short term savings for a specific purchase",
    "Long term savings for a specific purchase",
  ].map((o) => ({
    label: `${o}`,
    value: `${o}`,
    // initialIsChecked: o === intendedUse ? true : false,
    description: intendedUseDescriptions[0],
    // readonly: (kyc && kyc.employment_status && kyc.employment_status.label === o) ? true: false,
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

  if (!kycProps) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"row"} gap={"md"} justify={"start"}>
        <Button onClick={onCancelClick}>{"< Back"}</Button>
      </Flex>
      <Flex direction={"column"} gap={"extra-small"}>
        <Flex direction={"row"} gap={"md"} justify={"between"}>
          <Heading>KYC Questions</Heading>
        </Flex>
        <Divider distance="sm" />
        {/* {clients.map((client, clientIndex) => (
          <>
            <Tile key={clientIndex}>
              <Flex direction={'column'} gap={'large'}>
                <Flex direction={'row'} gap={'md'} justify={'start'}>
                  <Text format={{ italic: true, fontWeight: "bold" }}>Client: {client.name}</Text>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Source of Funds</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>Source of funds refers to where the client acquired the majority of the funds in this account.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="source-of-funds"
                      label=""
                      options={sourceOptions}
                      toggleType="radioButtonList"
                      value={getValue('source_of_funds', clientIndex)}
                      onChange={items => {
                        handleChange('source_of_funds', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Intended Use of Account</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>The purpose of an account impacts how the investments within it should be structured in order to best achieve its goals. The Intended use of account refers to which of the following statements best describe the primary purpose of the investment account.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="intended-use-of-account"
                      label=""
                      // tooltip="Intended Use of Account refers to the statement that best describes the primary purpose of the investment account. For example, RESP accounts should have education as the intended use"
                      options={intendedUseOptions}
                      toggleType="radioButtonList"
                      value={getValue('intended_use_of_account', clientIndex)}
                      onChange={items => {
                        handleChange('intended_use_of_account', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Liquidity Needs</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>Liquidity refers to the ability to convert a portion of an account into cash quickly and is related to an investor's upcoming cash requirements such as tax payments, gifts, living expenses, or other expected expenditures and their need to draw an income from their portfolio. It can be measured by how much they plan to withdraw from their portfolio on an annual basis.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="liquidity-needs"
                      label=""
                      tooltip="Liquidity needs refers to how much money the client plans to withdraw on an annual basis from this account"
                      options={liquidityOptions}
                      toggleType="radioButtonList"
                      value={getValue('liquidity_needs', clientIndex)}
                      onChange={items => {
                        handleChange('liquidity_needs', items!, clientIndex);
                      }}

                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Time Horizon</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>Time Horizon impacts the asset mix and choice of investment product over which an investor plans to be invested before a material withdrawal of funds is made. It can be measured by the number of years until they will make one or a series of withdrawals which when combined with the growth of the account will have depleted the account by more than a cumulative 30% from the account's initial value. While it may not be possible to define in advance all the possible requirements and related timing of your withdrawals, you should consider whether you are sufficiently long-term in your investment horizon to be able to weather short and medium- term investment fluctuations and cycles. In general, the longer you remain invested, the less variability in average returns you can expect and the lower potential for a cumulative loss.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="time-horizon"
                      label=""
                      // tooltip="Time horizon refers to how long until the client makes a substantial withdrawal (more than 30%) from their account in any given year?"
                      options={timeHorizonOptions}
                      toggleType="radioButtonList"
                      value={getValue('time_horizon', clientIndex)}
                      onChange={items => {
                        handleChange('time_horizon', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Risk Tolerance</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>Risk Tolerance or Willingness can be thought of in reference to how willing an investor is to taking on risk and can be best seen through how they would react if their portfolio value dropped a significant amount in a short period of time. Their Risk Tolerance and their ensuing reactions can be captured by one of the below statements.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="risk-tolerance"
                      label=""
                      // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                      options={riskToleranceOptions}
                      toggleType="radioButtonList"
                      value={getValue('risk_tolerance', clientIndex)}
                      onChange={items => {
                        handleChange('risk_tolerance', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Risk Capacity</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>{'Risk Capacity is based on an investor\'s investment time horizon and overall financial situation (including but not limited to their net worth, income, and expenses), and measured by what percentage decline in their portfolio they could withstand before their current lifestyle and/or future investment goals would be affected?'}</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="risk-capacity"
                      label=""
                      // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                      options={riskCapacityOptions}
                      toggleType="radioButtonList"
                      value={getValue('risk_capacity', clientIndex)}
                      onChange={items => {
                        handleChange('risk_capacity', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction={'column'} gap={'sm'}>
                  <Heading>Investment Objective</Heading>
                  <Text variant="microcopy" format={{ italic: true }}>Investment objectives are defined in terms of expected long-term return and the risk level that an investor is prepared to bear. The choice between risk and return must be kept in mind in order to set realistic performance targets. They are measured by which of the following statements best reflect the investment objective of an account.</Text>
                  <Flex direction={'row'} gap={'md'} justify={'start'}>
                    <ToggleGroup
                      name="investment-objective"
                      label=""
                      // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                      options={objectiveOptions}
                      toggleType="radioButtonList"
                      value={getValue('investment_objective', clientIndex)}
                      onChange={items => {
                        handleChange('investment_objective', items!, clientIndex);
                      }}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Tile>
          </>
        ))} */}
        <Tile>
          <Flex direction={"column"} gap={"large"}>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Source of Funds</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                Source of funds refers to where the client acquired the majority of the funds in this account.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="source-of-funds"
                  label=""
                  options={sourceOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("source_of_funds")}
                  onChange={(items) => {
                    handleChangeNew("source_of_funds", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Intended Use of Account</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                The purpose of an account impacts how the investments within it should be structured in order to best
                achieve its goals. The Intended use of account refers to which of the following statements best describe
                the primary purpose of the investment account.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="intended-use-of-account"
                  label=""
                  // tooltip="Intended Use of Account refers to the statement that best describes the primary purpose of the investment account. For example, RESP accounts should have education as the intended use"
                  options={intendedUseOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("intended_use_of_account")}
                  onChange={(items) => {
                    handleChangeNew("intended_use_of_account", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Liquidity Needs</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                Liquidity refers to the ability to convert a portion of an account into cash quickly and is related to
                an investor's upcoming cash requirements such as tax payments, gifts, living expenses, or other expected
                expenditures and their need to draw an income from their portfolio. It can be measured by how much they
                plan to withdraw from their portfolio on an annual basis.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="liquidity-needs"
                  label=""
                  tooltip="Liquidity needs refers to how much money the client plans to withdraw on an annual basis from this account"
                  options={liquidityOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("liquidity_needs")}
                  onChange={(items) => {
                    handleChangeNew("liquidity_needs", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Time Horizon</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                Time Horizon impacts the asset mix and choice of investment product over which an investor plans to be
                invested before a material withdrawal of funds is made. It can be measured by the number of years until
                they will make one or a series of withdrawals which when combined with the growth of the account will
                have depleted the account by more than a cumulative 30% from the account's initial value. While it may
                not be possible to define in advance all the possible requirements and related timing of your
                withdrawals, you should consider whether you are sufficiently long-term in your investment horizon to be
                able to weather short and medium- term investment fluctuations and cycles. In general, the longer you
                remain invested, the less variability in average returns you can expect and the lower potential for a
                cumulative loss.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="time-horizon"
                  label=""
                  // tooltip="Time horizon refers to how long until the client makes a substantial withdrawal (more than 30%) from their account in any given year?"
                  options={timeHorizonOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("time_horizon")}
                  onChange={(items) => {
                    handleChangeNew("time_horizon", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Risk Tolerance</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                Risk Tolerance or Willingness can be thought of in reference to how willing an investor is to taking on
                risk and can be best seen through how they would react if their portfolio value dropped a significant
                amount in a short period of time. Their Risk Tolerance and their ensuing reactions can be captured by
                one of the below statements.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="risk-tolerance"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={riskToleranceOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("risk_tolerance")}
                  onChange={(items) => {
                    handleChangeNew("risk_tolerance", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Risk Capacity</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                {
                  "Risk Capacity is based on an investor's investment time horizon and overall financial situation (including but not limited to their net worth, income, and expenses), and measured by what percentage decline in their portfolio they could withstand before their current lifestyle and/or future investment goals would be affected?"
                }
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="risk-capacity"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={riskCapacityOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("risk_capacity")}
                  onChange={(items) => {
                    handleChangeNew("risk_capacity", items!);
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Heading>Investment Objective</Heading>
              <Text variant="microcopy" format={{ italic: true }}>
                Investment objectives are defined in terms of expected long-term return and the risk level that an
                investor is prepared to bear. The choice between risk and return must be kept in mind in order to set
                realistic performance targets. They are measured by which of the following statements best reflect the
                investment objective of an account.
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="investment-objective"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={objectiveOptions}
                  toggleType="radioButtonList"
                  value={getValueNew("investment_objective")}
                  onChange={(items) => {
                    handleChangeNew("investment_objective", items!);
                  }}
                />
              </Flex>
            </Flex>
          </Flex>
        </Tile>
        <Tile>
          <Flex direction={"column"} gap={"sm"}>
            <Heading>Additional Questions</Heading>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                Does anyone other than the client have financial interest in this account?
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="financial-interest"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue(
                    "does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_"
                  )}
                  onChange={(items) => {
                    handleUniqueChange(
                      "does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_",
                      items!
                    );
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                {
                  "Other than Optimize, does anyone other than the client (or any other person named on their jointly held accounts) have any authority to give instruction over and/or trade on this account?"
                }
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="trading-authority"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue(
                    "other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_"
                  )}
                  onChange={(items) => {
                    handleUniqueChange(
                      "other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_",
                      items!
                    );
                  }}
                  // value={kyc && kyc.other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_ ? kyc.other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_.label : ''}
                  // value={kyc.other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_.label}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                Will the accounts be used by a person other than the applicant or for the benefit of a third party?
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="third-party"
                  label=""
                  tooltip="This question refers to whether someone or an organization not included on this application has direct or indirect ownership or beneficial ownership of the account."
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue(
                    "will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_"
                  )}
                  onChange={(items) => {
                    handleUniqueChange(
                      "will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_",
                      items!
                    );
                  }}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                Does anyone other than this client guarantee this account?
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="guarantee"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue("does_anyone_other_than_the_client_guarantee_this_account_")}
                  onChange={(items) => {
                    handleUniqueChange("does_anyone_other_than_the_client_guarantee_this_account_", items!);
                  }}
                  // value={kyc && kyc.does_anyone_other_than_the_client_guarantee_this_account_ ? kyc.does_anyone_other_than_the_client_guarantee_this_account_.label : ''}
                  // value={kyc.does_anyone_other_than_the_client_guarantee_this_account_.label}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                Does the client trade or intend to trade with other investment firms?
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="trading-with-other-firms"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue("do_you_trade_or_intend_to_trade_with_other_investment_firms_")}
                  onChange={(items) => {
                    handleUniqueChange("do_you_trade_or_intend_to_trade_with_other_investment_firms_", items!);
                  }}
                  // value={kyc && kyc.do_you_trade_or_intend_to_trade_with_other_investment_firms_ ? kyc.do_you_trade_or_intend_to_trade_with_other_investment_firms_.label : ''}
                  // value={kyc.do_you_trade_or_intend_to_trade_with_other_investment_firms_.label}
                />
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Text variant="microcopy" format={{ italic: true }}>
                Does the client use leverage or borrowing to finance the purchase of securities?
              </Text>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="leverage"
                  label=""
                  // tooltip="If the client's portfolio value dropped a significant amount in a short period of time, which of the below options would best . What would they do?"
                  options={bianaryOptions}
                  toggleType="radioButtonList"
                  inline={true}
                  value={getUniqueValue("do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_")}
                  onChange={(items) => {
                    handleUniqueChange(
                      "do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_",
                      items!
                    );
                  }}
                  // value={kyc && kyc.do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_ ? kyc.do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_.label : ''}
                  // value={kyc.do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_.label}
                />
              </Flex>
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
