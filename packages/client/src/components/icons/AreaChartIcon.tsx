import * as React from "react";
import { Svg } from "./Svg";

export const AreaChartIcon = ({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 512 512" className={className} title="Area chart icon">
    <path fill="currentColor" d="M500 384a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H12a12 12 0 0 1-12-12V76a12 12 0 0 1 12-12h40a12 12 0 0 1 12 12v308h436zM372.7 159.5 288 216l-85.3-113.7a12 12 0 0 0-19.9 1L96 248v104h384l-89.9-187.8a12 12 0 0 0-17.4-4.7z"/>
  </Svg>
);
