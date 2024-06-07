import React, { ForwardedRef, forwardRef, useRef, useState } from "react";
import { BodyShort, Button, Heading, Modal } from "@navikt/ds-react";
import FilePreviewButtons from "@/components/modal/filepreview/FilePreviewButtons";

interface Props {
  url: string;
  onClose: () => void;
}

const PreviewModal = (
  { url, onClose }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  const ref2 = useRef<HTMLObjectElement>(null);

  return (
    <Modal ref={ref} header={{ heading: "Forhåndsvisning" }} width="1000px">
      <Modal.Body>
        <div>
          <FilePreviewButtons
            isFullscreen={isFullscreen}
            setFullscreen={(it) => {
              if (it) {
                ref2.current?.requestFullscreen();
              } else {
                document?.exitFullscreen();
              }
            }}
          />
          <object
            ref={ref2}
            width="100%"
            height="1280px"
            data={url}
            type="application/pdf"
          />
        </div>
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
