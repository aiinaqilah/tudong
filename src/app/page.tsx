import SalesCampaignBanner from "@/components/layout/SalesCampaignBanner";
import { getAllProducts, getActiveCampaigns } from "@/sanity/lib/client";
import ProductGrid from "@/components/product/ProductGrid";
import { getUserFavorites } from "@/actions/favorite-actions";
import { computeCampaignMap } from "@/lib/utils";

const Home = async () => {
    const [products, campaigns, favorites] = await Promise.all([
        getAllProducts(),
        getActiveCampaigns(),
        getUserFavorites(),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.productId));
    const campaignMap = computeCampaignMap(products, campaigns);

    return (
        <div>
            <SalesCampaignBanner />

            <section className='container mx-auto py-8'>
                <ProductGrid products={products} favoriteIds={favoriteIds} campaignMap={campaignMap} />
            </section>
        </div>
    );
}

export default Home;
