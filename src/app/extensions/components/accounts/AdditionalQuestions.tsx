import React, { useEffect, useState } from "react";
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
} from "@hubspot/ui-extensions";
import { CrmCardActions, CrmActionButton } from "@hubspot/ui-extensions/crm";
import type {
  ModelProps,
  ModelFormProps,
  Kyc,
  BankAccountProps,
  AdditionalQuestions as AdditionalQuestionsType,
  BankAccountFormProps,
  AdditionalQuestionFormProps,
  MeetingDetailsFormProps,
  MeetingDetailsProps,
} from "../../types";

export const AdditionalQuestions = ({
  ticket,
  clients,
  kycs,
  context,
  runServerless,
  onCancelClick,
  onSaveClick,
  sendAlert,
}: AdditionalQuestionsType) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [formProperties, setFormProperties] = useState<Array<MeetingDetailsFormProps>>([]); // Set form props to update KYC object with information gathered
  const [disabled, setDisabled] = useState(true);
  const [bankNumberError, setBankNumberError] = useState(false);
  const [bankValidation, setBankValidation] = useState("");
  const [transitNumberError, setTransitNumberError] = useState(false);
  const [transitValidation, setTransitValidation] = useState("");
  const [accountNumberError, setAccountNumberError] = useState(false);
  const [accountValidation, setAccountValidation] = useState("");
  const [bankProps, setBankProps] = useState<AdditionalQuestionFormProps | null>(null);
  const [additionalQuestionProps, setAdditionalQuestionProps] = useState<AdditionalQuestionFormProps | null>(null);
  const [meetingDetailsProps, setMeetingDetailsProps] = useState<MeetingDetailsProps | null>(null);
  const [readOnly, setReadOnly] = useState({ first: true, second: true });
  const [confirmations, setConfirmations] = useState([
    "I confirm that I have reviewed the Private Client Program with the client and discussed the risks of investing.",
    "I confirm that I explained the risks of investment to the client including the fact that markets do fluctuate, there will always be a risk of loss within our model portfolios, and that past performance is not a guarantee of future performance.",
  ]);
  const [disclosures, setDisclosures] = useState(["COI", "RDI", "PMA", "Optimize Fund Disclosure"]);
  const [hasWPConfirmation, setHasWPConfirmation] = useState(false);
  const [hasPrivateConfirmation, setHasPrivateConfirmation] = useState(false);
  const [hasRiskConfirmation, setHasRiskConfirmation] = useState(false);

  // Error props
  const [disclosureError, setDisclosureError] = useState(false);
  const [familyServicesError, setFamilyServicesError] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);

  // Validation props
  const [disclosureValidation, setDisclosureValidation] = useState(
    "The above must be disclosed to the client, and the corresonding documentaiton must be provided to them following the meeting."
  );
  const [familyServicesValidation, setFamilyServicesValidation] = useState(
    "The client must be made aware of all family office services that will be made available to them once they become a client."
  );
  const [confirmationValidation, setConfirmationValidation] = useState(
    "The above must be confirmed before submiting a new account application."
  );

  const [existingMeetingType, setExistingMeetingType] = useState([]);

  const [showLocation, setShowLocation] = useState(false);
  const [showWpDetails, setShowWpDetails] = useState(false);
  const [showAdditionalQuestion, setShowAdditionalQuestions] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  const [isComplete, setIsComplete] = useState(false);
  const [meetingDetailsComplete, setMeetingDetailsComplete] = useState(false);
  const [formPropertiesAdded, setFormPropertiesAdded] = useState(false);

  const [meetingNote, setMeetingNote] = useState("");

  const [triggerSave, setTriggerSave] = useState(false);

  // Loop through the tickets object, find all of the keys that match the BankAccountFormProps keys, and map those values to the idProps object converting any values that are objects to their labels
  useEffect(() => {
    const newObject: { [key: string]: any } = {};
    const allowedKeys = [
      "meeting_type",
      "meeting_location",
      "wp_present",
      "wp_name",
      "other_attendees_present",
      "other_attendees",
      "onboarding_documentation_delivery_method",
      "disclosures_provided",
      "family_office_services",
      "additional_questions_options",
      "additional_questions",
      "client_confirmations",
    ];

    for (const [key, value] of Object.entries(ticket)) {
      if (!allowedKeys.includes(key as any)) continue; // Skip keys not in IdVerificationFormProps

      if (typeof value === "object" && value !== null && "label" in value) {
        newObject[key] = value.label.split("; ");
      } else {
        newObject[key] = value;
      }
    }

    setMeetingDetailsProps(newObject as MeetingDetailsFormProps);
  }, []); // Dependency array

  useEffect(() => {
    if (meetingDetailsProps && loading) {
      if (meetingDetailsProps && meetingDetailsProps.wp_present && meetingDetailsProps.wp_present.includes("Yes")) {
        setShowWpDetails(true);
      }

      if (
        meetingDetailsProps &&
        meetingDetailsProps.meeting_type &&
        meetingDetailsProps.meeting_type.includes("In Person")
      ) {
        setShowLocation(true);
      }

      if (
        meetingDetailsProps &&
        meetingDetailsProps.additional_questions_options &&
        meetingDetailsProps.additional_questions_options.includes("Yes")
      ) {
        setShowAdditionalQuestions(true);
      }

      if (
        meetingDetailsProps &&
        meetingDetailsProps.other_attendees_present &&
        meetingDetailsProps.other_attendees_present.includes("Yes")
      ) {
        setShowAttendees(true);
      }

      setLoading(false);
    }
  }, [meetingDetailsProps]);

  // Checks if all props are filled out
  useEffect(() => {
    const checkIfComplete = () => {
      if (meetingDetailsProps) {
        // Check if any of the required properties are null
        if (
          !meetingDetailsProps.meeting_type ||
          !meetingDetailsProps.onboarding_documentation_delivery_method ||
          !meetingDetailsProps.disclosures_provided ||
          !meetingDetailsProps.family_office_services ||
          !meetingDetailsProps.client_confirmations
        ) {
          return false;
        }

        const modifiedObject = Object.entries(meetingDetailsProps).reduce((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value.join("; ") : value;
          return acc;
        }, {});

        // Check conditions for properties that can be null
        if (
          (modifiedObject.meeting_type !== "Phone" &&
            (modifiedObject.meeting_location === null || modifiedObject.meeting_location === "")) ||
          (modifiedObject.wp_present !== "No" && (modifiedObject.wp_name === null || modifiedObject.wp_name === "")) ||
          (modifiedObject.other_attendees_present !== "No" &&
            (modifiedObject.other_attendees === null || modifiedObject.other_attendees === "")) ||
          (modifiedObject.additional_questions_options !== "No" &&
            (modifiedObject.additional_questions === null || modifiedObject.additional_questions === ""))
        ) {
          return false;
        }
      } else {
        return false;
      }

      return true;
    };

    const propsComplete = checkIfComplete();
    setMeetingDetailsComplete(propsComplete);
  }, [meetingDetailsProps]);

  // Check to ensure meeting details are complete, at least one form property has been added, and there are no validation errors in order to enable the submit button
  useEffect(() => {
    if (
      meetingDetailsComplete &&
      formPropertiesAdded &&
      !confirmationError &&
      !disclosureError &&
      !familyServicesError
    ) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [meetingDetailsComplete, formPropertiesAdded, confirmationError, disclosureError, familyServicesError]);

  // Update meeting props on ticket
  const updateTicket = () => {
    const ticketId = ticket.hs_object_id;
    // Fetch a list of associated new account application tickets
    runServerless({
      name: "updateTicketProperties",
      propertiesToSend: ["hs_object_id"],
      parameters: { formProperties, ticketId }, // Send ticket props
    })
      .then((resp) => {
        if (resp.status === "SUCCESS") {
          console.log("Response: ", resp.status);
          onSaveClick();
        } else {
          setError("Update application ticket resulted in an error", resp.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (triggerSave) {
      updateTicket();
    }
  }, [triggerSave]);

  const createMeetingNote = () => {
    const noteHeader = "<strong>Meeting Details</strong>";
    const confirmationHeader = "<strong>I confirmed the following with the client:</strong>";

    const modifiedObject = Object.entries(meetingDetailsProps).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value.join("; ") : value;
      return acc;
    }, {});

    const meetingTypeNote =
      modifiedObject.meeting_type === "Phone"
        ? "<em><strong>Where did the meeting take place?</strong></em> Phone"
        : `<em><strong>Where did the meeting take place?</strong></em> In Person, ${modifiedObject.meeting_location}`;
    const wpNote =
      modifiedObject.wp_present === "No"
        ? "<em><strong>Was a Wealth Planner who is not the acting Portfolio Manager or Associate Portfolio Manager present during the meeting?</strong></em> No"
        : `<em><strong>Was a Wealth Planner who is not the acting Portfolio Manager or Associate Portfolio Manager present during the meeting?</strong></em> Yes, ${meetingDetailsProps.wp_name}`;
    const attendeesNote =
      modifiedObject.other_attendees_present === "No"
        ? "<em><strong>Was there anyone else present during the meeting besides the Portfolio Manager, Associate Portfolio Manager, Wealth Planner, or the client?</strong></em> No"
        : `<em><strong>Was there anyone else present during the meeting besides the Portfolio Manager, Associate Portfolio Manager, Wealth Planner, or the client?</strong></em> Yes, ${meetingDetailsProps.other_attendees}`;
    const documentationDeliveryNote = `<em><strong>How will the Onboarding Documentation be provided to the client?</strong></em> ${modifiedObject.onboarding_documentation_delivery_method}`;
    const disclosureNote =
      modifiedObject.wp_present === "Yes"
        ? "<em><strong>The following disclosures were reviewed during the meeting and provided to the client following the meeting:</strong></em> Wealth Planner Acknowledgement, Conflict of Interest, Relationship Disclosure Information, Portfolio Management Agreement, and the Optimize Fund Disclosure."
        : "<em><strong>The following disclosures were reviewed during the meeting and provided to the client following the meeting:</strong></em> Conflict of Interest, Relationship Disclosure Information, Portfolio Management Agreement, and the Optimize Fund Disclosure.";
    const familyOfficeNote =
      "<em><strong>The following Family Office Services were discussed with the client, and it was explained that these services would be made available to them as clients of Optimize:</strong></em> Financial Planning, Will Preparation, Tax Preparation, Insurance, and Mortgage Assistance.";
    const additionalQuestionsNote =
      modifiedObject.additional_questions_options === "No"
        ? "<em><strong>Were there any additional questions which were asked by the client during the meeting?</strong></em> No"
        : `<em><strong>Were there any additional questions which were asked by the client during the meeting?</strong></em> Yes, the client asked the following: "${meetingDetailsProps.additional_questions}"`;
    const privateClientProgramNote =
      "I confirm that I have reviewed the Private Client Program with the client and discussed the risks of investing.";
    const investmentRiskNote =
      "I confirm that I explained the risks of investing to the client including the fact that markets do fluctuate, that there will always be a risk of loss within our model portfolios, and that past performance is not a guarantee of future performance.";
    const wealthPlannerAcknowledgementNote =
      modifiedObject.wp_present === "No"
        ? ""
        : "I confirm that the client will be provided with the Wealth Planner Acknowledgement and that any questions the client had around this acknowledgement were addressed.";

    const meetingNoteCombined = `<p><p>${noteHeader}</p>\n<p>${meetingTypeNote}</p>\n<p>${wpNote}</p>\n<p>${attendeesNote}</p>\n<p>${documentationDeliveryNote}</p>\n<p>${disclosureNote}</p>\n<p>${familyOfficeNote}</p>\n<p>${additionalQuestionsNote}</p>\n\n<p>${confirmationHeader}</p>\n<p>${privateClientProgramNote}</p>\n<p>${investmentRiskNote}</p>\n<p>${wealthPlannerAcknowledgementNote}</p></p>`;

    setFormProperties({
      ...formProperties,
      meeting_detail_note: meetingNoteCombined,
    });

    setTriggerSave(true);
  };

  const confirmationValues = {
    "I confirm that the client will be provided with the Wealth Planner Acknowledgement and that any questions the client had around this acknowledgement were addressed.":
      "WP Confirmation",
    "I confirm that I have reviewed the Private Client Program with the client and discussed the risks of investing.":
      "Private Client Program Confirmation",
    "I confirm that I explained the risks of investment to the client including the fact that markets do fluctuate, there will always be a risk of loss within our model portfolios, and that past performance is not a guarantee of future performance.":
      "Risk of Investment Confirmation",
  };

  useEffect(() => {
    if (meetingDetailsProps && meetingDetailsProps.disclosures_provided) {
      const requiredDisclosures = disclosures;
      const disclosuresComplete = requiredDisclosures.every((element) =>
        meetingDetailsProps.disclosures_provided.includes(element)
      );
      if (disclosuresComplete) {
        setDisclosureError(false);
      } else {
        setDisclosureError(true);
      }
    }

    if (meetingDetailsProps && meetingDetailsProps.family_office_services) {
      const requiredFamilyServices = [
        "Financial Planning",
        "Will Preparation",
        "Tax Preparation",
        "Insurance",
        "Mortgage Assistance",
      ];
      const familyServicesComplete = requiredFamilyServices.every((element) =>
        meetingDetailsProps.family_office_services.includes(element)
      );
      if (familyServicesComplete) {
        setFamilyServicesError(false);
      } else {
        setFamilyServicesError(true);
      }
    }

    if (meetingDetailsProps && meetingDetailsProps.client_confirmations) {
      const requiredConfirmations = confirmations;
      const confirmationsComplete = requiredConfirmations.every((element) =>
        meetingDetailsProps.client_confirmations.includes(confirmationValues[element])
      );
      if (confirmationsComplete) {
        setConfirmationError(false);
      } else {
        setConfirmationError(true);
      }
    }
  }, [meetingDetailsProps, disclosures, confirmations]);

  const convertArrayToString = (value: any[]) => {
    const arrayValue = value;
    const stringValue = arrayValue.join("; ");

    return stringValue;
  };

  const getValue = (key: keyof MeetingDetailsFormProps) => {
    // const suffix = index === 1 ? '_2' : ''; // append '_2' for second index, leave empty for first
    const newKey = `${key}` as keyof MeetingDetailsFormProps;

    if (!meetingDetailsProps) {
      return null;
    }

    if (meetingDetailsProps[newKey]) {
      if (newKey === "client_confirmations") {
        const confirmationArray = meetingDetailsProps[newKey];
        const mappedValues = confirmationArray.map((item) => confirmationValues[item] || item);
        return mappedValues;
      }

      if (newKey === "disclosures_provided") {
        const value = meetingDetailsProps[newKey];
        return value;
      }

      if (newKey === "family_office_services") {
        const value = meetingDetailsProps[newKey];
        return value;
      }

      const value = meetingDetailsProps[newKey];

      if (Array.isArray(value)) {
        return value.join("; ");
      }

      return meetingDetailsProps[newKey];
    } else {
      return null;
    }
  };

  const handleChange = (key: keyof MeetingDetailsFormProps, value: any) => {
    const newKey = `${key}` as keyof MeetingDetailsFormProps;

    const formattedValue = Array.isArray(value) ? convertArrayToString(value) : value;

    setFormProperties((prevState) => ({
      ...prevState,
      [newKey]: formattedValue,
    }));

    setMeetingDetailsProps((prevState) => ({
      ...prevState,
      [newKey]: value,
    }));

    setFormPropertiesAdded(true);
  };

  const handleChangeArray = (key: keyof MeetingDetailsFormProps, value: any) => {
    const newKey = `${key}` as keyof MeetingDetailsFormProps;

    const formattedValue = Array.isArray(value) ? convertArrayToString(value) : value;

    if (
      newKey === "wp_present" &&
      value === "No" &&
      meetingDetailsProps &&
      meetingDetailsProps.client_confirmations &&
      meetingDetailsProps.disclosures_provided
    ) {
      const updatedConfirmations = meetingDetailsProps.client_confirmations.filter(
        (item) => item !== "WP Confirmation"
      );
      const updatedDisclosures = meetingDetailsProps.disclosures_provided.filter(
        (item) => item !== "Wealth Planner Acknowledgement"
      );

      setFormProperties((prevState) => ({
        ...prevState,
        [newKey]: formattedValue,
        client_confirmations: updatedConfirmations.join("; "),
        wp_name: "",
        disclosures_provided: updatedDisclosures.join("; "),
      }));

      setMeetingDetailsProps((prevState) => ({
        ...prevState,
        [newKey]: value,
        client_confirmations: updatedConfirmations,
        wp_name: null,
        disclosures_provided: updatedDisclosures,
      }));

      setFormPropertiesAdded(true);

      return;
    }

    setFormProperties((prevState) => ({
      ...prevState,
      [newKey]: formattedValue,
    }));

    setMeetingDetailsProps((prevState) => ({
      ...prevState,
      [newKey]: value,
    }));

    setFormPropertiesAdded(true);
  };

  const meetingTypeOptions = ["Phone", "In Person"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  const wpOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  const attendeesOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  const additionalQuestionsOptions = ["Yes", "No"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  const deliveryOptions = ["Electronically", "In Person During Meeting"].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  const disclosureDescriptions = {
    "COI": "Conflict of Interest",
    "RDI": "Relationship Disclosure Information",
    "PMA": "Portfolio Management Agreement",
    "Optimize Fund Disclosure": "",
  };

  const disclosureOptions = disclosures.map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: disclosureDescriptions[n],
  }));

  const familyOfficeServiceOptions = [
    "Financial Planning",
    "Will Preparation",
    "Tax Preparation",
    "Insurance",
    "Mortgage Assistance",
  ].map((n) => ({
    label: n,
    value: n,
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  useEffect(() => {
    const wpConfirmationItems =
      "I confirm that the client will be provided with the Wealth Planner Acknowledgement and that any questions the client had around this acknowledgement were addressed.";
    const wpDisclosure = "Wealth Planner Acknowledgement";

    if (showWpDetails && !confirmations.includes(wpConfirmationItems)) {
      const newConfirmations = [wpConfirmationItems, ...confirmations];

      sendAlert({
        type: "success",
        message: "Added: Wealth Planner Confirmation",
      });

      setConfirmations(newConfirmations);
    } else if (!showWpDetails && confirmations.includes(wpConfirmationItems)) {
      const newConfirmations = confirmations.filter((item) => item !== wpConfirmationItems);

      sendAlert({
        type: "info",
        message: "Removed: Wealth Planner Confirmation",
      });

      setConfirmations(newConfirmations);
    }

    if (showWpDetails && !disclosures.includes(wpDisclosure)) {
      const newDisclosures = [wpDisclosure, ...disclosures];

      sendAlert({
        type: "success",
        message: "Added: Wealth Planner Acknowledgement",
      });

      setDisclosures(newDisclosures);
    } else if (!showWpDetails && disclosures.includes(wpDisclosure)) {
      const newDisclosures = disclosures.filter((item) => item !== wpDisclosure);

      sendAlert({
        type: "info",
        message: "Removed: Wealth Planner Acknowledgement",
      });

      setDisclosures(newDisclosures);
    }
  }, [showWpDetails, confirmations, disclosures]);

  const confirmationOptions = confirmations.map((n) => ({
    label: n,
    value: confirmationValues[n],
    initialIsChecked: false,
    readonly: false,
    description: "",
  }));

  //Set loading state
  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  return (
    <>
      <Flex direction={"column"} gap={"md"}>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button onClick={onCancelClick}>{"< Back"}</Button>
        </Flex>
        <Flex direction={"column"} gap={"extra-small"}>
          <Flex direction={"row"} gap={"md"} justify={"between"}>
            <Heading>Meeting Details</Heading>
          </Flex>
          <Divider distance="sm" />
          <Tile>
            <Flex direction={"column"} gap={"md"}>
              <Alert title="Important" variant="info">
                Please provide the below details on the meeting that took place with the client, and provide details on
                any additional topics that were discussed during the meeting that are not already captured on the KYC.
              </Alert>
              <Flex direction={"column"} gap={"sm"}>
                <Flex direction={"row"} gap={"md"} justify={"start"}>
                  <ToggleGroup
                    name="meeting-type"
                    label="Where did the meeting take place?"
                    options={meetingTypeOptions}
                    inline={false}
                    toggleType="radioButtonList"
                    variant="default"
                    onChange={(items) => {
                      if (items === "In Person") {
                        handleChange("meeting_type", items!);
                        setShowLocation(true);
                      }

                      if (items === "Phone") {
                        handleChange("meeting_type", items!);
                        handleChange("meeting_location", "");
                        setShowLocation(false);
                      }

                      // handleChange('meeting_type', items!);
                    }}
                    value={getValue("meeting_type")}
                  />
                </Flex>
                ;
                {showLocation ? (
                  <>
                    <Flex direction={"row"} gap={"md"} justify={"start"}>
                      <Input
                        name="meeting-location"
                        label=""
                        description="Please provide the location where the in person meeting took place."
                        placeholder="Optimize Head Office, 161 Bay Street"
                        onChange={(value) => {
                          handleChange("meeting_location", value);
                        }}
                        value={getValue("meeting_location")}
                      />
                    </Flex>
                  </>
                ) : (
                  <></>
                )}
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Flex direction={"column"} gap={"sm"}>
                  <ToggleGroup
                    name="wp-present"
                    label="Was a Wealth Planner who is not the acting Portfolio Manager or Associate Portfolio Manager present during the meeting?"
                    options={wpOptions}
                    inline={false}
                    toggleType="radioButtonList"
                    variant="default"
                    onChange={(items) => {
                      if (items === "Yes") {
                        handleChangeArray("wp_present", items!);
                        setShowWpDetails(true);
                      }

                      if (items === "No") {
                        handleChangeArray("wp_present", items!);
                        // handleChangeArray('wp_name', "");
                        setShowWpDetails(false);
                      }
                    }}
                    value={getValue("wp_present")}
                  />
                  {showWpDetails ? (
                    <>
                      <Flex direction={"row"} gap={"md"} justify={"start"}>
                        <Input
                          name="wp-name"
                          label=""
                          description="Please provide the full name of the Wealth Planner who was present during the meeting."
                          placeholder="Jane Doe"
                          onChange={(value) => {
                            handleChange("wp_name", value);
                          }}
                          value={getValue("wp_name")}
                        />
                      </Flex>
                    </>
                  ) : (
                    <></>
                  )}
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Flex direction={"column"} gap={"sm"}>
                  <ToggleGroup
                    name="other-attendees"
                    label={
                      showWpDetails
                        ? "Was there anyone else present during the meeting besides yourself, the Wealth Planner, and client?"
                        : "Was there anyone else present during the meeting besides yourself and the client?"
                    }
                    options={attendeesOptions}
                    inline={false}
                    toggleType="radioButtonList"
                    variant="default"
                    onChange={(items) => {
                      if (items === "Yes") {
                        handleChange("other_attendees_present", items!);
                        setShowAttendees(true);
                      }

                      if (items === "No") {
                        handleChange("other_attendees_present", items!);
                        handleChange("other_attendees", "");
                        setShowAttendees(false);
                      }
                    }}
                    value={getValue("other_attendees_present")}
                  />
                  {showAttendees ? (
                    <>
                      <Flex direction={"row"} gap={"md"} justify={"start"}>
                        <TextArea
                          name="additional-attendees"
                          label=""
                          description="Please provide the full name on any additional attendees and their relationship to the client."
                          onChange={(value) => {
                            handleChange("other_attendees", value);
                          }}
                          resize={"vertical"}
                          cols={200}
                          rows={7}
                          value={getValue("other_attendees")}
                        />
                      </Flex>
                    </>
                  ) : (
                    <></>
                  )}
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="onboarding-doc-delivery"
                  label="How will the Onboarding Documentation be provided to the client?"
                  options={deliveryOptions}
                  inline={false}
                  toggleType="radioButtonList"
                  variant="default"
                  onChange={(items) => {
                    handleChange("onboarding_documentation_delivery_method", items!);
                  }}
                  value={getValue("onboarding_documentation_delivery_method")}
                />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="disclosures-provided"
                  label="Please select the disclosures which were reviewed with and will be provided to the client following the meeting."
                  options={disclosureOptions}
                  inline={false}
                  error={disclosureError}
                  validationMessage={disclosureValidation}
                  toggleType="checkboxList"
                  variant="default"
                  onChange={(items) => {
                    handleChange("disclosures_provided", items!);
                  }}
                  value={getValue("disclosures_provided") ? getValue("disclosures_provided") : []}
                />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="family-office-services-provided"
                  label="Please select the additional Family Office Services that you discussed with the client, which will be available to them as clients of Optimize."
                  options={familyOfficeServiceOptions}
                  inline={false}
                  error={familyServicesError}
                  validationMessage={familyServicesValidation}
                  toggleType="checkboxList"
                  variant="default"
                  onChange={(items) => {
                    handleChange("family_office_services", items!);
                  }}
                  value={getValue("family_office_services") ? getValue("family_office_services") : []}
                />
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <Flex direction={"column"} gap={"sm"}>
                  <ToggleGroup
                    name="additional-questions"
                    label="Were there any additional questions which were asked by the client during the meeting?"
                    options={additionalQuestionsOptions}
                    inline={false}
                    toggleType="radioButtonList"
                    variant="default"
                    onChange={(items) => {
                      if (items === "Yes") {
                        handleChange("additional_questions_options", items!);
                        setShowAdditionalQuestions(true);
                      }

                      if (items === "No") {
                        handleChange("additional_questions_options", items!);
                        handleChange("additional_questions", "");
                        setShowAdditionalQuestions(false);
                      }
                    }}
                    value={getValue("additional_questions_options")}
                  />
                  {showAdditionalQuestion ? (
                    <>
                      <Flex direction={"row"} gap={"md"} justify={"start"}>
                        <TextArea
                          name="additional-questions-string"
                          label=""
                          description="Please note the questions which were asked by the client during the meeting and provide your responses to those questions in the space provided below."
                          error={error}
                          validationMessage={validationMessage}
                          onChange={(value) => {
                            handleChange("additional_questions", value);
                            setValidationMessage(`${value.length} characters.`);
                          }}
                          resize={"vertical"}
                          cols={200}
                          rows={10}
                          value={getValue("additional_questions")}
                        />
                      </Flex>
                    </>
                  ) : (
                    <></>
                  )}
                </Flex>
              </Flex>
              <Flex direction={"row"} gap={"md"} justify={"start"}>
                <ToggleGroup
                  name="confirmations"
                  label="Please confirm the below"
                  options={confirmationOptions}
                  inline={false}
                  error={confirmationError}
                  validationMessage={confirmationValidation}
                  toggleType="checkboxList"
                  variant="default"
                  onChange={(items) => {
                    handleChangeArray("client_confirmations", items!);
                  }}
                  value={getValue("client_confirmations") ? getValue("client_confirmations") : []}
                />
              </Flex>
            </Flex>
          </Tile>
        </Flex>
        <Flex direction={"row"} gap={"md"} justify={"start"}>
          <Button variant="primary" onClick={createMeetingNote} disabled={!isComplete}>
            Save
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
