import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import {
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Page,
  Tag,
  VStack,
} from "@navikt/ds-react";
import styles from "../styles/Home.module.css";
import { FileIcon, TrashIcon } from "@navikt/aksel-icons";
import { useRef } from "react";
import NyAvtalemalModal from "@/components/modal/NyAvtalemalModal";
import { Avtalemal } from "@/types/Avtalemal";
import Link from "next/link";
import useMutations from "@/hooks/useMutations";

interface Props {
  avtalemaler: Avtalemal[];
}

export default function Home({ avtalemaler }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  const { deleteAvtalemal, createAvtalemal, publishAvtalemal } = useMutations();

  return (
    <Page contentBlockPadding="end">
      <div className={styles.blokk}>
        <Page.Block>
          <Heading size="large" spacing>
            Avtaler admin
          </Heading>
        </Page.Block>

        <div style={{ marginTop: "1rem" }}>
          <Page.Block>
            <VStack gap="4">
              {avtalemaler.map((avtalemal) => (
                <Box
                  key={avtalemal.uuid}
                  background="surface-info-subtle"
                  padding={"3"}
                >
                  <HStack justify="space-between" align="center">
                    <VStack>
                      <HStack align="center" gap="4">
                        <Heading size="medium">
                          <HStack align="center">
                            <Link
                              href={`/api/avtalemal${avtalemal.dokumentUrl}`}
                            >
                              {avtalemal.navn}
                            </Link>
                            <FileIcon />
                          </HStack>
                        </Heading>
                        {avtalemal.publisert && (
                          <Tag variant="success-moderate" size="small">
                            Publisert{" "}
                            {new Date(avtalemal.publisert).toDateString()}
                          </Tag>
                        )}
                        {!avtalemal.publisert && (
                          <Tag variant="warning-moderate" size="small">
                            Ikke publisert
                          </Tag>
                        )}
                      </HStack>
                    </VStack>
                    <HStack gap="4">
                      <Button
                        disabled={!!avtalemal.publisert}
                        onClick={() => publishAvtalemal(avtalemal.uuid)}
                      >
                        Publisér
                      </Button>
                      <Button
                        disabled={!!avtalemal.publisert}
                        icon={<TrashIcon />}
                        onClick={() => deleteAvtalemal(avtalemal.uuid)}
                      />
                    </HStack>
                  </HStack>
                </Box>
              ))}
              {avtalemaler.length === 0 && (
                <BodyShort>Ingen avtaler enda</BodyShort>
              )}
            </VStack>
            <Button
              style={{ marginTop: "1rem" }}
              onClick={() => {
                ref.current?.showModal();
              }}
            >
              Opprett ny avtalemal
            </Button>
          </Page.Block>
        </div>
      </div>
      <NyAvtalemalModal ref={ref} submit={createAvtalemal} />
    </Page>
  );
}

export const getServerSideProps = withAuthenticatedPage(
  async (context, token) => {
    const avtalemaler = await fetchAvtalemaler(token);

    return {
      props: {
        avtalemaler,
      },
    };
  },
);

const fetchAvtalemaler = async (token: string): Promise<Avtalemal[]> => {
  const url = `http://${process.env.NEXT_AVTALER_API_HOSTNAME}/sosialhjelp/avtaler-api/api/avtalemal`;
  const oboToken = await getOboToken(token);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${oboToken}` },
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
