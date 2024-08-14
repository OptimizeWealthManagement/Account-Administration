import React, { useCallback, useState, useEffect } from "react";
import {
  Heading,
  Button,
  Table,
  TableBody,
  Divider,
  Flex,
  Tag,
  Accordion,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  LoadingSpinner,
  Text,
  Box,
  Select,
  Form,
} from "@hubspot/ui-extensions";
import { CrmStageTracker, CrmAssociationPivot } from "@hubspot/ui-extensions/crm";
// import { KycQuestions } from './KycQuestions';
import { TicketDetails } from "./TicketDetails";
import type { TicketDetailProps, Kyc, ApplicationsProps, Ticket } from "../types";

const PAGE_SIZE = 4;

export const Applications = ({
  fetchCrmObjectProperties,
  context,
  runServerless,
  sendAlert,
  onBackClick,
}: ApplicationsProps) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number>();
  const [tickets, setTickets] = useState<Array<Ticket>>([]); // Set ticket id for selected new application ticket
  const [error, setError] = useState<string>();

  const handleBackClick = useCallback(() => {
    setSelected(undefined);
    onBackClick;
  }, []);

  const ticketOptions = tickets.map((obj) => ({
    label: obj.subject,
    value: obj.hs_object_id,
  }));

  const getTickets = useCallback(() => {
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
        } else {
          setError(resp.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [runServerless]);

  // Fetch KYC data on load
  useEffect(() => {
    getTickets();
  }, []);

  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  //Set loading state
  if (selected) {
    return (
      <TicketDetails
        ticket={selected}
        context={context}
        runServerless={runServerless}
        onBackClick={handleBackClick}
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        sendAlert={sendAlert}
      />
    );
  }

  return (
    <Flex direction="column" justify="start" gap="medium">
      <Flex direction="row" justify="start" align="end" gap="medium">
        <Button onClick={onBackClick}>{"< Back"}</Button>
        <Form>
          <Select
            label=""
            name="application-select"
            placeholder="Select an application"
            options={ticketOptions}
            onChange={(value) => {
              setSelected(value ? Number(value) : undefined);
            }}
          />
        </Form>
      </Flex>
    </Flex>
  );
};
