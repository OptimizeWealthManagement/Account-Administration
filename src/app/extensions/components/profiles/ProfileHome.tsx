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
  EmptyState,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  TableBody,
} from "@hubspot/ui-extensions";

import { CrmCardActions, CrmAssociationTable } from "@hubspot/ui-extensions/crm";

import { PersonalProfile } from "./PersonalProfile";
import { EmploymentProfile } from "./EmploymentProfile";
import { FinancialProfile } from "./FinancialProfile";
import { TaxResidencyProfile } from "./TaxResidencyProfile";
import type { ProfileHomeProps } from "../../types";

export const ProfileHome = ({
  fetchCrmObjectProperties,
  context,
  runServerless,
  sendAlert,
  onBackClick,
  onClick,
}: ProfileHomeProps) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number>(); //set selected profile to determine profile view

  if (loading) {
    return <LoadingSpinner layout="centered" label="Loading..." showLabel={true} />;
  }

  const handleBackClick = onBackClick;

  const clearSelection = useCallback(() => {
    setSelected(undefined);
  }, []);

  // const cancelApplication = useCallback(() => handleCancelledApplication, []);

  //Toggle opened accordion
  const handleApplicationClick = (applicationNumber: number) => {
    setApplicationType(applicationNumber);
    setSelected(5);
  };
  // Render personal profile
  if (selected && selected === 1) {
    return (
      <PersonalProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={clearSelection}
        onBackClick={clearSelection}
      />
    );
  }

  // Render employment profile
  if (selected && selected === 2) {
    return (
      <EmploymentProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={clearSelection}
        onBackClick={clearSelection}
      />
    );
  }

  // Render financial profile
  if (selected && selected === 3) {
    return (
      <FinancialProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={clearSelection}
        onBackClick={clearSelection}
      />
    );
  }

  // Render Investor Profile
  if (selected && selected === 4) {
    return (
      <PersonalProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={clearSelection}
        onBackClick={clearSelection}
      />
    );
  }

  // Render tax residency profile
  if (selected && selected === 5) {
    return (
      <PersonalProfile
        fetchCrmObjectProperties={fetchCrmObjectProperties}
        context={context}
        runServerless={runServerless}
        onClick={clearSelection}
        onBackClick={clearSelection}
      />
    );
  }

  return (
    <Flex direction={"column"} gap={"md"}>
      <Flex direction={"row"} gap={"md"} justify={"betweem"}>
        <Button onClick={onBackClick}>{"< Back"}</Button>
        {/* <Box></Box> */}
      </Flex>
      <Flex direction={"column"} gap={"extra-small"}>
        <Flex direction={"row"} gap={"md"} justify={"betweem"}>
          <Heading>Client Profile</Heading>
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
                        Personal Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Personal contact details and other related information"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Complete' : 'Incomplete'} */}
                          {"Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button
                        onClick={() => {
                          setSelected(1);
                          onClick(1);
                        }}
                      >
                        View
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Employment Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {
                            "Information related to a client's employment details, such as status, employer, and occupation"
                          }
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Incomplete' : 'Please complete KYC Questions'} */}
                          {"Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(2)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Financial Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"A breakdown of the client's sources of income and net worth"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Incomplete' : 'Please complete KYC Questions'} */}
                          {"Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      {/* <Button onClick={() => setSelected(3)} disabled={!kycCompleted}>View</Button> */}
                      <Button onClick={() => setSelected(3)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Investor Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Information related to investments at the client-level"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Incomplete' : 'Please complete KYC Questions'} */}
                          {"Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(4)}>View</Button>
                    </Flex>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Flex direction={"row"} justify={"start"} alignSelf={"center"}>
                      <Text format={{ fontWeight: "demibold" }}>
                        Tax Residency Profile
                        <Text variant="microcopy" format={{ italic: true }} inline={false}>
                          {"Information related to a client's citizenship and tax residency"}
                        </Text>
                      </Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Box flex={"none"}>
                        <Text format={{ italic: true }} inline={false}>
                          {/* {kycCompleted ? 'Incomplete' : 'Please complete KYC Questions'} */}
                          {"Incomplete"}
                        </Text>
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Flex direction={"row"} justify={"end"} alignSelf={"center"}>
                      <Button onClick={() => setSelected(5)}>View</Button>
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
