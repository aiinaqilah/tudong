import { notFound } from "next/navigation";
import { getCurrentSession } from "@/actions/auth";
import { getProductFormOptions, getSellerBrand } from "@/sanity/lib/client";
import { getSellerProduct } from "@/actions/product-actions";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getCurrentSession();
  if (!user) notFound();

  const [product, options, sellerBrand] = await Promise.all([
    getSellerProduct(id),
    getProductFormOptions(user.id),
    getSellerBrand(user.id),
  ]);

  if (!product) notFound();

  return <EditProductForm product={product} options={options} sellerBrand={sellerBrand} />;
}
