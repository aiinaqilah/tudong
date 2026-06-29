import { getUserFavorites } from "@/actions/favorite-actions";
import { removeFavoriteAction } from "@/actions/favorite-actions";
import { getProductsByIds } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
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
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Favourites{" "}
          {products.length > 0 && (
            <span className="text-base font-normal text-gray-400">
              ({products.length})
            </span>
          )}
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🤍</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No favourites yet
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Items you favourite will appear here.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:brightness-110 transition-all"
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

            return (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-50">
                  {firstImage ? (
                    <Image
                      src={urlFor(firstImage).width(300).url()}
                      alt={product.title ?? "Product"}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      🛍️
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    HOT!
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 h-8">
                    {product.title}
                  </p>
                  <p className="text-base font-bold text-red-500 mb-3">
                    RM {(product.price ?? 0).toFixed(2)}
                  </p>

                  <Link
                    href={`/product/${product._id}`}
                    className="block w-full text-center bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider py-2 rounded-full hover:brightness-110 transition-all mb-2"
                  >
                    View Item
                  </Link>

                  <form action={removeFavoriteAction}>
                    <input type="hidden" name="productId" value={product._id} />
                    <button
                      type="submit"
                      className="w-full text-center text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1"
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
