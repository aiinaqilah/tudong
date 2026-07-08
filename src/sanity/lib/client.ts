import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'
import { Product, ProductCategory } from '@/sanity.types'
import { getColorFamily } from '@/lib/color'

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
  const query = `*[_type == "product" && (
    _id in *[_type == "promotionCampaign" && isActive == true && startDate <= now() && endDate >= now()].products[]._ref
    || (discount != null && discount > 0)
  )]{
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

export const getRecommendedProducts = async (
  product: Product,
  limit = 4
): Promise<Product[]> => {
  const productColors = (product.color ?? [])
    .map((c) => c.hex)
    .filter((hex): hex is string => Boolean(hex));

  if (productColors.length === 0) return [];

  const targetFamilies = new Set(productColors.map(getColorFamily));

  const query = `*[_type == "product" && _id != $id]{
    ...,
    image[]{ _key, _type, asset-> }
  }`;
  const candidates = await client.fetch<Product[]>(
    query,
    { id: product._id },
    { next: { revalidate: REVALIDATE_PRODUCTS } }
  );

  const scored = candidates
    .map((candidate) => {
      const families = (candidate.color ?? [])
        .map((c) => c.hex)
        .filter((hex): hex is string => Boolean(hex))
        .map(getColorFamily);
      const matches = families.filter((f) => targetFamilies.has(f)).length;
      return { candidate, matches };
    })
    .filter((entry) => entry.matches > 0)
    .sort((a, b) => b.matches - a.matches);

  return scored.slice(0, limit).map((entry) => entry.candidate);
};

// --- Product form reference options ---

export type ProductFormOption = { _id: string; name: string };
export type ProductFormCategoryOption = { _id: string; title: string };

export const getProductFormOptions = async (sellerId?: string) => {
  const [categories, materials, sizes, collections] = await Promise.all([
    client.fetch<ProductFormCategoryOption[]>(`*[_type == "productCategory"]{ _id, title } | order(title asc)`, {}, { cache: 'no-store' }),
    client.fetch<ProductFormOption[]>(`*[_type == "material"]{ _id, name } | order(name asc)`, {}, { cache: 'no-store' }),
    client.fetch<ProductFormOption[]>(`*[_type == "size"]{ _id, name } | order(name asc)`, {}, { cache: 'no-store' }),
    sellerId
      ? client.fetch<ProductFormCategoryOption[]>(`*[_type == "collection" && sellerId == $sellerId]{ _id, title } | order(title asc)`, { sellerId }, { cache: 'no-store' })
      : client.fetch<ProductFormCategoryOption[]>(`*[_type == "collection"]{ _id, title } | order(title asc)`, {}, { cache: 'no-store' }),
  ]);
  return { categories, materials, sizes, collections };
}

export type SellerCollection = { _id: string; title: string; description: string | null };

export const getSellerCollections = async (sellerId: string): Promise<SellerCollection[]> => {
  return client.fetch(
    `*[_type == "collection" && sellerId == $sellerId] | order(title asc){ _id, title, description }`,
    { sellerId },
    { cache: 'no-store' }
  );
}

export const createSellerCollection = async (data: {
  title: string;
  description?: string;
  sellerId: string;
}) => {
  const slug = data.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-' + Math.random().toString(36).slice(2, 7);

  return writeClient.create({
    _type: 'collection',
    title: data.title,
    description: data.description ?? '',
    sellerId: data.sellerId,
    slug: { _type: 'slug', current: slug },
  });
}

export const deleteSellerCollection = async (collectionId: string) => {
  return writeClient.delete(collectionId);
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

export type FullSellerProduct = {
  _id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number | null;
  inStock: boolean;
  discount: number | null;
  categoryId: string | null;
  category: string | null;
  brandId: string | null;
  brand: string | null;
  materialId: string | null;
  collectionId: string | null;
  sizeIds: string[];
  color: { _key: string; name: string; hex: string }[];
  image: { _key: string; _ref: string; url: string }[];
  sellerId: string;
};

export const getSanityProductById = async (
  id: string,
  sellerId: string
): Promise<FullSellerProduct | null> => {
  const query = `*[_type == "product" && _id == $id && sellerId == $sellerId][0]{
    _id, title, description, price, stock, inStock, discount, sellerId,
    "categoryId": category->_id,
    "category": category->title,
    "brandId": brand->_id,
    "brand": brand->name,
    "materialId": material->_id,
    "collectionId": collection->_id,
    "sizeIds": size[]->_id,
    color,
    "image": image[]{ _key, "url": asset->url, "_ref": asset->_id }
  }`;
  return client.fetch(query, { id, sellerId }, { cache: 'no-store' });
};

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
  collectionId?: string;
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
    ...(data.collectionId ? { collection: { _type: 'reference', _ref: data.collectionId } } : {}),
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
  data: {
    title?: string;
    description?: string;
    price?: number;
    stock?: number;
    inStock?: boolean;
    discount?: number | null;
    categoryId?: string;
    materialId?: string;
    collectionId?: string;
    colors?: { name: string; hex: string }[];
    sizeIds?: string[];
    newImageAssetIds?: string[];
    keepImageKeys?: string[];
    existingImages?: { _key: string; _ref: string }[];
  }
) => {
  const patch: Record<string, unknown> = {};

  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.price !== undefined) patch.price = data.price;
  if (data.stock !== undefined) {
    patch.stock = data.stock;
    patch.inStock = data.stock > 0;
  }
  if (data.inStock !== undefined) patch.inStock = data.inStock;
  if (data.discount !== undefined) patch.discount = data.discount ?? null;
  if (data.categoryId !== undefined) patch.category = data.categoryId
    ? { _type: 'reference', _ref: data.categoryId }
    : null;
  if (data.materialId !== undefined) patch.material = data.materialId
    ? { _type: 'reference', _ref: data.materialId }
    : null;
  if (data.collectionId !== undefined) patch.collection = data.collectionId
    ? { _type: 'reference', _ref: data.collectionId }
    : null;
  if (data.colors !== undefined) {
    patch.color = data.colors.map((c) => ({
      _key: Math.random().toString(36).slice(2, 9),
      name: c.name,
      hex: c.hex,
    }));
  }
  if (data.sizeIds !== undefined) {
    patch.size = data.sizeIds.map((id) => ({
      _type: 'reference',
      _key: Math.random().toString(36).slice(2, 9),
      _ref: id,
    }));
  }
  if (data.keepImageKeys !== undefined || data.newImageAssetIds !== undefined) {
    const kept = (data.existingImages ?? [])
      .filter((img) => (data.keepImageKeys ?? []).includes(img._key))
      .map((img) => ({
        _type: 'image',
        _key: img._key,
        asset: { _type: 'reference', _ref: img._ref },
      }));
    const added = (data.newImageAssetIds ?? []).map((assetId) => ({
      _type: 'image',
      _key: Math.random().toString(36).slice(2, 9),
      asset: { _type: 'reference', _ref: assetId },
    }));
    patch.image = [...kept, ...added];
  }

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
