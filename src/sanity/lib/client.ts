import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'
import { Product, ProductCategory } from '@/sanity.types'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Storefront queries use CDN with ISR revalidation — fast and cached
const REVALIDATE_PRODUCTS = 60;    // products refresh every 60s
const REVALIDATE_REFERENCE = 3600; // categories/brands/sizes change rarely

export const getAllProducts = async () => {
  const query = `*[_type == "product"]{
    ...,
    image[]{
      _key,
      _type,
      asset->
    }
  }`;
  return client.fetch<Product[]>(query, {}, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

export const getAllCategories = async () => {
  const query = `*[_type == "productCategory"]`;
  return client.fetch<ProductCategory[]>(query, {}, { next: { revalidate: REVALIDATE_REFERENCE } });
}

export const getCategoryBySlug = async (slug: string) => {
  const query = `*[_type == "productCategory" && slug.current == $slug][0]`;
  return client.fetch<ProductCategory>(query, { slug }, { next: { revalidate: REVALIDATE_REFERENCE } });
}

export const getProductsByCategorySlug = async (slug: string) => {
  const query = `*[_type == "product" && references(*[_type == "productCategory" && slug.current == $slug][0]._id)]`;
  return client.fetch<Product[]>(query, { slug }, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

export const getProductById = async (id: string) => {
  const query = `*[_type == "product" && _id == $id][0]`;
  return client.fetch<Product>(query, { id }, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

export const searchProducts = async (searchQuery: string) => {
  const query = `*[_type == "product" && (
    title match "*" + $searchQuery + "*" ||
    description match "*" + $searchQuery + "*" ||
    category->title match "*" + $searchQuery + "*" ||
    category->slug.current match "*" + $searchQuery + "*"
  )]`;
  return client.fetch<Product[]>(query, { searchQuery }, { cache: 'no-store' });
}

export const getActiveCampaigns = async () => {
  const query = `*[_type == "promotionCampaign" && isActive == true && startDate <= now() && endDate >= now()]{
    _id,
    title,
    discountType,
    discountValue,
    "productRefs": products[]._ref
  }`;
  return client.fetch<Array<{
    _id: string;
    title: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    productRefs: string[] | null;
  }>>(query, {}, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

export const getSaleProducts = async () => {
  const query = `*[_type == "product" && _id in *[_type == "promotionCampaign" && isActive == true && startDate <= now() && endDate >= now()].products[]._ref]{
    ...,
    image[]{
      _key,
      _type,
      asset->
    }
  }`;
  return client.fetch<Product[]>(query, {}, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

export const getProductsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const query = `*[_type == "product" && _id in $ids]{
    ...,
    image[]{
      _key,
      _type,
      asset->
    }
  }`;
  return client.fetch<Product[]>(query, { ids }, { next: { revalidate: REVALIDATE_PRODUCTS } });
}

// --- Product form reference options ---

export type ProductFormOption = { _id: string; name: string };
export type ProductFormCategoryOption = { _id: string; title: string };

export const getProductFormOptions = async () => {
  const [categories, materials, sizes] = await Promise.all([
    client.fetch<ProductFormCategoryOption[]>(`*[_type == "productCategory"]{ _id, title } | order(title asc)`, {}, { cache: 'no-store' }),
    client.fetch<ProductFormOption[]>(`*[_type == "material"]{ _id, name } | order(name asc)`, {}, { cache: 'no-store' }),
    client.fetch<ProductFormOption[]>(`*[_type == "size"]{ _id, name } | order(name asc)`, {}, { cache: 'no-store' }),
  ]);
  return { categories, materials, sizes };
}

export type SellerBrand = { _id: string; name: string; sellerId: string };

export const getSellerBrand = async (sellerId: string): Promise<SellerBrand | null> => {
  return client.fetch(
    `*[_type == "brand" && sellerId == $sellerId][0]{ _id, name, sellerId }`,
    { sellerId },
    { cache: 'no-store' }
  );
}

export const uploadProductImage = async (buffer: Buffer, filename: string, contentType: string): Promise<string> => {
  const asset = await writeClient.assets.upload('image', buffer, { filename, contentType });
  return asset._id;
}

// --- Seller product management (write operations) ---

type SellerProduct = {
  _id: string;
  title: string;
  price: number;
  stock: number | null;
  inStock: boolean;
  category: string | null;
  sellerId: string;
}

export const getSellerSanityProducts = async (sellerId: string): Promise<SellerProduct[]> => {
  const query = `*[_type == "product" && sellerId == $sellerId] | order(_createdAt desc){
    _id,
    title,
    price,
    stock,
    inStock,
    "category": category->title,
    sellerId
  }`;
  return client.fetch(query, { sellerId }, { cache: 'no-store' });
}

export const createSanityProduct = async (data: {
  title: string;
  description?: string;
  price: number;
  stock: number;
  inStock: boolean;
  sellerId: string;
  imageAssetIds?: string[];
  categoryId?: string;
  brandId?: string;
  materialId?: string;
  colors?: { name: string; hex: string }[];
  sizeIds?: string[];
}) => {
  const slug = data.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-' + Math.random().toString(36).slice(2, 7);

  return writeClient.create({
    _type: 'product',
    title: data.title,
    description: data.description ?? '',
    price: data.price,
    stock: data.stock,
    inStock: data.inStock,
    sellerId: data.sellerId,
    slug: { _type: 'slug', current: slug },
    ...(data.imageAssetIds?.length ? {
      image: data.imageAssetIds.map(assetId => ({
        _type: 'image',
        _key: Math.random().toString(36).slice(2, 9),
        asset: { _type: 'reference', _ref: assetId },
      })),
    } : {}),
    ...(data.categoryId ? { category: { _type: 'reference', _ref: data.categoryId } } : {}),
    ...(data.brandId ? { brand: { _type: 'reference', _ref: data.brandId } } : {}),
    ...(data.materialId ? { material: { _type: 'reference', _ref: data.materialId } } : {}),
    ...(data.colors?.length ? {
      color: data.colors.map(c => ({
        _key: Math.random().toString(36).slice(2, 9),
        name: c.name,
        hex: c.hex,
      })),
    } : {}),
    ...(data.sizeIds?.length ? {
      size: data.sizeIds.map(id => ({
        _type: 'reference',
        _key: Math.random().toString(36).slice(2, 9),
        _ref: id,
      })),
    } : {}),
  });
}

export const deleteSanityProduct = async (productId: string) => {
  return writeClient.delete(productId);
}

export const updateSanityProduct = async (
  productId: string,
  data: Partial<{ title: string; description: string; price: number; stock: number }>
) => {
  const patch: Record<string, unknown> = { ...data };
  if (data.stock !== undefined) patch.inStock = data.stock > 0;
  return writeClient.patch(productId).set(patch).commit();
}

export const getProductSellerIds = async (sanityProductIds: string[]): Promise<Record<string, string>> => {
  if (sanityProductIds.length === 0) return {};
  const query = `*[_type == "product" && _id in $ids]{ _id, sellerId }`;
  const products = await client.fetch<Array<{ _id: string; sellerId?: string }>>(
    query,
    { ids: sanityProductIds },
    { cache: 'no-store' }
  );
  return Object.fromEntries(products.map((p) => [p._id, p.sellerId ?? '']));
}
