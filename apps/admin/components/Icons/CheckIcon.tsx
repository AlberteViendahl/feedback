import { svgIconAttributes, type SvgIconProps } from "./svgIcon";

export function CheckIcon(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 176 135" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgIconAttributes(props)}>
      <path
        d="M8 76L58.5263 127L168 8"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
