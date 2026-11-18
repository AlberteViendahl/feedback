import Image from "next/image";

// SVGs downloaded from Figma (research R6), rendered at their own root size.
const ICONS = {
  "category-bug": { width: 31, height: 31 },
  "category-idea": { width: 31, height: 31 },
  "category-general": { width: 31, height: 31 },
  bug: { width: 13.4667, height: 14.05 },
  paperclip: { width: 12.2142, height: 11.5929 },
  image: { width: 18.3, height: 21.9667 },
  "play-circle": { width: 40, height: 40 },
  play: { width: 11.4718, height: 13.7662 },
  globe: { width: 12.8, height: 12.8 },
  external: { width: 11.8, height: 11.8 },
  user: { width: 10.8, height: 12.8 },
  monitor: { width: 12.8, height: 12.3 },
  calendar: { width: 11.8, height: 12.8 },
  branch: { width: 12.8833, height: 15.8 },
  reply: { width: 14.6333, height: 12.3 },
  sort: { width: 14.05, height: 12.3 },
  "chevron-down": { width: 8.8, height: 5.3 },
  settings: { width: 14.6334, height: 15.2167 },
  logout: { width: 14.05, height: 13.4667 },
  "platform-geotracking": { width: 28, height: 28 },
  "platform-simpleserp": { width: 28, height: 28 },
  "nav-globe": { width: 14.6333, height: 14.6333 },
  "nav-search": { width: 12.8833, height: 12.8833 },
  "workspace-avatar": { width: 28, height: 28 },
  "user-avatar": { width: 30, height: 30 },
  close: { width: 14, height: 14 },
  // nav-search.svg recoloured to #888888 (Figma 323:1710), as agreed while Figma was unavailable.
  search: { width: 12.8833, height: 12.8833 },
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  /** Empty for decorative icons. */
  alt?: string;
  className?: string;
};

export function Icon({ name, alt = "", className }: IconProps) {
  const { width, height } = ICONS[name];
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={width}
      height={height}
      alt={alt}
      className={className}
    />
  );
}
