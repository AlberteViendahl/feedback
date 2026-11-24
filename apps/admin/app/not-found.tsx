import Link from "next/link";

// The only not-found page: unknown URLs and notFound() (e.g. /platforms/foo) both land here,
// rendered in the root layout only, without the menu.
export default function NotFound() {
  return (
    <main className="app-shell__content">
      <h1 className="text-display">Siden findes ikke</h1>
      <Link href="/" className="text-subtitle underline">
        Gå til indbakken
      </Link>
    </main>
  );
}
