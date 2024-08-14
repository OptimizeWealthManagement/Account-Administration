import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, Text, EmptyState, Flex } from "@hubspot/ui-extensions";
import { TicketRow } from "./TicketRow";
import type { TicketsTableProps } from "../types";

const PAGE_SIZE = 4;

export const TicketsTable = ({ searchTerm, onClick, tickets, pageNumber, onPageChange }: TicketsTableProps) => {
  const pageCount = Math.ceil(tickets.length / PAGE_SIZE);
  const paginatedTickets = tickets.slice((pageNumber - 1) * PAGE_SIZE, (pageNumber - 1) * PAGE_SIZE + PAGE_SIZE);

  if (paginatedTickets.length === 0) {
    return (
      <Flex direction={"column"} align={"center"}>
        <EmptyState title="Nothing here yet" layout="vertical" reverseOrder={true}>
          <Text>Submit a new account application</Text>
        </EmptyState>
      </Flex>
    );
  }

  return (
    <Table
      page={pageNumber}
      paginated={pageCount > 1}
      pageCount={pageCount}
      onPageChange={onPageChange}
      showFirstLastButtons={false}
    >
      <TableBody>
        {paginatedTickets.map((ticket) => (
          <TicketRow ticket={ticket} onClick={() => onClick(ticket.hs_object_id)} key={ticket.hs_object_id} />
        ))}
      </TableBody>
    </Table>
  );
};
