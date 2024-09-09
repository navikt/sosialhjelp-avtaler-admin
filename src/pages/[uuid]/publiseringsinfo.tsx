import React, { useState } from "react";
import {
  Page,
  Heading,
  Box,
  HStack,
  Table,
  VStack,
  TextField,
  Pagination,
  SortState,
} from "@navikt/ds-react";
import useSWR from "swr";
import { GetServerSideProps } from "next";
import { Avtalemal } from "@/types/Avtalemal";
import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import { PieChart } from "react-minimal-pie-chart";

interface Props {
  publiseringsinfo: Publiseringsinfo;
}

interface ScopedSortState extends SortState {
  orderBy: "orgnr" | "navn" | "signert";
}

const rowsPerPage = 50;

function comparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] == null || b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const Publiseringsinfo = ({ publiseringsinfo }: Props): React.JSX.Element => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ScopedSortState | undefined>();
  const [search, setSearch] = useState<string>("");
  const handleSort = (sortKey: ScopedSortState["orderBy"]) => {
    setSort(
      sort && sortKey === sort.orderBy && sort.direction === "descending"
        ? undefined
        : {
            orderBy: sortKey,
            direction:
              sort && sortKey === sort.orderBy && sort.direction === "ascending"
                ? "descending"
                : "ascending",
          },
    );
  };
  const alt = [
    ...Object.entries(publiseringsinfo.unsignedOrgnrs).map(([orgnr, navn]) => ({
      orgnr,
      navn,
      signert: false,
    })),
    ...Object.entries(publiseringsinfo.signedOrgnrs).map(([orgnr, navn]) => ({
      orgnr,
      navn,
      signert: true,
    })),
  ];
  const filtered = alt.filter(
    (row) => row.navn.includes(search) || row.orgnr.includes(search),
  );
  const sortedData = filtered.slice().sort((a, b) => {
    if (sort) {
      return sort.direction === "ascending"
        ? comparator(b, a, sort.orderBy)
        : comparator(a, b, sort.orderBy);
    }
    return 1;
  });
  const paginated = sortedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );
  return (
    <Page contentBlockPadding="end">
      <Box>
        <Page.Block gutters>
          <Heading size="xlarge">Publiseringsinfo</Heading>
        </Page.Block>
      </Box>

      <VStack gap="4">
        <Page.Block gutters>
          <Heading size="large">Signeringstatus:</Heading>
          <Box style={{ width: "400px", height: "400px" }}>
            <PieChart
              data={[
                {
                  title: "Ikke signert",
                  value: Object.values(publiseringsinfo.unsignedOrgnrs).length,
                  color: "red",
                  key: "vadå",
                },
                {
                  title: "Signert",
                  value: Object.values(publiseringsinfo.signedOrgnrs).length,
                  color: "blue",
                  key: "vadå??",
                },
              ]}
            />
          </Box>
          <VStack gap="4">
            <TextField
              label={"Søk her"}
              onChange={(e) => setSearch(e.currentTarget.value)}
              value={search}
            />
            <Table
              sort={sort}
              onSortChange={(sortKey) =>
                handleSort(sortKey as ScopedSortState["orderBy"])
              }
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Orgnr</Table.HeaderCell>
                  <Table.ColumnHeader sortKey="navn" sortable>
                    Navn
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="signert" sortable>
                    Har signert
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginated.map((row) => (
                  <Table.Row key={row.orgnr}>
                    <Table.DataCell>{row.orgnr}</Table.DataCell>
                    <Table.DataCell>{row.navn}</Table.DataCell>
                    <Table.DataCell>
                      {row.signert ? "Ja" : "Nei"}
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {Math.ceil(alt.length / rowsPerPage) > 1 && (
              <Pagination
                page={page}
                onPageChange={setPage}
                count={Math.ceil(alt.length / rowsPerPage)}
                size="small"
              />
            )}
          </VStack>
        </Page.Block>
      </VStack>
    </Page>
  );
};

export const getServerSideProps = withAuthenticatedPage(
  async ({ params }, token) => {
    const uuid = params?.uuid as string;
    const publiseringsinfo = await fetchPubliseringsinfo(token, uuid);
    return {
      props: { publiseringsinfo },
    };
  },
);

interface Publiseringsinfo {
  signedOrgnrs: Record<string, string>;
  unsignedOrgnrs: Record<string, string>;
}

const fetchPubliseringsinfo = async (
  token: string,
  uuid: string,
): Promise<{
  signedOrgnrs: Record<string, string>;
  unsignedOrgnrs: Record<string, string>;
}> => {
  const url = `http://${process.env.NEXT_AVTALER_API_HOSTNAME}/sosialhjelp/avtaler-api/api/avtalemal/${uuid}/stats`;
  const oboToken = await getOboToken(token);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${oboToken}`,
      Accept: "application/json",
    },
  });

  if (response.status > 299) {
    console.error(
      "Failed to fetch avtalemaler, status: ",
      response.status,
      " - ",
      response.statusText,
    );
    throw new Error(await response.text());
  }

  return response.json();
};

export default Publiseringsinfo;
