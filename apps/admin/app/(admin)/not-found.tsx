import Link from "next/link";

// Rendered inside the admin layout, so the side menu stays visible (e.g. /platforms/foo).
export default function AdminNotFound() {
  return (
    <>
      <h1 className="text-display">Siden findes ikke</h1>
      <Link href="/" className="text-subtitle underline">
        Gå til indbakken
      </Link>
    </>
  );
}
