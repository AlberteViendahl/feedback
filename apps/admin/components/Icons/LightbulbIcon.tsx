import { svgIconAttributes, type SvgIconProps } from "./svgIcon";

export function LightbulbIcon(props: SvgIconProps) {
  return (
    <svg viewBox="0 0 124 177" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgIconAttributes(props)}>
      <path
        d="M35.25 121.833C35.25 95.1667 8.5 95.1667 8.5 61.8333C8.5 47.6885 14.1366 34.1229 24.1698 24.121C34.203 14.119 47.8109 8.5 62 8.5C76.1891 8.5 89.797 14.119 99.8302 24.121C109.863 34.1229 115.5 47.6885 115.5 61.8333C115.5 95.1667 88.75 95.1667 88.75 121.833M35.25 141.833H88.75M41.9375 168.5H82.0625"
        strokeWidth="17"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#9A6700"
      />
    </svg>
  );
}
