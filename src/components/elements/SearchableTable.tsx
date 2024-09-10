import React, { useState } from "react";
import {
  Pagination,
  SortState,
  Table,
  TextField,
  VStack,
} from "@navikt/ds-react";

interface Props {
  rows: TableRow[];
}

export interface TableRow {
  orgnr: string;
  navn: string;
  signert: boolean;
  timestamp: Date | null;
}

interface ScopedSortState extends SortState {
  orderBy: "orgnr" | "navn" | "signert" | "timestamp";
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

const SearchableTable = ({ rows }: Props): React.JSX.Element => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ScopedSortState | undefined>({
    orderBy: "timestamp",
    direction: "descending",
  });
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

  const filtered = rows.filter(
    (row) =>
      row.navn.toLowerCase().includes(search.toLowerCase()) ||
      row.orgnr.includes(search),
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
    <VStack gap="4" style={{ maxWidth: "800px" }}>
      <TextField
        label={"Søk her"}
        style={{ maxWidth: "300px" }}
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
            <Table.ColumnHeader sortKey="timestamp" sortable>
              Signeringstidspunkt
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginated.map((row) => (
            <Table.Row key={row.orgnr}>
              <Table.DataCell>{row.orgnr}</Table.DataCell>
              <Table.DataCell>{row.navn}</Table.DataCell>
              <Table.DataCell>{row.signert ? "Ja" : "Nei"}</Table.DataCell>
              <Table.DataCell>
                {row.timestamp?.toLocaleString() ?? "-"}
              </Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {Math.ceil(rows.length / rowsPerPage) > 1 && (
        <Pagination
          page={page}
          onPageChange={setPage}
          count={Math.ceil(rows.length / rowsPerPage)}
          size="small"
        />
      )}
    </VStack>
  );
};

export default SearchableTable;
