import React from "react";
import { Button, HStack } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";

interface Props {
  onClickPreview: () => void;
  onClickPublish: () => void;
  onClickDelete: () => void;
  publishDisabled: boolean;
  deleteDisabled: boolean;
}

const ButtonRow = ({
  deleteDisabled,
  onClickPreview,
  publishDisabled,
  onClickPublish,
  onClickDelete,
}: Props): React.JSX.Element => {
  return (
    <HStack gap="4">
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
    </HStack>
  );
};

export default ButtonRow;
