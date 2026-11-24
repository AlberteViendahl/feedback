export type SvgIconProps = {
  className?: string;
  /** Leave out for decorative icons. */
  label?: string;
};

/** The SVG icons have no size of their own; `icon-size` in globals.css sets it. */
export function svgIconAttributes({ className, label }: SvgIconProps) {
  return {
    className: className ? `icon-size ${className}` : "icon-size",
    ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true }),
  };
}
