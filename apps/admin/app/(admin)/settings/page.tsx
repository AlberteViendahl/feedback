import type { Metadata } from "next";

// Placeholder page (spec 002, FR-009); the real settings are a separate feature.

export const metadata = {
  title: "Indstillinger",
} satisfies Metadata;

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-display">Indstillinger</h1>
      <p className="text-subtitle">Denne side er tom indtil videre.</p>
    </>
  );
}
