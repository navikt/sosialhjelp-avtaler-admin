import React, { ForwardedRef, forwardRef, useState } from "react";
import {Button, Checkbox, CheckboxGroup, Modal, VStack} from "@navikt/ds-react";
import { ExpandIcon } from "@navikt/aksel-icons";

interface Props {
  onSubmit: (data: { orgnr?: string }) => void;
  onClose: () => void;
}

const PublishModal = (
  { onSubmit, onClose }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const [publishAll, setPublishAll] = useState([true]);
  return (
    <Modal ref={ref} header={{ heading: "Forhåndsvisning" }} width="1000px">
      <Modal.Body>
        <VStack>
          <CheckboxGroup legend="Publisér alle" onChange={setPublishAll} value={publishAll}>
            <Checkbox value={true}>Ja</Checkbox>
          </CheckboxGroup>
        </VStack>
      </Modal.Body>
      <Modal.Footer className={"!block space-y-4"}>
        <Button variant="secondary" onClick={onClose}>
          Lukk
        </Button>
        <Button onClick={() => onSubmit({})}>Publisér</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(PublishModal);
