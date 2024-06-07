import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Button, Modal, VStack } from "@navikt/ds-react";
import { ExpandIcon } from "@navikt/aksel-icons";

interface Props {
  url: string;
  onClose: () => void;
}

const PreviewModal = (
  { url, onClose }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const pdfRef = useRef<HTMLObjectElement>(null);

  return (
    <Modal ref={ref} header={{ heading: "Forhåndsvisning" }} width="1000px">
      <Modal.Body>
        <VStack>
          <Button
            style={{ alignSelf: "end" }}
            variant="tertiary"
            icon={<ExpandIcon />}
            onClick={(it) => {
              if (it) {
                pdfRef.current?.requestFullscreen();
              }
            }}
          >
            Se i fullskjerm
          </Button>
          <object
            ref={pdfRef}
            width="100%"
            height="1280px"
            data={url}
            type="application/pdf"
          />
        </VStack>
      </Modal.Body>
      <Modal.Footer className={"!block space-y-4"}>
        <Button variant="secondary" onClick={onClose}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(PreviewModal);
