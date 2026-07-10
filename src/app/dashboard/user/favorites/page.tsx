import { getUserFavorites } from "@/actions/favorite-actions";
import { removeFavoriteAction } from "@/actions/favorite-actions";
import { getProductsByIds } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { isNewProduct } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default async function UserFavouritesPage() {
  const favorites = await getUserFavorites();
  const productIds = favorites.map((f) => f.productId);
  const products = await getProductsByIds(productIds);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
          Dashboard
        </p>
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          Favourites{" "}
          {products.length > 0 && (
            <span className="text-base font-normal text-muted-foreground">
              ({products.length})
            </span>
          )}
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🤍</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No favourites yet
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Items you favourite will appear here.
          </p>
          <Link
            href="/"
            className="inline-block bg-foreground text-background text-[11px] font-medium uppercase tracking-[0.18em] px-6 py-3 rounded-full hover:bg-foreground/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const firstImage =
              Array.isArray(product.image) && product.image[0]?.asset
                ? product.image[0]
                : null;
            const isNew = isNewProduct(product._createdAt);

            return (
              <div
                key={product._id}
                className="bg-card border border-border rounded-xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 bg-secondary/40">
                  {firstImage ? (
                    <Image
                      src={urlFor(firstImage).width(300).url()}
                      alt={product.title ?? "Product"}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                      🛍️
                    </div>
                  )}
                  {isNew && (
                    <span className="absolute top-2 right-2 bg-background/90 text-foreground border border-border text-[10px] font-medium uppercase tracking-[0.15em] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      New
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground line-clamp-2 mb-1 h-8">
                    {product.title}
                  </p>
                  <p className="text-base font-medium text-foreground mb-3">
                    RM {(product.price ?? 0).toFixed(2)}
                  </p>

                  <Link
                    href={`/product/${product._id}`}
                    className="block w-full text-center bg-foreground text-background text-[11px] font-medium uppercase tracking-[0.15em] py-2 rounded-full hover:bg-foreground/90 transition-colors mb-2"
                  >
                    View Item
                  </Link>

                  <form action={removeFavoriteAction}>
                    <input type="hidden" name="productId" value={product._id} />
                    <button
                      type="submit"
                      className="w-full text-center text-xs font-medium text-muted-foreground hover:text-destructive transition-colors py-1"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
