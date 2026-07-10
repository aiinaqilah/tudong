import Image from "next/image";
import Link from "next/link";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";

export default function ProductRecommendations({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="font-serif text-2xl tracking-tight text-foreground mb-4">You might also like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const firstImage =
            Array.isArray(product.image) && product.image[0]?.asset
              ? product.image[0]
              : null;

          return (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow"
            >
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
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-foreground line-clamp-2 mb-1 h-8">
                  {product.title}
                </p>
                <p className="text-base font-medium text-foreground">
                  RM {(product.price ?? 0).toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
