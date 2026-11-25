import type { ComponentType } from "react";
import type { CategoryColor, CategoryIcon } from "@/lib/types";
import { BranchIcon } from "./BranchIcon";
import { BugIcon } from "./BugIcon";
import { InboxIcon } from "./InboxIcon";
import { LightbulbIcon } from "./LightbulbIcon";
import { MessageIcon } from "./MessageIcon";
import { PaperclipIcon } from "./PaperclipIcon";
import { ProgressIcon } from "./ProgressIcon";
import type { SvgIconProps } from "./svgIcon";

/** The icons a category can have, in the order the add dialog shows them (spec 006, FR-019). */
export const CATEGORY_ICONS: Record<CategoryIcon, { Icon: ComponentType<SvgIconProps>; label: string }> = {
  lightbulb: { Icon: LightbulbIcon, label: "Idé" },
  bug: { Icon: BugIcon, label: "Fejl" },
  message: { Icon: MessageIcon, label: "Besked" },
  inbox: { Icon: InboxIcon, label: "Indbakke" },
  paperclip: { Icon: PaperclipIcon, label: "Vedhæftning" },
  branch: { Icon: BranchIcon, label: "Forgrening" },
  progress: { Icon: ProgressIcon, label: "Fremskridt" },
};

/** Danish names of the category colours, in the order the add dialog shows them (FR-020). */
export const CATEGORY_COLOR_LABELS: Record<CategoryColor, string> = {
  red: "Rød",
  orange: "Orange",
  yellow: "Gul",
  green: "Grøn",
  teal: "Turkis",
  blue: "Blå",
  purple: "Lilla",
  pink: "Pink",
};
