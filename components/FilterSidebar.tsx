"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const minLimit = 500;
  const maxLimit = 5000;

  // Read current prices from URL, default to limits if not set
  const [minPrice, setMinPrice] = useState(parseInt(searchParams.get("minPrice") || "500"));
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get("maxPrice") || "5000"));

  // This prevents the URL from updating on every single pixel movement (debouncing)
 useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // 1. Get the CURRENT prices from the URL
      const currentUrlMin = searchParams.get("minPrice") || "500";
      const currentUrlMax = searchParams.get("maxPrice") || "5000";
      
      // 2. ONLY push to the router if the slider value actually differs from the URL
      if (currentUrlMin !== minPrice.toString() || currentUrlMax !== maxPrice.toString()) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("minPrice", minPrice.toString());
        params.set("maxPrice", maxPrice.toString());
        
        // scroll: false prevents the page from jumping around while sliding
        router.push(`?${params.toString()}`, { scroll: false }); 
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [minPrice, maxPrice, router, searchParams]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value), maxPrice - 100);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseInt(e.target.value), minPrice + 100);
    setMaxPrice(value);
  };

  const clearFilters = () => {
    setMinPrice(minLimit);
    setMaxPrice(maxLimit);
    router.push("/therapists");
  };

  // Calculate percentages for the pink connecting track
  const leftPercent = ((minPrice - minLimit) / (maxLimit - minLimit)) * 100;
  const rightPercent = 100 - ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="w-full lg:w-64 shrink-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="font-bold text-[#1E1B4B] text-lg">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-blue-600 font-semibold hover:underline">Clear all</button>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold text-sm mb-4 text-slate-800">Specialties</h4>
        <div className="space-y-3 text-sm text-slate-600">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" /> Anxiety</label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-blue-600" /> Depression</label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-blue-600" /> Stress</label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-6 text-slate-800">Price: ₹{minPrice} - ₹{maxPrice}</h4>
        
        {/* DUAL SLIDER CONTAINER */}
        <div className="relative h-1.5 bg-slate-200 rounded-full mb-4">
          {/* The active pink track between the thumbs */}
          <div 
            className="absolute h-full bg-pink-500 rounded-full"
            style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
          ></div>
          
          {/* Min Input Thumb */}
          <input 
            type="range" 
            min={minLimit} max={maxLimit} step="100" 
            value={minPrice} onChange={handleMinChange}
            className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-pink-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
          />
          {/* Max Input Thumb */}
          <input 
            type="range" 
            min={minLimit} max={maxLimit} step="100" 
            value={maxPrice} onChange={handleMaxChange}
            className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-pink-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>₹500</span><span>₹5000+</span>
        </div>
      </div>
    </div>
  );
}