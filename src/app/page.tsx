import { getAllProducts, getFilterOptions } from "@/sanity/lib/client";
import ProductFilter from "@/components/product/ProductFilter";
import { getUserFavorites } from "@/actions/favorite-actions";

const Home = async () => {
    const [products, favorites, filterOptions] = await Promise.all([
        getAllProducts(),
        getUserFavorites(),
        getFilterOptions(),
    ]);

    return (
        <section className="container mx-auto px-6 sm:px-8 py-10">
            <ProductFilter
                products={products}
                brands={filterOptions.brands}
                materials={filterOptions.materials}
                sizes={filterOptions.sizes}
                favoriteProductIds={favorites.map((f) => f.productId)}
            />
        </section>
    );
};

export default Home;
