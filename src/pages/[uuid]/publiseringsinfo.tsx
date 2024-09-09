import React, { useState } from "react";
import { Page, Heading, Box, VStack, SortState } from "@navikt/ds-react";
import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import dynamic from "next/dynamic";
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
  publiseringsinfo: Publiseringsinfo;
}

const Publiseringsinfo = ({ publiseringsinfo }: Props): React.JSX.Element => {
  const unsigned = Object.values(publiseringsinfo.unsignedOrgnrs).length;
  const signed = Object.values(publiseringsinfo.signedOrgnrs).length;
  const totalNumber = unsigned + signed;
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
          <SearchableTable
            rows={[
              ...Object.entries(publiseringsinfo.unsignedOrgnrs).map(
                ([orgnr, navn]) => ({
                  orgnr,
                  navn,
                  signert: false,
                }),
              ),
              ...Object.entries(publiseringsinfo.signedOrgnrs).map(
                ([orgnr, navn]) => ({
                  orgnr,
                  navn,
                  signert: true,
                }),
              ),
            ]}
          />
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

export interface Publiseringsinfo {
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
