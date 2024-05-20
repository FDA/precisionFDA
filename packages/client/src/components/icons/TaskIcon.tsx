import * as React from "react";
import { Svg } from "./Svg";

export const TaskIcon = ({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 512 512" className={className} title="Stack of books denoting a task">
    <path fill="currentColor" d="M488 351H24a24 24 0 0 0-24 24v80a24 24 0 0 0 24 24h464a24 24 0 0 0 24-24v-80a24 24 0 0 0-24-24zm-24 80H289v-32h175v32zm24-240H24a24 24 0 0 0-24 24v80a24 24 0 0 0 24 24h464a24 24 0 0 0 24-24v-80a24 24 0 0 0-24-24zm-24 80H161v-32h303v32zm24-240H24A24 24 0 0 0 0 55v80a24 24 0 0 0 24 24h464a24 24 0 0 0 24-24V55a24 24 0 0 0-24-24zm-24 80H353V79h111v32z"/>
  </Svg>
);
