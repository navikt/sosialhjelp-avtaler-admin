import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react";
import { Button, Modal, VStack } from "@navikt/ds-react";
import { ExpandIcon } from "@navikt/aksel-icons";
import PDFObject from "pdfobject";

interface Props {
  url: string;
  onClose: () => void;
}

const PreviewModal = (
  { url, onClose }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const embed = useRef<HTMLDivElement>(null);
  useEffect(() => {
    PDFObject.embed(url, embed.current, { supportRedirect: true });
  }, [url]);

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
                embed.current?.requestFullscreen();
              }
            }}
          >
            Se i fullskjerm
          </Button>
          <div style={{ width: "100%", height: "1280px" }} ref={embed} />
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
