import React from "react";
import { Button, HStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import Link from "next/link";

interface Props {
  onClickPreview: () => void;
  onClickPublish: () => void;
  onClickDelete: () => void;
  onClickExample: () => void;
  publishDisabled: boolean;
  deleteDisabled: boolean;
  publiseringsinfoHref: string;
}

const ButtonRow = ({
  deleteDisabled,
  onClickPreview,
  publishDisabled,
  onClickPublish,
  onClickDelete,
  onClickExample,
  publiseringsinfoHref,
}: Props): React.JSX.Element => {
  return (
    <HStack gap="4">
      <Button variant="secondary" onClick={onClickExample}>
        Se eksempel-pdf
      </Button>
      <Button variant="secondary" onClick={onClickPreview}>
        Forhåndsvis med eksempeldata
      </Button>
      <Button disabled={publishDisabled} onClick={onClickPublish}>
        Publisér
      </Button>
      <Button
        variant="danger"
        disabled={deleteDisabled}
        icon={<TrashIcon />}
        onClick={onClickDelete}
      />
      <Button variant="secondary" as={Link} href={publiseringsinfoHref}>Signeringsinfo</Button>
    </HStack>
  );
};

export default ButtonRow;
