import Link from "next/link";
import { getSellerProducts, deleteProduct } from "@/actions/product-actions";

export default async function SellerProductsPage() {
  const products = await getSellerProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          href="/dashboard/seller/products/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">You have no products yet.</p>
          <Link
            href="/dashboard/seller/products/new"
            className="text-sm underline text-gray-700"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Price</th>
                <th className="pb-2 pr-4">Stock</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">{product.title}</td>
                  <td className="py-3 pr-4">RM {product.price.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    {product.stock != null ? product.stock : (product.inStock ? "In Stock" : "Out of Stock")}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{product.category ?? "—"}</td>
                  <td className="py-3">
                    <form action={deleteProduct.bind(null, product._id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
