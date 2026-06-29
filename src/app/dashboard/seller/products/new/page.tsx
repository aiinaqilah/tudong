import { getCurrentSession } from "@/actions/auth";
import { getProductFormOptions, getSellerBrand } from "@/sanity/lib/client";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const { user } = await getCurrentSession();

  const [options, sellerBrand] = await Promise.all([
    getProductFormOptions(),
    user ? getSellerBrand(user.id) : Promise.resolve(null),
  ]);

  return <NewProductForm options={options} sellerBrand={sellerBrand} />;
}
