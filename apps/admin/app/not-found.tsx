import Link from "next/link";

// The only not-found page. Unknown URLs (e.g. /foo) render it in the root layout, without the
// menu. Next.js also uses it as the not-found boundary inside the top-level (admin) route group,
// so notFound() there (e.g. /platforms/foo) renders it inside the admin layout, with the menu.
// That layout already has a <main>, so this page uses a <div> to avoid nesting one in another.
export default function NotFound() {
  return (
    <div className="app-shell__content">
      <h1 className="text-display">Siden findes ikke</h1>
      <Link href="/" className="text-subtitle underline">
        Gå til indbakken
      </Link>
    </div>
  );
}
