"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LookupItem = { id: string; name: string };

function parseIds(value: string | null): Set<string> {
  return new Set(value ? value.split(",").filter(Boolean) : []);
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
  maxVisible = 6,
}: {
  title: string;
  options: LookupItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  maxVisible?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);

  if (options.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="font-semibold text-sm mb-4 text-slate-800">{title}</h4>
      <div className="space-y-3 text-sm text-slate-600 max-h-64 overflow-y-auto pr-1">
        {visibleOptions.map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer rounded-lg px-1.5 py-1 -mx-1.5 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <input
              type="checkbox"
              checked={selected.has(opt.id)}
              onChange={() => onToggle(opt.id)}
              className="w-4 h-4 rounded text-blue-600 transition-transform active:scale-90"
            />
            {opt.name}
          </label>
        ))}
      </div>
      {options.length > maxVisible && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 font-semibold hover:underline mt-3"
        >
          {showAll ? "Show less" : `Show ${options.length - maxVisible} more`}
        </button>
      )}
    </div>
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
  const searchParams = useSearchParams();

  const minLimit = 500;
  const maxLimit = 5000;

  const [minPrice, setMinPrice] = useState(parseInt(searchParams.get("minPrice") || "500"));
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get("maxPrice") || "5000"));
  const [selectedSpecialties, setSelectedSpecialties] = useState(parseIds(searchParams.get("specialties")));
  const [selectedLanguages, setSelectedLanguages] = useState(parseIds(searchParams.get("languages")));

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("minPrice", minPrice.toString());
      params.set("maxPrice", maxPrice.toString());

      if (selectedSpecialties.size > 0) params.set("specialties", Array.from(selectedSpecialties).join(","));
      else params.delete("specialties");

      if (selectedLanguages.size > 0) params.set("languages", Array.from(selectedLanguages).join(","));
      else params.delete("languages");

      if (params.toString() !== searchParams.toString()) {
        router.push(`?${params.toString()}`, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, selectedSpecialties, selectedLanguages]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 100));
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 100));
  };

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  const clearFilters = () => {
    setMinPrice(minLimit);
    setMaxPrice(maxLimit);
    setSelectedSpecialties(new Set());
    setSelectedLanguages(new Set());
    router.push("/therapists");
  };

  const leftPercent = ((minPrice - minLimit) / (maxLimit - minLimit)) * 100;
  const rightPercent = 100 - ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100;

  const hasActiveFilters =
    selectedSpecialties.size > 0 || selectedLanguages.size > 0 || minPrice !== minLimit || maxPrice !== maxLimit;

  return (
    <div className="w-full lg:w-72 shrink-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="font-bold text-[#1E1B4B] text-lg">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors">
            Clear all
          </button>
        )}
      </div>

      <CheckboxGroup
        title="Specialties"
        options={specialtyOptions}
        selected={selectedSpecialties}
        onToggle={(id) => toggle(selectedSpecialties, setSelectedSpecialties, id)}
      />

      <CheckboxGroup
        title="Languages"
        options={languageOptions}
        selected={selectedLanguages}
        onToggle={(id) => toggle(selectedLanguages, setSelectedLanguages, id)}
      />

      <div>
        <h4 className="font-semibold text-sm mb-6 text-slate-800">
          Price: ₹{minPrice} - ₹{maxPrice}
        </h4>

        <div className="relative h-1.5 bg-slate-200 rounded-full mb-4">
          <div
            className="absolute h-full bg-pink-500 rounded-full"
            style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
          ></div>

          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step="100"
            value={minPrice}
            onChange={handleMinChange}
            className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-pink-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
          />
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step="100"
            value={maxPrice}
            onChange={handleMaxChange}
            className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-pink-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>₹500</span>
          <span>₹5000+</span>
        </div>
      </div>
    </div>
  );
}
