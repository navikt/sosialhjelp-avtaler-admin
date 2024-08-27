import React from "react";
import { Tag } from "@navikt/ds-react";

interface Props {
  publishedStatus: "partial" | "full" | "none";
  publishedDate: string;
}

const Tags = ({ publishedStatus, publishedDate }: Props): React.JSX.Element => {
  switch (publishedStatus) {
    case "none":
      return (
        <Tag variant="warning-moderate" size="small">
          Ikke publisert
        </Tag>
      );
    case "partial":
      return (
        <Tag variant="warning-moderate" size="small">
          Delvis publisert
        </Tag>
      );
    case "full":
      return (
        <Tag variant="success-moderate" size="small">
          Publisert {new Date(publishedDate).toDateString()}
        </Tag>
      );
  }
};

export default Tags;
