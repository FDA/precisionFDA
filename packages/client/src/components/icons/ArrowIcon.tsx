import * as React from "react";
import { theme } from "../../styles/theme";
import { Svg } from "./Svg";

export const ArrowIcon = ({
  className,
  color = theme.darkerGrey,
  width = 12,
  height = 7,
}: {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 12 7" className={className}>
    <path
      fill={color || 'currentColor'}
      d="M2.1.3L6 4.2l3.9-4a1 1 0 011.4 1.5L6.7 6.3a1 1 0 01-1.4 0L.7 1.7A1 1 0 012.1.3z"
    />
  </Svg>
);
