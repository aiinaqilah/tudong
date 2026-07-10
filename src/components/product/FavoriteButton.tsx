"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { addFavorite, removeFavorite } from "@/actions/favorite-actions";

type Props = {
  productId: string;
  isFavorited?: boolean;
  size?: "sm" | "lg";
};

export default function FavoriteButton({
  productId,
  isFavorited = false,
  size = "sm",
}: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/api/login");
      return;
    }

    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      if (next) {
        const result = await addFavorite(productId);
        if (result?.error) setFavorited(!next);
      } else {
        const result = await removeFavorite(productId);
        if (result?.error) setFavorited(!next);
      }
    });
  };

  const isLg = size === "lg";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
      className={`
        flex items-center justify-center rounded-full transition-all
        ${isLg
          ? "gap-2 px-4 py-2.5 border text-sm font-semibold w-full"
          : "w-7 h-7 shadow-md"
        }
        ${favorited
          ? isLg
            ? "bg-accent border-border text-destructive hover:bg-secondary"
            : "bg-card text-destructive hover:text-destructive"
          : isLg
          ? "bg-card border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          : "bg-card text-muted-foreground hover:text-destructive"
        }
        ${isPending ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <Heart
        className={isLg ? "w-4 h-4" : "w-3.5 h-3.5"}
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {isLg && (
        <span>{favorited ? "Saved to Favourites" : "Save to Favourites"}</span>
      )}
    </button>
  );
}
