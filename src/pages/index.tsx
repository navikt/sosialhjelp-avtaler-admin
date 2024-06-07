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
import { ArrowRightIcon, FileIcon, TrashIcon } from "@navikt/aksel-icons";
import React, { useRef, useState } from "react";
import NyAvtalemalModal from "@/components/modal/NyAvtalemalModal";
import { Avtalemal, Replacement } from "@/types/Avtalemal";
import Link from "next/link";
import useMutations from "@/hooks/useMutations";
import PreviewModal from "@/components/modal/PreviewModal";
import PublishModal from "@/components/modal/PublishModal";
import { Kommune } from "@/types/Kommune";
import publishModal from "@/components/modal/PublishModal";

interface Props {
  avtalemaler: Avtalemal[];
  kommuner: Kommune[];
}

const replacementToReadable = (replacement: Replacement) => {
  switch (replacement) {
    case Replacement.KOMMUNENAVN:
      return "<Kommunenavn>";
    case Replacement.KOMMUNEORGNR:
      return "<Kommunens orgnr>";
    case Replacement.DATO:
      return "<Dato>";
    default:
      return replacement;
  }
};

export default function Home({ avtalemaler, kommuner }: Props) {
  const nyAvtaleModalRef = useRef<HTMLDialogElement>(null);
  const previewModalRef = useRef<HTMLDialogElement>(null);
  const publishModalRef = useRef<HTMLDialogElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishUuid, setPublishUuid] = useState<string | null>(null);

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
                    <VStack gap="3">
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
                          <>
                            {avtalemal.publishedTo.length > 0 && (
                              <Tag variant="warning-moderate" size="small">
                                Delvis publisert
                              </Tag>
                            )}
                            {avtalemal.publishedTo.length === 0 && (
                              <Tag variant="success-moderate" size="small">
                                Publisert{" "}
                                {new Date(avtalemal.publisert).toDateString()}
                              </Tag>
                            )}
                          </>
                        )}
                        {!avtalemal.publisert && (
                          <Tag variant="warning-moderate" size="small">
                            Ikke publisert
                          </Tag>
                        )}
                      </HStack>
                      {Object.entries(avtalemal.replacementMap).map(
                        ([key, value]) => {
                          return (
                            <HStack align="center" key={`${key}-${value}`}>
                              {key} <ArrowRightIcon />{" "}
                              {replacementToReadable(value)}
                            </HStack>
                          );
                        },
                      )}
                    </VStack>
                    <HStack gap="4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setPreviewUrl(
                            `/sosialhjelp/avtaler-admin/api/avtalemal${avtalemal.previewUrl}`,
                          );
                          previewModalRef.current?.showModal();
                        }}
                      >
                        Forhåndsvis med eksempeldata
                      </Button>
                      <Button
                        disabled={
                          !!avtalemal.publisert &&
                          avtalemal.publishedTo.length === kommuner.length
                        }
                        onClick={() => {
                          setPublishUuid(avtalemal.uuid);
                          return publishModalRef.current?.showModal();
                        }}
                      >
                        Publisér
                      </Button>
                      <Button
                        variant="danger"
                        disabled={!!avtalemal.publisert}
                        icon={<TrashIcon />}
                        onClick={() => deleteAvtalemal(avtalemal.uuid)}
                      />
                    </HStack>
                  </HStack>
                </Box>
              ))}
              {avtalemaler.length === 0 && (
                <BodyShort>Ingen avtalemaler enda</BodyShort>
              )}
            </VStack>
            <Button
              style={{ marginTop: "1rem" }}
              onClick={() => {
                nyAvtaleModalRef.current?.showModal();
              }}
            >
              Opprett ny avtalemal
            </Button>
          </Page.Block>
        </div>
      </div>
      <NyAvtalemalModal ref={nyAvtaleModalRef} submit={createAvtalemal} />
      <PreviewModal
        ref={previewModalRef}
        url={previewUrl!}
        onClose={() => {
          setPreviewUrl(null);
          previewModalRef.current?.close();
        }}
      />
      <PublishModal
        ref={publishModalRef}
        onClose={() => {
          setPublishUuid(null);
          publishModalRef.current?.close();
        }}
        onSubmit={(uuid, data) =>
          publishAvtalemal(uuid, data ? JSON.stringify(data) : undefined)
        }
        uuid={publishUuid}
        kommuner={kommuner}
        alreadyPublished={
          avtalemaler.find((avtalemal) => avtalemal.uuid === publishUuid)
            ?.publishedTo
        }
      />
    </Page>
  );
}

export const getServerSideProps = withAuthenticatedPage(
  async (context, token) => {
    const avtalemalerPromise = fetchAvtalemaler(token);
    const kommunerPromise = fetchKommuner(token);
    const [avtalemaler, kommuner] = await Promise.all([
      avtalemalerPromise,
      kommunerPromise,
    ]);
    const deduped = dedupeKommuner(kommuner);
    return {
      props: {
        avtalemaler,
        kommuner: deduped,
      },
    };
  },
);

// Noen kommuner har likt navn, så postfixer med orgnr for å unngå rendering errors
const dedupeKommuner = (array: Array<Kommune>): Array<Kommune> => {
  return array.map((it) => ({
    ...it,
    navn:
      it.navn === "HERØY KOMMUNE" || it.navn === "VÅLER KOMMUNE"
        ? `${it.navn} (${it.orgnr})`
        : it.navn,
  }));
};

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

const fetchKommuner = async (token: string): Promise<Kommune[]> => {
  const url = `http://${process.env.NEXT_AVTALER_API_HOSTNAME}/sosialhjelp/avtaler-api/api/kommuner`;
  const oboToken = await getOboToken(token);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${oboToken}` },
  });

  if (response.status > 299) {
    console.error(
      "Failed to fetch kommuner, status: ",
      response.status,
      " - ",
      response.statusText,
    );
    throw new Error(await response.text());
  }

  return response.json();
};
