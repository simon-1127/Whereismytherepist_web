import Link from "next/link";
import { Contours } from "../components/PageHeader";

export default function NotFound() {
  return (
    <main className="shell flex flex-1 items-center justify-center py-20">
      <div className="sheet relative max-w-xl overflow-hidden p-10 text-center">
        <Contours className="pointer-events-none absolute -right-24 -top-10 h-[140%] text-lilac" />
        <div className="relative">
          <h1 className="text-4xl font-bold">We couldn&rsquo;t find that page</h1>
          <p className="mt-3 text-ink-2">The link may be old, or the page may have moved.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/therapists" className="btn btn-primary">Find a therapist</Link>
            <Link href="/" className="btn btn-quiet">Go home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
