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
  Link as DsLink,
} from "@navikt/ds-react";
import styles from "../styles/Home.module.css";
import { FileIcon } from "@navikt/aksel-icons";
import { useRef } from "react";
import NyAvtalemalModal from "@/components/modal/NyAvtalemalModal";
import { useRouter } from "next/router";
import { Avtalemal } from "@/types/Avtalemal";
import Link from "next/link";

interface Props {
  avtalemaler: Avtalemal[];
}

export default function Home({ avtalemaler }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  const router = useRouter();
  const postNyAvtalemal = async (formData: FormData) => {
    const response = await fetch("/api/sosialhjelp/avtaler-api/api/avtalemal", {
      method: "POST",
      body: formData,
    });
    if (response.status < 300) {
      await router.replace(router.asPath);
    } else {
      console.error(
        "Failed to create avtalemal, status: ",
        response.status,
        " - ",
        response.statusText,
        ", message: ",
        await response.text(),
      );
    }
  };

  const postPubliserAvtalemal = async (uuid: string) => {
    const response = await fetch(
      `/api/sosialhjelp/avtaler-api/api/avtalemal/${uuid}/publiser`,
      {
        method: "POST",
      },
    );
    if (response.status < 300) {
      await router.replace(router.asPath);
    } else {
      console.error(
        "Failed to create avtalemal, status: ",
        response.status,
        " - ",
        response.statusText,
        ", message: ",
        await response.text(),
      );
    }
  };

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
                            <Link href={`/api${avtalemal.dokumentUrl}`}>
                              {avtalemal.navn}
                            </Link>
                            <FileIcon />
                          </HStack>
                        </Heading>
                        {avtalemal.publisert && (
                          <Tag variant="success-moderate" size="small">
                            Publisert {new Date(avtalemal.publisert).toDateString()}
                          </Tag>
                        )}
                        {!avtalemal.publisert && (
                          <Tag variant="warning-moderate" size="small">
                            Ikke publisert
                          </Tag>
                        )}
                      </HStack>
                    </VStack>
                    <Button
                      disabled={!!avtalemal.publisert}
                      onClick={async () => {
                        await postPubliserAvtalemal(avtalemal.uuid);
                      }}
                    >
                      Publisér
                    </Button>
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
      <NyAvtalemalModal ref={ref} submit={postNyAvtalemal} />
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

  let json = (await response.json()) as Avtalemal[];

  console.log(json);
  return json;
};
