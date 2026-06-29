import { getSaleProducts, getActiveCampaigns } from "@/sanity/lib/client";
import { getUserFavorites } from "@/actions/favorite-actions";
import { computeCampaignMap } from "@/lib/utils";
import ProductGrid from "@/components/product/ProductGrid";
import SalesCampaignBanner from "@/components/layout/SalesCampaignBanner";

export default async function SalePage() {
    const [products, campaigns, favorites] = await Promise.all([
        getSaleProducts(),
        getActiveCampaigns(),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));
    const campaignMap = computeCampaignMap(products, campaigns);

    return (
        <div>
            <SalesCampaignBanner />

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

                {/* Active campaign names */}
                {campaigns.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        {campaigns.map((c) => (
                            <span
                                key={c._id}
                                className="bg-white/20 text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full"
                            >
                                {c.title} — {c.discountType === 'percentage' ? `${c.discountValue}% off` : `RM${c.discountValue} off`}
                            </span>
                        ))}
                    </div>
                )}
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
                        campaignMap={campaignMap}
                    />
                )}
            </section>
        </div>
    );
}
