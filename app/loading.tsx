/** Instant feedback on every navigation while the server renders. */
export default function Loading() {
  return (
    <div className="shell py-10" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-72 max-w-full animate-pulse rounded-2xl bg-mist-2" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-mist-2" />
      <div className="mt-10 grid gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse card" />
        ))}
      </div>
    </div>
  );
}
