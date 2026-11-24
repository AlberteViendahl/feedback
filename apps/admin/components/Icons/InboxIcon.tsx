import { svgIconAttributes, type SvgIconProps } from "./svgIcon";

export function InboxIcon(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 176 121" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgIconAttributes(props)}>
      <path
        d="M8 67.0625V113H168V67.0625L148 8H28L8 67.0625ZM168 67.0625H121.333L108 93.3125H68L54.6667 67.0625H8"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
