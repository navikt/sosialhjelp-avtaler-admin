import React, { useState } from "react";
import { Page, Heading, Box, VStack, SortState } from "@navikt/ds-react";
import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import dynamic from "next/dynamic";
import { TableRow } from "@/components/elements/SearchableTable";

const PieChart = dynamic(() => import("@/components/elements/PieChart"), {
  ssr: false,
});
const SearchableTable = dynamic(
  () => import("@/components/elements/SearchableTable"),
  {
    ssr: false,
  },
);

interface Props {
  publiseringsinfo: Publiseringsinfo[];
}

const Publiseringsinfo = ({ publiseringsinfo }: Props): React.JSX.Element => {
  const unsigned = publiseringsinfo.filter(
    (avtale) => !avtale.hasSigned,
  ).length;
  const signed = publiseringsinfo.filter((avtale) => avtale.hasSigned).length;
  const totalNumber = publiseringsinfo.length;
  const data: TableRow[] = publiseringsinfo.map((avtale) => ({
    orgnr: avtale.orgnr,
    navn: avtale.name,
    timestamp: avtale.signedAt ? new Date(avtale.signedAt) : null,
    signert: avtale.hasSigned,
  }));
  return (
    <Page contentBlockPadding="end">
      <Page.Block gutters>
        <Box>
          <Heading size="xlarge">Publiseringsinfo</Heading>
        </Box>
      </Page.Block>

      <Page.Block gutters>
        <Box>
          <Heading size="large">Signeringstatus:</Heading>
          <PieChart
            data={[
              {
                title: `Ikke signert: ${unsigned} (${((unsigned / totalNumber) * 100).toFixed(0)}%)`,
                value: unsigned,
                color: "var(--a-surface-warning)",
                key: "vadå",
              },
              {
                title: `Signert: ${signed} (${((signed / totalNumber) * 100).toFixed(0)}%)`,
                value: signed,
                color: "var(--a-surface-success)",
                key: "vadå??",
              },
            ]}
          />
          <SearchableTable rows={data} />
        </Box>
      </Page.Block>
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

export interface Publiseringsinfo {
  orgnr: string;
  name: string;
  hasSigned: boolean;
  signedAt: string | null;
}

const fetchPubliseringsinfo = async (
  token: string,
  uuid: string,
): Promise<Publiseringsinfo[]> => {
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
