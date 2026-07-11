"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitSellerApplication } from "@/actions/seller-application-actions";
import Link from "next/link";

export default function ApplySellerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitSellerApplication(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/customer");
      }
    });
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link
          href="/dashboard/customer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Apply as a Seller</h1>
      <p className="text-sm text-gray-500 mb-8">
        Tell us about your brand. Our team will review your application and get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            name="brandName"
            required
            placeholder="e.g. Sofea Tudung"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            About Your Brand <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Tell us about your brand, what you sell, and what makes it special..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input
              name="instagram"
              placeholder="yourbrand"
              className={`${inputCls} pl-7`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            name="website"
            type="url"
            placeholder="https://yourbrand.com"
            className={inputCls}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black";
