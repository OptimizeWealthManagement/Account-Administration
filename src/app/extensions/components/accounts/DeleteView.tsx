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
  TextArea,
  Alert,
} from "@hubspot/ui-extensions";
import type { ModelFormProps, Kyc, DeleteViewProps } from "../../types";

export const DeleteView = ({ ticketId, kyc, runServerless, onCancelClick, onSaveClick }: DeleteViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Set current step
  const [selected, setSelected] = useState(0); // Set selection property to toggle views
  const [formProperties, setFormProperties] = useState<Array<ModelFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);

  return (
    <Flex direction={"column"} gap={"md"} align={"center"} justify={"center"}>
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
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Investment Knowledge:</Text>
                <Text format={{ italic: true }}>{kyc.investment_knowledge.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Investment Experience:</Text>
                <Text format={{ italic: true }}>{experienceString}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Intended Use of Account:</Text>
                <Text format={{ italic: true }}>{kyc.intended_use_of_account.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Liquidity Needs:</Text>
                <Text format={{ italic: true }}>{kyc.liquidity_needs.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Time Horizon:</Text>
                <Text format={{ italic: true }}>{kyc.time_horizon.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Risk Tolerance:</Text>
                <Text format={{ italic: true }}>{kyc.risk_tolerance.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Risk Capacity:</Text>
                <Text format={{ italic: true }}>{kyc.risk_capacity.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Risk Capacity:</Text>
                <Text format={{ italic: true }}>{kyc.risk_capacity.label}</Text>
              </Flex>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <Text format={{ fontWeight: "demibold" }}>Investment Objective:</Text>
                <Text format={{ italic: true }}>{kyc.investment_objective.label}</Text>
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
                profile, please indicate which model portfolio you will be assigning them and provide your assessment as
                to the suitability of that model given their particular situation.
              </Text>
              <Flex direction={"row"} gap={"sm"} justify={"start"}>
                <ToggleGroup
                  name="assigned-model"
                  label=""
                  options={modelOptions}
                  toggleType="radioButtonList"
                  value={kyc && kyc.assigned_model ? kyc.assigned_model.label : ""}
                  onChange={(value) => {
                    setFormProperties({
                      ...formProperties,
                      assigned_model: value,
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
                          setValidationMessage(
                            value.length > 500
                              ? `${value.length} characters.`
                              : "Your assessment is too brief. Please provide more detail."
                          );
                          setError(value.length > 500 ? false : true);
                        }}
                        onInput={(value) => {
                          console.log("Model Suitability Updated");
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
                        value={kyc && kyc.model_suitability ? kyc.model_suitability : formProperties.model_suitability}
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
