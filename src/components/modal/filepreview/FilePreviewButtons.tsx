import { Button } from "@navikt/ds-react";
import { ExpandIcon, ShrinkIcon } from "@navikt/aksel-icons";

const FilePreviewButtons = ({
  isFullscreen,
  setFullscreen,
}: {
  isFullscreen: boolean;
  setFullscreen: (isFullscreen: boolean) => void;
}) => {
  if (isFullscreen)
    return (
      <div
        className={
          "bg-white flex justify-between items-center px-4 py-2 w-full h-fit"
        }
      >
        <Button variant="primary" onClick={() => setFullscreen(false)}>
          <div>
            <ShrinkIcon />
            blabla
          </div>
        </Button>
      </div>
    );

  return (
    <div>
      <Button variant="tertiary" onClick={() => setFullscreen(true)}>
        <div>
          <ExpandIcon />
          blabla
        </div>
      </Button>
    </div>
  );
};

export default FilePreviewButtons;
