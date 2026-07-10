import { getAllProducts, getActiveCampaigns, getFilterOptions } from "@/sanity/lib/client";
import ProductFilter from "@/components/product/ProductFilter";
import { getUserFavorites } from "@/actions/favorite-actions";
import { computeCampaignMap } from "@/lib/utils";

const Home = async () => {
    const [products, campaigns, favorites, filterOptions] = await Promise.all([
        getAllProducts(),
        getActiveCampaigns(),
        getUserFavorites(),
        getFilterOptions(),
    ]);

    const campaignMap = computeCampaignMap(products, campaigns);

    return (
        <section className="container mx-auto px-6 sm:px-8 py-10">
            <ProductFilter
                products={products}
                brands={filterOptions.brands}
                materials={filterOptions.materials}
                sizes={filterOptions.sizes}
                favoriteProductIds={favorites.map((f) => f.productId)}
                campaign={Object.fromEntries(campaignMap)}
            />
        </section>
    );
};

export default Home;
