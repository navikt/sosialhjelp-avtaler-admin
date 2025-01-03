import { Box } from "@navikt/ds-react";
import React from "react";
import {
  PieChart as MinimalPieChart,
} from "react-minimal-pie-chart";
import { Data } from "react-minimal-pie-chart/dist/commonTypes";

interface Props {
  data: Data;
}

const PieChart = ({ data }: Props) => {
  return (
    <Box style={{ width: "400px", height: "400px" }}>
      <MinimalPieChart
        animate
        labelStyle={{
          fontSize: "4px",
          fontFamily: "sans-serif",
        }}
        label={({ dataEntry }) =>
          dataEntry.value > 0 ? dataEntry.title : null
        }
        data={data}
      />
    </Box>
  );
};

export default PieChart;
