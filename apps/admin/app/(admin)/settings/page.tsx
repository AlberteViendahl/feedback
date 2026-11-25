import type { Metadata } from "next";
import { CategorySettings } from "@/components/category-settings/CategorySettings";

// Settings (spec 006): so far only the Categories card. The Team & Access card in the design is
// a separate feature.

export const metadata = {
  title: "Indstillinger",
} satisfies Metadata;

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-display">Indstillinger</h1>
      <p className="text-subtitle">Opsæt feedback-widget, kategorier, notifikationer og datahåndtering</p>
      <CategorySettings />
    </>
  );
}
