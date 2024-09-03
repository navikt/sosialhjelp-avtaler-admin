import React from "react";
import { BodyLong, Box, Label } from "@navikt/ds-react";
import styles from "@/styles/TextBox.module.css";

interface Props {
  text?: string;
  id: string;
  label: string;
}

const TextBox = ({ text, id, label }: Props): React.JSX.Element => (
  <Box>
    <Label htmlFor={id}>{label}</Label>
    {text && (
      <Box padding="4" background="surface-info-subtle">
        <BodyLong id={id} className={styles.whiteSpace}>
          {text}
        </BodyLong>
      </Box>
    )}
  </Box>
);

export default TextBox;
