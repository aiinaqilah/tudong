"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { useCartStore } from "@/stores/cart-store";
import { authClient } from "@/lib/auth-client";
import { useShallow } from "zustand/shallow";

type Props = {
  product: Product;
  effectivePrice?: number;
};

// Small round "quick add to cart" button — sits beside the favourite heart on
// each product card and adds a single unit straight to the cart drawer.
export default function QuickAddButton({ product, effectivePrice }: Props) {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string })?.role ?? "customer";
  const { addItem, open } = useCartStore(
    useShallow((state) => ({ addItem: state.addItem, open: state.open }))
  );
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.title || product.price === undefined || status === "loading") return;

    setStatus("loading");
    const firstImage = Array.isArray(product.image) ? product.image[0] : product.image;
    await addItem({
        sanityProductId: product._id,
        id: product._id,
        title: product.title,
        price: effectivePrice ?? product.price,
        image: firstImage ? urlFor(firstImage).url() : "",
        quantity: 1,
    });
    setStatus("added");
    open();
    setTimeout(() => setStatus("idle"), 1200);
  };

  // Sellers are not buyers — hide the quick-add control from seller accounts (UI-only).
  if (role === "seller") return null;

  return (
    <button
      onClick={handleAdd}
      disabled={status === "loading"}
      aria-label="Add to cart"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-400 shadow-md transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : status === "added" ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <ShoppingCart className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
