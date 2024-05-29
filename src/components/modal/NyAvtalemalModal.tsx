import React, { ForwardedRef, forwardRef, useState } from "react";
import {
  Button,
  FileObject,
  Modal,
  TextField,
  UNSAFE_FileUpload,
  VStack,
} from "@navikt/ds-react";

interface Props {
  submit: (formData: FormData) => void;
}

const NyAvtalemalModal = (
  { submit }: Props,
  ref: ForwardedRef<HTMLDialogElement>,
): React.JSX.Element => {
  const [name, setName] = useState<string>("");
  const [files, setFiles] = useState<FileObject[]>([]);

  const close = () => {
    setName("");
    if (typeof ref === "function") {
      ref(null);
    } else {
      ref?.current?.close();
    }
  };

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("file", files[0].file, files[0].file.name);
    formData.append("metadata", JSON.stringify({ name }));
    submit(formData);
    close();
  };
  return (
    <Modal ref={ref} header={{ heading: "Ny avtalemal" }}>
      <Modal.Body style={{ width: "700px" }}>
        <form>
          <VStack gap="4">
            <TextField
              label="Navn"
              onChange={(event) => setName(event.currentTarget.value)}
            />
            <VStack gap="2">
              <UNSAFE_FileUpload.Dropzone
                label="Last opp avtalemalen her"
                fileLimit={{ max: 1, current: files.length }}
                multiple={false}
                onSelect={setFiles}
              />
              {files.map((file) => (
                <UNSAFE_FileUpload.Item
                  key={file.file.name}
                  file={file.file}
                  button={{ action: "delete", onClick: () => setFiles([]) }}
                />
              ))}
            </VStack>
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onSubmit}>
          Kjør på
        </Button>
        <Button type="button" variant="secondary" onClick={close}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default forwardRef<HTMLDialogElement, Props>(NyAvtalemalModal);
