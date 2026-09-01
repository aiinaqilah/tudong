import { getSaleProducts } from "@/sanity/lib/client";
import { getUserFavorites } from "@/actions/favorite-actions";
import ProductGrid from "@/components/product/ProductGrid";

export default async function SalePage() {
    const [products, favorites] = await Promise.all([
        getSaleProducts(),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));

    return (
        <div>
            {/* Sale header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 py-10 text-center">
                <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-2">
                    Limited Time
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                    SALE
                </h1>
                <p className="text-white/90 text-lg">
                    {products.length} {products.length === 1 ? 'item' : 'items'} on sale now
                </p>
            </div>

            <section className="container mx-auto py-10">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🏷️</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No active sales right now</h2>
                        <p className="text-gray-400 text-sm">Check back soon for upcoming deals.</p>
                    </div>
                ) : (
                    <ProductGrid
                        products={products}
                        favoriteIds={favoriteIds}
                    />
                )}
            </section>
        </div>
    );
}
