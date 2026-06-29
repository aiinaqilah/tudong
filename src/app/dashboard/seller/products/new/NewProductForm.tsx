"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createProduct } from "@/actions/product-actions";
import type { ProductFormOption, ProductFormCategoryOption, SellerBrand } from "@/sanity/lib/client";
import { X, Plus, Upload } from "lucide-react";

type Options = {
  categories: ProductFormCategoryOption[];
  materials: ProductFormOption[];
  sizes: ProductFormOption[];
};

type Color = { name: string; hex: string };

export default function NewProductForm({ options, sellerBrand }: { options: Options; sellerBrand: SellerBrand | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Image previews
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Colors
  const [colors, setColors] = useState<Color[]>([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // Sizes
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const addColor = () => {
    if (!colorName.trim()) return;
    setColors((prev) => [...prev, { name: colorName.trim(), hex: colorHex }]);
    setColorName("");
    setColorHex("#000000");
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (id: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Inject dynamic state into FormData
    formData.set("colors", JSON.stringify(colors));
    selectedSizeIds.forEach((id) => formData.append("sizeIds", id));

    startTransition(async () => {
      const result = await createProduct(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/seller/products");
      }
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Product</h1>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <Section title="Basic Info">
          <Field label="Title" name="title" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (RM)" name="price" type="number" step="0.01" min="0" required />
            <Field label="Stock" name="stock" type="number" min="0" defaultValue="0" required />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inStock"
              id="inStock"
              defaultChecked
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
              In Stock
            </label>
          </div>
        </Section>

        {/* Images */}
        <Section title="Images">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — multiple allowed</span>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
              ))}
            </div>
          )}
        </Section>

        {/* Category / Brand / Material */}
        <Section title="Classification">
          {/* Brand — read-only, tied to the seller's registered brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            {sellerBrand ? (
              <>
                <div className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700 font-medium">
                  {sellerBrand.name}
                </div>
                <input type="hidden" name="brandId" value={sellerBrand._id} />
              </>
            ) : (
              <div className="w-full border border-amber-200 rounded-md px-3 py-2 text-sm bg-amber-50 text-amber-700">
                No brand linked to your account yet. Contact an admin to set up your brand in Sanity Studio.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="categoryId" className={selectCls}>
                <option value="">— Select —</option>
                {options.categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select name="materialId" className={selectCls}>
                <option value="">— Select —</option>
                {options.materials.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Sizes */}
        {options.sizes.length > 0 && (
          <Section title="Sizes">
            <div className="flex flex-wrap gap-2">
              {options.sizes.map((s) => {
                const selected = selectedSizeIds.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleSize(s._id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selected
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            {selectedSizeIds.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No sizes selected</p>
            )}
          </Section>
        )}

        {/* Colors */}
        <Section title="Colours">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Colour name</label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                placeholder="e.g. Midnight Blue"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hex</label>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={addColor}
              className="flex items-center gap-1 px-3 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create Product"}
        </button>
      </form>
    </div>
  );
}

const selectCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        {...props}
      />
    </div>
  );
}
