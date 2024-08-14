import React, { useCallback, useState, useEffect } from "react";
import { Flex, Input, Box } from "@hubspot/ui-extensions";
import { TicketsTable } from "./TicketsTable";
import type { TicketsSearchProps } from "../types";

export const TicketsSearch = ({ tickets, onTicketClick, onApplicationClick }: TicketsSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const handleTicketClick = useCallback((id: number) => {
    onTicketClick(id);
    setSearchTerm("");
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setPageNumber(1);
  }, []);

  const searchResults = tickets.filter(({ subject }) => {
    return [subject].some((prop) => {
      return prop.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <Flex direction="column" gap="md">
      <TicketsTable
        pageNumber={pageNumber}
        onClick={handleTicketClick}
        searchTerm={searchTerm}
        tickets={searchResults}
        onPageChange={setPageNumber}
      />
    </Flex>
  );
};
