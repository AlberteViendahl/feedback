import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLATFORMS, PLATFORM_LABELS, isPlatform } from "@/lib/platforms";

// Placeholder page (spec 002, FR-008). `dynamicParams = false` is unavailable with Cache
// Components, so unknown platforms are rejected here with notFound() (research R4).

export function generateStaticParams() {
  return PLATFORMS.map((platform) => ({ platform }));
}

export async function generateMetadata({
  params,
}: PageProps<"/platforms/[platform]">): Promise<Metadata> {
  const { platform } = await params;
  return isPlatform(platform) ? { title: PLATFORM_LABELS[platform] } : {};
}

export default async function PlatformPage({ params }: PageProps<"/platforms/[platform]">) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  return (
    <>
      <h1 className="text-display">{PLATFORM_LABELS[platform]}</h1>
      <p className="text-subtitle">Denne side er tom indtil videre.</p>
    </>
  );
}
