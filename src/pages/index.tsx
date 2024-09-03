import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import {
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Page,
  VStack,
} from "@navikt/ds-react";
import styles from "../styles/Home.module.css";
import { ArrowRightIcon, FileIcon } from "@navikt/aksel-icons";
import React, { useRef, useState } from "react";
import NyAvtalemalModal from "@/components/modal/NyAvtalemalModal";
import { Avtalemal, Replacement } from "@/types/Avtalemal";
import Link from "next/link";
import useMutations from "@/hooks/useMutations";
import PublishModal from "@/components/modal/PublishModal";
import { Kommune } from "@/types/Kommune";
import Tags from "@/components/elements/Tags";
import ButtonRow from "@/components/elements/ButtonRow";
import PreviewModal from "@/components/modal/PreviewModal";

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

const publishedStatus = (
  publisert: string,
  avtalemal: Avtalemal,
  kommuneLength: number,
): "partial" | "full" | "none" => {
  if (!publisert) {
    return "none";
  }
  if (
    avtalemal.publishedTo.length > 0 &&
    avtalemal.publishedTo.length !== kommuneLength
  ) {
    return "partial";
  }
  if (
    avtalemal.publishedTo.length === 0 ||
    avtalemal.publishedTo.length === kommuneLength
  ) {
    return "full";
  }
  return "none";
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
                        <Tags
                          publishedDate={avtalemal.publisert}
                          publishedStatus={publishedStatus(
                            avtalemal.publisert,
                            avtalemal,
                            kommuner.length,
                          )}
                        />
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
                    <ButtonRow
                      onClickExample={() => {
                        setPreviewUrl(
                          `/sosialhjelp/avtaler-admin/api/avtalemal${avtalemal.exampleUrl}`,
                        );
                        previewModalRef.current?.showModal();
                      }}
                      onClickPreview={() => {
                        setPreviewUrl(
                          `/sosialhjelp/avtaler-admin/api/avtalemal${avtalemal.previewUrl}`,
                        );
                        previewModalRef.current?.showModal();
                      }}
                      onClickPublish={() => {
                        setPublishUuid(avtalemal.uuid);
                        return publishModalRef.current?.showModal();
                      }}
                      onClickDelete={() => deleteAvtalemal(avtalemal.uuid)}
                      publishDisabled={
                        !!avtalemal.publisert &&
                        avtalemal.publishedTo.length === kommuner.length
                      }
                      deleteDisabled={!!avtalemal.publisert}
                    />
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

export const getServerSideProps = withAuthenticatedPage(async (_, token) => {
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
});

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
