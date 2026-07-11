"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  getSellerSettings,
  updateSellerSettings,
  type SellerSettings,
} from "@/actions/seller-settings-actions";

export default function SellerSettingsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SellerSettings>({
    sellerName: "",
    defaultShippingPrice: 0,
  });

  useEffect(() => {
    getSellerSettings().then((res) => {
      if (res && "error" in res) {
        setError(res.error ?? "Failed to load settings");
      } else if (res && "settings" in res) {
        setSettings(res.settings);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateSellerSettings(settings);
      if (result && "error" in result) {
        setError(result.error ?? "Failed to save");
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Seller Settings</h1>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Seller Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Profile
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller Name
            </label>
            <input
              type="text"
              value={settings.sellerName}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, sellerName: e.target.value }))
              }
              placeholder="Display name shown to customers"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Shipping
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Shipping Price (RM)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.defaultShippingPrice}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultShippingPrice: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="text-xs text-gray-400 mt-1">
              Applied to all products unless overridden per product.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Settings saved successfully.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
