"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "relevance", label: "Most reviewed" },
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
];

export default function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") || "relevance";

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-3">Sort by</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          e.target.value === "relevance" ? next.delete("sort") : next.set("sort", e.target.value);
          router.replace(`/therapists${next.toString() ? `?${next}` : ""}`, { scroll: false });
        }}
        className="rounded-full border border-line bg-paper py-2 pl-4 pr-8 font-semibold text-ink focus:border-ink focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
