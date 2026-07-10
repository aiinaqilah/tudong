"use client";

import React, { useState } from "react";
import { Product } from "@/sanity.types";
import { getColorFamily, type ColorFamily } from "@/lib/color";
import ProductGrid from "@/components/product/ProductGrid";

type Option = { _id: string; name: string };

type ProductFilterProps = {
  products: Product[];
  brands: Option[];
  materials: Option[];
  sizes: Option[];
  favoriteProductIds: string[];
  /** product _id -> effective (discounted) price */
  campaign: Record<string, number>;
};

// The 12-colour palette — one swatch per colour family recognised by getColorFamily.
const COLOR_SWATCHES: { family: ColorFamily; hex: string }[] = [
  { family: "Black", hex: "#1c1c1c" },
  { family: "White", hex: "#ffffff" },
  { family: "Gray", hex: "#9ca3af" },
  { family: "Brown", hex: "#7b5e3b" },
  { family: "Red", hex: "#c0392b" },
  { family: "Orange", hex: "#e07a2f" },
  { family: "Yellow", hex: "#e3c018" },
  { family: "Green", hex: "#5b8c4e" },
  { family: "Teal", hex: "#2fa4a0" },
  { family: "Blue", hex: "#3b6fb0" },
  { family: "Purple", hex: "#7a5fa6" },
  { family: "Pink", hex: "#d48aae" },
];

function toggle<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
  setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProductFilter({
  products,
  brands,
  materials,
  sizes,
  favoriteProductIds,
  campaign,
}: ProductFilterProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorFamily[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const favoriteIds = new Set(favoriteProductIds);
  const campaignMap = new Map(Object.entries(campaign));

  const priceOf = (p: Product) => campaignMap.get(p._id) ?? p.price ?? 0;
  const familiesOf = (p: Product) =>
    new Set(
      (p.color ?? [])
        .map((c) => c.hex)
        .filter((h): h is string => Boolean(h))
        .map(getColorFamily)
    );

  // Only offer options that are actually present on some product.
  const usedBrandIds = new Set(products.map((p) => p.brand?._ref).filter((r): r is string => !!r));
  const usedMaterialIds = new Set(products.map((p) => p.material?._ref).filter((r): r is string => !!r));
  const usedSizeIds = new Set(products.flatMap((p) => (p.size ?? []).map((s) => s._ref)));

  const brandOptions = brands.filter((b) => usedBrandIds.has(b._id));
  const materialOptions = materials.filter((m) => usedMaterialIds.has(m._id));
  const sizeOptions = sizes.filter((s) => usedSizeIds.has(s._id));

  const min = minPrice === "" ? null : Number(minPrice);
  const max = maxPrice === "" ? null : Number(maxPrice);

  const filtered = products.filter((p) => {
    if (selectedBrands.length && !(p.brand?._ref && selectedBrands.includes(p.brand._ref))) return false;
    if (selectedMaterials.length && !(p.material?._ref && selectedMaterials.includes(p.material._ref))) return false;
    if (selectedSizes.length && !(p.size ?? []).some((s) => selectedSizes.includes(s._ref))) return false;
    if (selectedColors.length) {
      const fams = familiesOf(p);
      if (!selectedColors.some((f) => fams.has(f))) return false;
    }
    const price = priceOf(p);
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;
    return true;
  });

  const activeCount =
    selectedBrands.length +
    selectedMaterials.length +
    selectedSizes.length +
    selectedColors.length +
    (min !== null ? 1 : 0) +
    (max !== null ? 1 : 0);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const CheckboxRow = ({
    option,
    checked,
    onToggle,
  }: {
    option: Option;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
          checked ? "border-foreground bg-foreground" : "border-border group-hover:border-foreground"
        }`}
      >
        {checked && <CheckIcon className="h-3 w-3 text-background" />}
      </span>
      <span className="text-sm text-foreground/80 group-hover:text-foreground">{option.name}</span>
    </label>
  );

  const filterPanel = (
    <div>
      {brandOptions.length > 0 && (
        <Section title="Brand">
          <div className="flex flex-col">
            {brandOptions.map((b) => (
              <CheckboxRow
                key={b._id}
                option={b}
                checked={selectedBrands.includes(b._id)}
                onToggle={() => toggle(setSelectedBrands, b._id)}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Price (RM)">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              RM
            </span>
            <input
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Min"
              className="w-full border-b border-border bg-transparent py-1.5 pl-7 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              RM
            </span>
            <input
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Max"
              className="w-full border-b border-border bg-transparent py-1.5 pl-7 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
        </div>
      </Section>

      <Section title="Colour">
        <div className="grid grid-cols-6 gap-2.5">
          {COLOR_SWATCHES.map(({ family, hex }) => {
            const active = selectedColors.includes(family);
            return (
              <button
                key={family}
                type="button"
                title={family}
                aria-label={family}
                aria-pressed={active}
                onClick={() => toggle(setSelectedColors, family)}
                className={`h-7 w-7 rounded-full border transition-transform ${
                  active
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-transparent"
                    : "border-border hover:scale-110"
                }`}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>
      </Section>

      {materialOptions.length > 0 && (
        <Section title="Material">
          <div className="flex flex-col">
            {materialOptions.map((m) => (
              <CheckboxRow
                key={m._id}
                option={m}
                checked={selectedMaterials.includes(m._id)}
                onToggle={() => toggle(setSelectedMaterials, m._id)}
              />
            ))}
          </div>
        </Section>
      )}

      {sizeOptions.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => {
              const active = selectedSizes.includes(s._id);
              return (
                <button
                  key={s._id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(setSelectedSizes, s._id)}
                  className={`min-w-[2.5rem] rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/80 hover:border-foreground"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );

  return (
    <div>
      {/* Filter toggle — hidden by default, revealed on click */}
      <button
        type="button"
        onClick={() => setShowFilters((v) => !v)}
        aria-expanded={showFilters}
        className="mb-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-foreground underline decoration-1 underline-offset-4 transition-colors hover:text-muted-foreground"
      >
        Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={`h-3.5 w-3.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row md:gap-10">
        <aside
          className={`${showFilters ? "block" : "hidden"} mb-8 w-full shrink-0 md:sticky md:top-28 md:mb-0 md:w-56 md:self-start lg:w-64`}
        >
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="mb-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all ({activeCount})
            </button>
          )}
          {filterPanel}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <button
                onClick={clearAll}
                className="mt-3 text-[11px] uppercase tracking-[0.15em] text-foreground underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ProductGrid products={filtered} favoriteIds={favoriteIds} campaignMap={campaignMap} />
          )}
        </div>
      </div>
    </div>
  );
}
