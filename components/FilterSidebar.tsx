"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type LookupItem = { id: string; name: string };

import { SESSION_PRICE_MAX, SESSION_PRICE_MIN } from "../lib/pricing";

const MIN = SESSION_PRICE_MIN;
const MAX = SESSION_PRICE_MAX;
const STEP = 50;

function parseIds(v: string | null) {
  return new Set(v ? v.split(",").filter(Boolean) : []);
}

function ChipGroup({
  title,
  options,
  selected,
  onToggle,
  initial = 8,
}: {
  title: string;
  options: LookupItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  initial?: number;
}) {
  const [all, setAll] = useState(false);
  if (!options.length) return null;
  const shown = all ? options : options.slice(0, initial);
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="float-left mb-3 w-full text-sm font-semibold">{title}</legend>
      <div className="clear-left flex flex-wrap gap-2">
        {shown.map((o) => {
          const on = selected.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                on ? "bg-brand text-white" : "bg-mist text-ink-2 hover:bg-mist-2"
              }`}
            >
              {o.name}
            </button>
          );
        })}
      </div>
      {options.length > initial && (
        <button type="button" onClick={() => setAll(!all)} className="mt-3 text-sm font-semibold text-rose hover:underline">
          {all ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </fieldset>
  );
}

export default function FilterSidebar({
  specialtyOptions,
  languageOptions,
}: {
  specialtyOptions: LookupItem[];
  languageOptions: LookupItem[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(Number(params.get("minPrice")) || MIN);
  const [maxPrice, setMaxPrice] = useState(Number(params.get("maxPrice")) || MAX);
  const [specs, setSpecs] = useState(parseIds(params.get("specialties")));
  const [langs, setLangs] = useState(parseIds(params.get("languages")));
  const firstRun = useRef(true);

  useEffect(() => {
    // Don't push on mount: the old version immediately wrote minPrice=500
    // into the URL before anyone touched the slider.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      minPrice > MIN ? next.set("minPrice", String(minPrice)) : next.delete("minPrice");
      maxPrice < MAX ? next.set("maxPrice", String(maxPrice)) : next.delete("maxPrice");
      specs.size ? next.set("specialties", [...specs].join(",")) : next.delete("specialties");
      langs.size ? next.set("languages", [...langs].join(",")) : next.delete("languages");
      if (next.toString() !== params.toString()) {
        startTransition(() => router.replace(`/therapists${next.toString() ? `?${next}` : ""}`, { scroll: false }));
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, specs, langs]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    setter(n);
  };

  const active = specs.size > 0 || langs.size > 0 || minPrice > MIN || maxPrice < MAX;
  const left = ((minPrice - MIN) / (MAX - MIN)) * 100;
  const right = 100 - ((maxPrice - MIN) / (MAX - MIN)) * 100;
  const thumb =
    "absolute -top-2 h-5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand";

  return (
    <div className="card space-y-5 p-5" aria-busy={pending}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Narrow it down</h2>
        {active && (
          <button
            onClick={() => {
              firstRun.current = false;
              setMinPrice(MIN);
              setMaxPrice(MAX);
              setSpecs(new Set());
              setLangs(new Set());
            }}
            className="text-sm font-semibold text-rose hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <fieldset className="border-t border-line pt-5">
        <legend className="float-left mb-1 w-full text-sm font-semibold">Price per session</legend>
        <p className="clear-left mb-5 font-display text-lg font-semibold">
          ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
        </p>
        <div className="relative mx-1 h-1.5 rounded-full bg-mist-2">
          <div className="absolute h-full rounded-full bg-brand" style={{ left: `${left}%`, right: `${right}%` }} />
          <input aria-label="Minimum price" type="range" min={MIN} max={MAX} step={STEP} value={minPrice}
            onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - STEP))} className={thumb} />
          <input aria-label="Maximum price" type="range" min={MIN} max={MAX} step={STEP} value={maxPrice}
            onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + STEP))} className={thumb} />
        </div>
      </fieldset>

      <ChipGroup title="What you'd like help with" options={specialtyOptions} selected={specs} onToggle={(id) => toggle(specs, setSpecs, id)} />
      <ChipGroup title="Language" options={languageOptions} selected={langs} onToggle={(id) => toggle(langs, setLangs, id)} />
    </div>
  );
}
