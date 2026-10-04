"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="shell flex flex-1 items-center justify-center py-20">
      <div className="sheet max-w-lg p-8 text-center md:p-10">
        <h1 className="text-3xl font-bold">This page didn&rsquo;t load</h1>
        <p className="mt-3 text-ink-2">
          It&rsquo;s usually a dropped connection. Try again; if it keeps happening, sign out and back in.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-quiet">Go home</Link>
        </div>
        {error.digest && <p className="mt-6 text-[13px] text-ink-3">Reference {error.digest}</p>}
      </div>
    </main>
  );
}
