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
  TableHead,
  TableHeader,
  Tag,
  NumberInput,
  EmptyState,
} from "@hubspot/ui-extensions";
import type { TransferFormProps, TransferForm, Transfers } from "../../types";
import { relinquishingInstitutionList, provinceOptions } from "../../utils";

export const TransferForm = ({ kyc, ticketId, runServerless, onCancelClick, onSaveClick }: TransferForm) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<Transfers>>([]); // Set form props to update KYC object with
  const [transferForms, setTransferForms] = useState<Array<TransferFormProps>>([]); // Set current transfer form props
  const [showExistingTransfers, SetShowExistingTransfers] = useState(false);
  const currentNumber = transferForms.length;

  // disable transfer row props
  const [disableAmountType, setDisableAmountType] = useState(true);
  const [disableDescription, setDisableDescription] = useState(true);
  const [disableAmount, setDisableAmount] = useState(true);
  const [disableQuantity, setDisableQuantity] = useState(true);
  const [disableAmountType2, setDisableAmountType2] = useState(true);
  const [disableDescription2, setDisableDescription2] = useState(true);
  const [disableAmount2, setDisableAmount2] = useState(true);
  const [disableQuantity2, setDisableQuantity2] = useState(true);
  const [disableAmountType3, setDisableAmountType3] = useState(true);
  const [disableDescription3, setDisableDescription3] = useState(true);
  const [disableAmount3, setDisableAmount3] = useState(true);
  const [disableQuantity3, setDisableQuantity3] = useState(true);
  const [disableAmountType4, setDisableAmountType4] = useState(true);
  const [disableDescription4, setDisableDescription4] = useState(true);
  const [disableAmount4, setDisableAmount4] = useState(true);
  const [disableQuantity4, setDisableQuantity4] = useState(true);

  useEffect(() => {
    if (kyc && kyc.transfers) {
      const cleanedTransfersString = kyc.transfers.replace("undefined", "");
      const transfersList = cleanedTransfersString.split(".-.-.-.-.-");

      if (transfersList.length > 0) {
        const transferObject = transfersList.map((item) => {
          const cleanedItem = item.replace(/^"|"$/g, "");
          const parts = cleanedItem.split("-----");

          const tfr = {
            relinquishing_institution: parts.length > 0 ? parts[0].replace(/\(0\)/g, "") : undefined,
            address: parts.length > 1 ? parts[1].replace("(1)", "") : undefined,
            city: parts.length > 2 ? parts[2].replace("(2)", "") : undefined,
            province: parts.length > 3 ? parts[3].replace("(3)", "") : undefined,
            postal_code: parts.length > 4 ? parts[4].replace("(4)", "") : undefined,
            relinquishing_account_number: parts.length > 5 ? parts[5].replace("(5)", "") : undefined,
            transfer_type: parts.length > 6 ? parts[6].replace("(6)", "") : undefined,
            instruction_type: parts.length > 7 ? parts[7].replace("(7)", "") : undefined,
            amount_type: parts.length > 8 ? parts[8].replace("(8)", "") : undefined,
            description: parts.length > 9 ? parts[9].replace("(9)", "") : undefined,
            amount: parts.length > 10 ? parts[10].replace("(10)", "") : undefined,
            quantity: parts.length > 11 ? parts[11].replace("(11)", "") : undefined,
            instruction_type_2: parts.length > 12 ? parts[12].replace("(12)", "") : undefined,
            amount_type_2: parts.length > 13 ? parts[13].replace("(13)", "") : undefined,
            description_2: parts.length > 14 ? parts[14].replace("(14)", "") : undefined,
            amount_2: parts.length > 15 ? parts[15].replace("(15)", "") : undefined,
            quantity_2: parts.length > 16 ? parts[16].replace("(16)", "") : undefined,
            instruction_type_3: parts.length > 17 ? parts[17].replace("(17)", "") : undefined,
            amount_type_3: parts.length > 18 ? parts[18].replace("(18)", "") : undefined,
            description_3: parts.length > 19 ? parts[19].replace("(19)", "") : undefined,
            amount_3: parts.length > 20 ? parts[20].replace("(20)", "") : undefined,
            quantity_3: parts.length > 21 ? parts[21].replace("(21)", "") : undefined,
            instruction_type_4: parts.length > 22 ? parts[22].replace("(22)", "") : undefined,
            amount_type_4: parts.length > 23 ? parts[23].replace("(23)", "") : undefined,
            description_4: parts.length > 24 ? parts[24].replace("(24)", "") : undefined,
            amount_4: parts.length > 25 ? parts[25].replace("(25)", "") : undefined,
            quantity_4: parts.length > 26 ? parts[26].replace("(26)", "") : undefined,
          };

          for (const key in tfr) {
            if (tfr[key] === "undefined") {
              tfr[key] = "";
            }
          }

          return tfr as TransferFormProps;
        });

        setTransferForms(transferObject);
        SetShowExistingTransfers(true);
      }
    }
  }, []);

  const updateKyc = (formProperties) => {
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
        // setLoading(false);
      } else {
        setError(resp.message);
        console.log(error);
      }
    });
  };

  const instructionTypeOptions = [
    "Transfer in cash",
    // "Transfer in kind",
    // "Transfer from cash",
    "GIC Transfer",
    "Balance of account in cash",
    // "Balance of account in kind"
  ].map((n) => ({
    label: n,
    value: n,
  }));

  const partialInstructionTypeOptions = [
    "Transfer in cash",
    // "Transfer in kind",
    "Transfer from cash",
    "GIC Transfer",
  ].map((n) => ({
    label: n,
    value: n,
  }));

  const relinquishingInstitution = relinquishingInstitutionList.map((n) => ({
    label: n,
    value: n,
  }));

  const convertTransfersToString = (arr) => {
    try {
      const transferString = arr
        .map((obj, objIndex) => {
          return Object.entries(obj)
            .map(([key, value], index) => {
              // Convert date object to Unix timestamp in milliseconds if applicable
              if (key === "date_of_birth") {
                value = new Date(value.year, value.month, value.date).getTime();
              }

              // If value is null, use an empty string as a placeholder
              const sanitizedValue = value === null ? "" : value;

              return `(${index})${sanitizedValue}`;
            })
            .join("-----");
        })
        .join(".-.-.-.-.-");

      updateKyc({ transfers: transferString });

      return "SUCCESS";
    } catch (e) {
      console.error("An error occurred:", e);
      return "ERROR";
    }
  };

  // handle onClick for save
  const handleSaveClick = () => {
    const result = convertTransfersToString(transferForms);
    if (result === "SUCCESS") {
      console.log("Converted transfers result: ", result);
    } else {
      console.log("Converted transfers result: ", result);
    }
  };

  const addTransfer = () => {
    setTransferForms([
      ...transferForms,
      {
        relinquishing_institution: "",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        relinquishing_account_number: "",
        transfer_type: "",
        instruction_type: "",
        amount_type: "",
        description: "",
        amount: null,
        quantity: null,
        instruction_type_2: "",
        amount_type_2: "",
        description_2: "",
        amount_2: null,
        quantity_2: null,
        instruction_type_3: "",
        amount_type_3: "",
        description_3: "",
        amount_3: null,
        quantity_3: null,
        instruction_type_4: "",
        amount_type_4: "",
        description_4: "",
        amount_4: null,
        quantity_4: null,
      },
    ]);
    if (!showExistingTransfers) {
      SetShowExistingTransfers(true);
    }
  };

  const removeTransfer = (index) => {
    const newArray = [...transferForms]; // Make a shallow copy of the array
    if (newArray.length === 1) {
      SetShowExistingTransfers(false);
    }
    newArray.splice(index, 1); // Remove element at index
    setTransferForms(newArray); // Update state
  };

  const handleInputChange = (e, transferIndex, field) => {
    const newTransferForms = [...transferForms];
    newTransferForms[transferIndex][field] = e;
    setTransferForms(newTransferForms);
  };

  return (
    <Flex direction={"column"} gap={"md"}>
      {showExistingTransfers ? (
        <>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"row"} gap={"md"} justify={"start"}>
              <Button onClick={onCancelClick}>{"< Back"}</Button>
            </Flex>
            <Flex direction={"column"} gap={"extra-small"}>
              <Flex direction={"row"} gap={"md"} alignSelf={"end"} justify={"between"}>
                <Flex direction={"row"} gap={"md"} justify={"start"}>
                  <Heading>Transfer Forms</Heading>
                </Flex>
              </Flex>
              <Divider />
              {transferForms.map((transferForm, transferIndex) => (
                <Tile key={transferIndex}>
                  <Flex direction={"column"} gap={"md"}>
                    <Flex direction={"column"} gap={"sm"}>
                      <Flex direction={"row"} justify={"between"}>
                        <Flex direction={"row"} justify={"start"}>
                          <Heading>{transferIndex > 0 ? `Transfer (${transferIndex + 1})` : "Transfer"}</Heading>
                        </Flex>
                        <Flex direction={"row"} justify={"end"}>
                          <Button
                            onClick={() => {
                              removeTransfer(transferIndex);
                            }}
                          >
                            Remove
                          </Button>
                        </Flex>
                      </Flex>
                      <Divider />
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Select
                          label={"Relinquishing Institution"}
                          name="relinquishing-institution"
                          options={relinquishingInstitution}
                          value={transferForm.relinquishing_institution}
                          onChange={(value) => handleInputChange(value, transferIndex, "relinquishing_institution")}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"Address"}
                          name="address"
                          value={transferForm.address}
                          onChange={(value) => handleInputChange(value, transferIndex, "address")}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          label={"City"}
                          name="city"
                          value={transferForm.city}
                          onChange={(value) => handleInputChange(value, transferIndex, "city")}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Select
                          label="Province"
                          name="province"
                          placeholder={"Select an option"}
                          value={transferForm.province}
                          onChange={(value) => handleInputChange(value, transferIndex, "province")}
                          options={provinceOptions}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Input
                          label={"Postal Code"}
                          name="postal-code"
                          value={transferForm.postal_code}
                          onChange={(value) => handleInputChange(value, transferIndex, "postal_code")}
                        />
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} gap={"md"} justify={"between"}>
                      <Flex direction={"column"}>
                        <Input
                          name={"relinquishing-account-number"}
                          label={"Relinquishing Account Number"}
                          value={transferForm.relinquishing_account_number}
                          onChange={(value) => handleInputChange(value, transferIndex, "relinquishing_account_number")}
                        />
                      </Flex>
                      <Flex direction={"column"}>
                        <Box></Box>
                      </Flex>
                      <Flex direction={"column"}>
                        <Box></Box>
                      </Flex>
                    </Flex>
                    <Flex direction={"row"} justify={"start"}>
                      <ToggleGroup
                        name="transfer-type"
                        options={[
                          { label: "All in cash", value: "All in cash" },
                          { label: "All in kind", value: "All in kind", readonly: true },
                          { label: "Partial mixed", value: "Partial mixed" },
                          { label: "All mixed", value: "All mixed" },
                        ]}
                        value={transferForm.transfer_type}
                        inline={true}
                        toggleType="radioButtonList"
                        onChange={(items) => {
                          handleInputChange(items!, transferIndex, "transfer_type");
                          handleInputChange(undefined, transferIndex, "instruction_type");
                          handleInputChange(undefined, transferIndex, "amount_type");
                          handleInputChange(undefined, transferIndex, "description");
                          handleInputChange(null, transferIndex, "amount");
                          handleInputChange(null, transferIndex, "quantity");
                        }}
                      />
                    </Flex>
                    <Flex direction={"column"} gap={"md"}>
                      {transferForm.transfer_type &&
                      (transferForm.transfer_type === "Partial mixed" || transferForm.transfer_type === "All mixed") ? (
                        <>
                          <Table bordered={true}>
                            <TableHead>
                              <TableRow>
                                <TableHeader>Intstruction Type</TableHeader>
                                <TableHeader>Amount Type</TableHeader>
                                <TableHeader>Description</TableHeader>
                                <TableHeader>Amount</TableHeader>
                                <TableHeader>Quantity</TableHeader>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"instruction-type"}
                                      label={""}
                                      value={
                                        transferForm.instruction_type && transferForm.instruction_type != undefined
                                          ? transferForm.instruction_type
                                          : ""
                                      }
                                      options={
                                        transferForm.transfer_type === "All mixed"
                                          ? instructionTypeOptions
                                          : partialInstructionTypeOptions
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "instruction_type");
                                        setDisableAmountType(true);
                                        setDisableDescription(true);
                                        setDisableAmount(true);
                                        setDisableQuantity(true);
                                        handleInputChange(undefined, transferIndex, "amount_type");
                                        handleInputChange(undefined, transferIndex, "description");
                                        handleInputChange(undefined, transferIndex, "amount");
                                        handleInputChange(undefined, transferIndex, "quantity");
                                        if (
                                          value === "Balance of account in cash" ||
                                          value === "Balance of account in kind"
                                        ) {
                                          setDisableAmountType(true);
                                        } else {
                                          setDisableAmountType(false);
                                        }
                                      }}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"amount-type"}
                                      label={""}
                                      value={
                                        transferForm.amount_type && transferForm.amount_type != undefined
                                          ? transferForm.amount_type
                                          : ""
                                      }
                                      options={[
                                        { label: "Full", value: "Full" },
                                        { label: "Partial", value: "Partial" },
                                      ]}
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_type");
                                        handleInputChange(null, transferIndex, "amount");
                                        handleInputChange(null, transferIndex, "quantity");
                                        setDisableAmount(true);
                                        setDisableQuantity(true);

                                        if (value === "Full") {
                                          setDisableAmount(true);
                                          setDisableQuantity(true);
                                        } else {
                                          setDisableAmount(false);
                                          setDisableQuantity(false);
                                        }
                                      }}
                                      readOnly={disableAmountType}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Input
                                      name={"description"}
                                      label={""}
                                      value={
                                        transferForm.description && transferForm.description != undefined
                                          ? transferForm.description
                                          : ""
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "description");
                                      }}
                                      readOnly={disableAmountType}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"amount"}
                                      label={""}
                                      value={
                                        transferForm.amount && transferForm.amount != null ? transferForm.amount : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount");
                                        handleInputChange(null, transferIndex, "quantity");
                                      }}
                                      min={0.01}
                                      precision={2}
                                      readOnly={disableAmount}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"quantity"}
                                      label={""}
                                      value={
                                        transferForm.quantity && transferForm.quantity != null
                                          ? transferForm.quantity
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "quantity");
                                        handleInputChange(null, transferIndex, "amount");
                                      }}
                                      min={0.01}
                                      precision={3}
                                      readOnly={disableQuantity}
                                    />
                                  </Flex>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"instruction-type-2"}
                                      label={""}
                                      value={
                                        transferForm.instruction_type_2 && transferForm.instruction_type_2 != undefined
                                          ? transferForm.instruction_type_2
                                          : ""
                                      }
                                      options={
                                        transferForm.transfer_type === "All mixed"
                                          ? instructionTypeOptions
                                          : partialInstructionTypeOptions
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "instruction_type_2");
                                        setDisableAmountType2(true);
                                        setDisableDescription2(true);
                                        setDisableAmount2(true);
                                        setDisableQuantity2(true);
                                        handleInputChange(undefined, transferIndex, "amount_type_2");
                                        handleInputChange(undefined, transferIndex, "description_2");
                                        handleInputChange(undefined, transferIndex, "amount_2");
                                        handleInputChange(undefined, transferIndex, "quantity_2");
                                        if (
                                          value === "Balance of account in cash" ||
                                          value === "Balance of account in kind"
                                        ) {
                                          setDisableAmountType2(true);
                                        } else {
                                          setDisableAmountType2(false);
                                        }
                                      }}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"amount-type-2"}
                                      label={""}
                                      value={
                                        transferForm.amount_type_2 && transferForm.amount_type_2 != undefined
                                          ? transferForm.amount_type_2
                                          : ""
                                      }
                                      options={[
                                        { label: "Full", value: "Full" },
                                        { label: "Partial", value: "Partial" },
                                      ]}
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_type_2");
                                        handleInputChange(null, transferIndex, "amount_2");
                                        handleInputChange(null, transferIndex, "quantity_2");
                                        setDisableAmount2(true);
                                        setDisableQuantity2(true);

                                        if (value === "Full") {
                                          setDisableAmount2(true);
                                          setDisableQuantity2(true);
                                        } else {
                                          setDisableAmount2(false);
                                          setDisableQuantity2(false);
                                        }
                                      }}
                                      readOnly={disableAmountType2}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Input
                                      name={"description-2"}
                                      label={""}
                                      value={
                                        transferForm.description_2 && transferForm.description_2 != undefined
                                          ? transferForm.description_2
                                          : ""
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "description_2");
                                      }}
                                      readOnly={disableAmountType2}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"amount-2"}
                                      label={""}
                                      value={
                                        transferForm.amount_2 && transferForm.amount_2 != null
                                          ? transferForm.amount_2
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_2");
                                        handleInputChange(null, transferIndex, "quantity_2");
                                      }}
                                      min={0.01}
                                      precision={2}
                                      readOnly={disableAmount2}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"quantity-2"}
                                      label={""}
                                      value={
                                        transferForm.quantity_2 && transferForm.quantity_2 != null
                                          ? transferForm.quantity_2
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "quantity_2");
                                        handleInputChange(null, transferIndex, "amount_2");
                                      }}
                                      min={0.01}
                                      precision={3}
                                      readOnly={disableQuantity2}
                                    />
                                  </Flex>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"instruction-type-3"}
                                      label={""}
                                      value={
                                        transferForm.instruction_type_3 && transferForm.instruction_type_3 != undefined
                                          ? transferForm.instruction_type_3
                                          : ""
                                      }
                                      options={
                                        transferForm.transfer_type === "All mixed"
                                          ? instructionTypeOptions
                                          : partialInstructionTypeOptions
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "instruction_type_3");
                                        setDisableAmountType3(true);
                                        setDisableDescription3(true);
                                        setDisableAmount3(true);
                                        setDisableQuantity3(true);
                                        handleInputChange(undefined, transferIndex, "amount_type_3");
                                        handleInputChange(undefined, transferIndex, "description_3");
                                        handleInputChange(undefined, transferIndex, "amount_3");
                                        handleInputChange(undefined, transferIndex, "quantity_3");
                                        if (
                                          value === "Balance of account in cash" ||
                                          value === "Balance of account in kind"
                                        ) {
                                          setDisableAmountType3(true);
                                        } else {
                                          setDisableAmountType3(false);
                                        }
                                      }}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"amount-type-3"}
                                      label={""}
                                      value={
                                        transferForm.amount_type_3 && transferForm.amount_type_3 != undefined
                                          ? transferForm.amount_type_3
                                          : ""
                                      }
                                      options={[
                                        { label: "Full", value: "Full" },
                                        { label: "Partial", value: "Partial" },
                                      ]}
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_type_3");
                                        handleInputChange(null, transferIndex, "amount_3");
                                        handleInputChange(null, transferIndex, "quantity_3");
                                        setDisableAmount3(true);
                                        setDisableQuantity3(true);

                                        if (value === "Full") {
                                          setDisableAmount3(true);
                                          setDisableQuantity3(true);
                                        } else {
                                          setDisableAmount3(false);
                                          setDisableQuantity3(false);
                                        }
                                      }}
                                      readOnly={disableAmountType3}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Input
                                      name={"description-3"}
                                      label={""}
                                      value={
                                        transferForm.description_3 && transferForm.description_3 != undefined
                                          ? transferForm.description_3
                                          : ""
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "description_3");
                                      }}
                                      readOnly={disableAmountType3}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"amount-3"}
                                      label={""}
                                      value={
                                        transferForm.amount_3 && transferForm.amount_3 != null
                                          ? transferForm.amount_3
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_3");
                                        handleInputChange(null, transferIndex, "quantity_3");
                                      }}
                                      min={0.01}
                                      precision={2}
                                      readOnly={disableAmount3}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"quantity-3"}
                                      label={""}
                                      value={
                                        transferForm.quantity_3 && transferForm.quantity_3 != null
                                          ? transferForm.quantity_3
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "quantity_3");
                                        handleInputChange(null, transferIndex, "amount_3");
                                      }}
                                      min={0.01}
                                      precision={3}
                                      readOnly={disableQuantity3}
                                    />
                                  </Flex>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"instruction-type-4"}
                                      label={""}
                                      value={
                                        transferForm.instruction_type_4 && transferForm.instruction_type_4 != undefined
                                          ? transferForm.instruction_type_4
                                          : ""
                                      }
                                      options={
                                        transferForm.transfer_type === "All mixed"
                                          ? instructionTypeOptions
                                          : partialInstructionTypeOptions
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "instruction_type_4");
                                        setDisableAmountType4(true);
                                        setDisableDescription4(true);
                                        setDisableAmount4(true);
                                        setDisableQuantity4(true);
                                        handleInputChange(undefined, transferIndex, "amount_type_4");
                                        handleInputChange(undefined, transferIndex, "description_4");
                                        handleInputChange(undefined, transferIndex, "amount_4");
                                        handleInputChange(undefined, transferIndex, "quantity_4");
                                        if (
                                          value === "Balance of account in cash" ||
                                          value === "Balance of account in kind"
                                        ) {
                                          setDisableAmountType4(true);
                                        } else {
                                          setDisableAmountType4(false);
                                        }
                                      }}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Select
                                      name={"amount-type-4"}
                                      label={""}
                                      value={
                                        transferForm.amount_type_4 && transferForm.amount_type_4 != undefined
                                          ? transferForm.amount_type_4
                                          : ""
                                      }
                                      options={[
                                        { label: "Full", value: "Full" },
                                        { label: "Partial", value: "Partial" },
                                      ]}
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_type_4");
                                        handleInputChange(null, transferIndex, "amount_4");
                                        handleInputChange(null, transferIndex, "quantity_4");
                                        setDisableAmount4(true);
                                        setDisableQuantity4(true);

                                        if (value === "Full") {
                                          setDisableAmount4(true);
                                          setDisableQuantity4(true);
                                        } else {
                                          setDisableAmount4(false);
                                          setDisableQuantity4(false);
                                        }
                                      }}
                                      readOnly={disableAmountType4}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <Input
                                      name={"description-4"}
                                      label={""}
                                      value={
                                        transferForm.description_4 && transferForm.description_4 != undefined
                                          ? transferForm.description_4
                                          : ""
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "description_4");
                                      }}
                                      readOnly={disableAmountType4}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"amount-4"}
                                      label={""}
                                      value={
                                        transferForm.amount_4 && transferForm.amount_4 != null
                                          ? transferForm.amount_4
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "amount_4");
                                        handleInputChange(null, transferIndex, "quantity_4");
                                      }}
                                      min={0.01}
                                      precision={2}
                                      readOnly={disableAmount4}
                                    />
                                  </Flex>
                                </TableCell>
                                <TableCell>
                                  <Flex direction={"column"}>
                                    <NumberInput
                                      name={"quantity-4"}
                                      label={""}
                                      value={
                                        transferForm.quantity_4 && transferForm.quantity_4 != null
                                          ? transferForm.quantity_4
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleInputChange(value, transferIndex, "quantity_4");
                                        handleInputChange(null, transferIndex, "amount_4");
                                      }}
                                      min={0.01}
                                      precision={3}
                                      readOnly={disableQuantity4}
                                    />
                                  </Flex>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </>
                      ) : (
                        <></>
                      )}
                    </Flex>
                  </Flex>
                </Tile>
              ))}
            </Flex>
            <Flex direction={"row"} gap={"sm"} justify={"between"}>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Button onClick={handleSaveClick} variant="primary">
                  Save
                </Button>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"end"}>
                <Button onClick={addTransfer} disabled={transferForms.length === 3}>
                  Add Transfer
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </>
      ) : (
        <>
          <Flex direction={"column"} gap={"md"}>
            <Flex direction={"row"} gap={"md"} justify={"between"}>
              <Button onClick={onCancelClick}>{"< Back"}</Button>
            </Flex>
            <Flex direction={"column"} gap={"md"} align={"center"}>
              <EmptyState title="There are no transfer forms yet" layout="vertical" reverseOrder={true}>
                <Text>Click to add a transfer form</Text>
                <Button onClick={addTransfer}>Add</Button>
              </EmptyState>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};
