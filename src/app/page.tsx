import { getCurrentSession } from "@/actions/auth";

// import SalesCampaignBanner from "@/components/layout/SalesCampaignBanner";
// import ProductGrid from "@/components/product/ProductGrid";
// import { getAllProducts } from "@/sanity/lib/client";

const Home = async () => {
    const { user } = await getCurrentSession();

    // const products = await getAllProducts();

    // const { randomProducts, winningIndex } = await getWheelOfFortuneConfiguration();

    return (
        <div>
          HOME
        </div>
    );
}

export default Home;