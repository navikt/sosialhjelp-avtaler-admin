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
  const handleSubmit = () => {
    if (!uuid) {
      throw new Error("uuid is null");
    }
    if (publishAll[0] === "Ja") {
      return onSubmit(uuid);
    }
    return onSubmit(uuid, selectedKommuner);
  };
  const close = () => {
    setPublishAll([]);
    setSelectedKommuner([]);
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
        <Button onClick={handleSubmit}>Publisér</Button>
        <Button variant="secondary" onClick={close}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(PublishModal);
