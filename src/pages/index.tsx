import { getOboToken, withAuthenticatedPage } from "@/auth/withAuth";
import {
  Accordion,
  BodyShort,
  Box,
  Button,
  Heading,
  HGrid,
  HStack,
  Label,
  Page,
  VStack,
} from "@navikt/ds-react";
import styles from "../styles/Home.module.css";
import { FileIcon } from "@navikt/aksel-icons";
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
import TextBox from "@/components/elements/TextBox";

interface Props {
  avtalemaler: Avtalemal[];
  kommuner: Kommune[];
}

const replacementToReadable = (replacement: Replacement) => {
  switch (replacement) {
    case Replacement.KOMMUNENAVN:
      return "<Navnet på kommunen>";
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
            <Accordion headingSize="medium">
              {avtalemaler.map((avtalemal) => {
                let replacements = Object.entries(avtalemal.replacementMap);
                return (
                  <Accordion.Item key={avtalemal.uuid}>
                    <Accordion.Header>
                      <HStack align="center">
                        <Link href={`/api/avtalemal${avtalemal.dokumentUrl}`}>
                          {avtalemal.navn}
                        </Link>
                        <FileIcon />
                        <Tags
                          publishedDate={avtalemal.publisert}
                          publishedStatus={publishedStatus(
                            avtalemal.publisert,
                            avtalemal,
                            kommuner.length,
                          )}
                        />
                      </HStack>
                    </Accordion.Header>
                    <Accordion.Content>
                      <VStack gap="4">
                        <HGrid gap="4" columns={2}>
                          <TextBox
                            id={"ingress_bokmal"}
                            label={"Ingress bokmål"}
                            text={avtalemal.ingress}
                          />
                          <TextBox
                            id={"ingress_nynorsk"}
                            label={"Ingress nynorsk"}
                            text={avtalemal.ingressNynorsk}
                          />
                          <TextBox
                            id={"kvitteringstekst_bokmal"}
                            label={"Kvitteringstekst bokmål"}
                            text={avtalemal.kvitteringstekst}
                          />
                          <TextBox
                            id={"kvitteringstekst_nynorsk"}
                            label={"Kvitteringstekst nynorsk"}
                            text={avtalemal.kvitteringstekstNynorsk}
                          />
                        </HGrid>
                        {replacements.length > 0 ? (
                          <Box>
                            <Label>Erstattes i endelig pdf:</Label>
                            <VStack gap="2">
                              {replacements.map(([key, value]) => {
                                return (
                                  <HStack
                                    align="center"
                                    gap={"2"}
                                    key={`${key}-${value}`}
                                  >
                                    <Box background={"surface-warning-subtle"}>
                                      {key}
                                    </Box>
                                    <Box>blir erstattet med</Box>
                                    <Box background="surface-warning-subtle">
                                      {replacementToReadable(value)}
                                    </Box>
                                  </HStack>
                                );
                              })}
                            </VStack>
                          </Box>
                        ) : null}
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
                          publiseringsinfoHref={`/${avtalemal.uuid}/publiseringsinfo`}
                        />
                      </VStack>
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
              {avtalemaler.length === 0 && (
                <BodyShort>Ingen avtalemaler enda</BodyShort>
              )}
            </Accordion>
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
