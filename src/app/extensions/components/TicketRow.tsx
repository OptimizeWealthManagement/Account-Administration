import React from "react";
import { Heading, Button, Text, TableRow, TableCell, Box, Flex, Tag } from "@hubspot/ui-extensions";
import { CrmCardActions } from "@hubspot/ui-extensions/crm";
import type { TicketRowProps } from "../types";
// import { Rating } from './Rating';

// const timeRange = (minutes: number) => `${minutes - 5}-${minutes + 5} min`;

export const TicketRow = ({ ticket, onClick }: TicketRowProps) => {
  const { hs_object_id, subject, account_type_cad, account_type_us } = ticket;

  let cadAccounts = [];
  let usAccounts = [];

  if (account_type_cad) {
    let cadAccountsLabel = account_type_cad.label;
    cadAccounts = cadAccountsLabel.split(";");
  }

  if (account_type_us) {
    let usAccountsLabel = account_type_us.label;
    usAccounts = usAccountsLabel.split(";");
  }

  const usAccountsWithCurrency = usAccounts.map((account) => `${account} (USD)`);

  const allAccounts = [...cadAccounts, ...usAccountsWithCurrency].filter((account) => account).join(", ");

  const statusOptions = {
    "103949234": "New",
    "103949235": "In review",
    "103949236": "In process",
    "103949237": "Completed",
  };

  return (
    <TableRow>
      <TableCell>
        <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
          <Text format={{ fontWeight: "demibold" }}>
            {ticket.subject}
            <Text variant="microcopy" format={{ italic: true }} inline={false}>
              Ticket ID: {ticket.hs_object_id}
            </Text>
          </Text>
        </Flex>
      </TableCell>
      <TableCell>
        <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
          <Text format={{ italic: true }} inline={false}>
            {allAccounts}
          </Text>
        </Flex>
      </TableCell>
      <TableCell width="min">
        <Flex direction={"row"} gap={"md"} justify={"end"}>
          <Button onClick={onClick}>View</Button>
        </Flex>
      </TableCell>
    </TableRow>
  );
};
