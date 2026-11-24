import { svgIconAttributes, type SvgIconProps } from "./svgIcon";

export function ArrowLeftIcon(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 159 133" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgIconAttributes(props)}>
      <path
        d="M59.1818 114.333L5 59.6667L59.1818 5M5 59.6667H93.0454C133.682 59.6667 154 87 154 128"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
