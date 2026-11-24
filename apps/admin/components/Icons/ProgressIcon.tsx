import { svgIconAttributes, type SvgIconProps } from "./svgIcon";

export function ProgressIcon(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 176 176" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgIconAttributes(props)}>
      <path
        d="M157.386 48.1816C166.262 63.6483 169.716 81.6372 167.199 99.2912C164.682 116.945 156.339 133.252 143.494 145.622C130.65 157.993 114.041 165.717 96.3045 167.568C78.5683 169.419 60.722 165.291 45.6001 155.84C30.4781 146.389 18.9474 132.156 12.8393 115.402C6.7312 98.6481 6.3959 80.3338 11.8866 63.3676C17.3774 46.4014 28.3794 31.7561 43.1453 21.7577C57.9112 11.7592 75.5944 6.98092 93.3865 8.18162"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
