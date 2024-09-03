import React, { ForwardedRef, forwardRef, useMemo, useState } from "react";
import {
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  UNSAFE_Combobox,
  VStack,
} from "@navikt/ds-react";
import { Kommune } from "@/types/Kommune";
import usePublishingPolling from "@/hooks/usePublishingPolling";

interface Props {
  onSubmit: (uuid: string, data?: string[]) => Promise<void>;
  onClose: () => void;
  kommuner: Kommune[];
  uuid: string | null;
  alreadyPublished?: string[];
}

const PublishModal = (
  { onSubmit, onClose, kommuner, uuid, alreadyPublished }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const options = useMemo(
    () => kommuner.filter((it) => !alreadyPublished?.includes(it.orgnr)),
    [alreadyPublished, kommuner],
  );
  const [publishAll, setPublishAll] = useState<("Ja" | never)[]>([]);
  const [selectedKommuner, setSelectedKommuner] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(true);
  const { data, isLoading: isPolling } = usePublishingPolling(shouldPoll, uuid);

  if (
    !isLoading &&
    data?.every((it) => Boolean(it.avtaleUuid) || it.retryCount >= 5)
  ) {
    setShouldPoll(false);
  }
  const handleSubmit = async () => {
    if (publishAll[0] !== "Ja" && selectedKommuner.length === 0) {
      return;
    }
    if (!uuid) {
      throw new Error("uuid is null");
    }
    setIsLoading(true);
    if (publishAll[0] === "Ja") {
      await onSubmit(uuid, []);
    } else {
      await onSubmit(uuid, selectedKommuner);
    }
    setShouldPoll(true);
    setIsLoading(false);
  };
  const close = () => {
    setPublishAll([]);
    setSelectedKommuner([]);
    setShouldPoll(false);
    onClose();
  };
  return (
    <Modal
      ref={ref}
      header={{ heading: "Publiser avtaler" }}
      style={{ minHeight: "800px" }}
      width="800px"
      onClose={close}
    >
      <Modal.Body style={{ flex: "1 1 auto" }}>
        <VStack justify="space-between" gap="2">
          {shouldPoll && (
            <div>
              <BodyShort>Publiserer avtaler...</BodyShort>
              <BodyShort>Dette kan ta litt tid</BodyShort>
            </div>
          )}
          {!!alreadyPublished?.length && (
            <div>
              <BodyShort>
                Denne avtalemalen er allerede publisert til følgende kommuner:
              </BodyShort>
              <ul>
                {alreadyPublished.map((publishedOrgnr) => {
                  const kommune = kommuner.find(
                    (it) => it.orgnr === publishedOrgnr,
                  );
                  return (
                    <li key={publishedOrgnr}>
                      {publishedOrgnr} - {kommune?.navn}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <CheckboxGroup
            legend="Publisér alle"
            onChange={setPublishAll}
            value={publishAll}
          >
            <Checkbox value={"Ja"}>Ja</Checkbox>
          </CheckboxGroup>
          {!publishAll[0] && (
            <UNSAFE_Combobox
              allowNewValues
              options={options.map((it) => ({
                value: it.orgnr,
                label: it.navn,
              }))}
              onToggleSelected={(option, isSelected, isCustomValue) => {
                if (isCustomValue) {
                  setSelectedKommuner((prevState) => [...prevState, option]);
                  return;
                }
                if (isSelected) {
                  setSelectedKommuner((prevState) => [...prevState, option]);
                } else {
                  setSelectedKommuner((prevState) =>
                    prevState.filter((it) => it !== option),
                  );
                }
              }}
              isMultiSelect
              label="Kommune"
            />
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit} loading={isLoading}>
          Publisér
        </Button>
        <Button variant="secondary" onClick={close}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(PublishModal);
