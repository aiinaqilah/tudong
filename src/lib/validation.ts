import { z } from "zod";

export const productColorsSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(100),
    hex: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  })
).max(50);

export const createProductSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  price: z.number().min(0).max(1_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  inStock: z.boolean(),
  categoryId: z.string().trim().optional(),
  brandId: z.string().trim().optional(),
  materialId: z.string().trim().optional(),
  collectionId: z.string().trim().optional(),
  sizeIds: z.array(z.string().trim()).max(100),
  colors: productColorsSchema.default([]),
  shippingOverride: z.number().min(0).max(1_000_000).optional(),
});

export const updateProductSchema = createProductSchema.extend({
  discount: z.number().min(0).max(100).nullable().optional(),
  keepImageKeys: z.array(z.string().trim()).max(50).optional(),
  existingImages: z.array(
    z.object({ _key: z.string(), _ref: z.string() })
  ).max(50).optional(),
});

export const sellerApplicationSchema = z.object({
  brandName: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  instagram: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().trim().max(300).nullable()
  ),
  website: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().trim().max(300).url("Invalid website URL").nullable()
  ),
});

export const sellerSettingsSchema = z.object({
  sellerName: z.string().trim().min(1).max(200),
  defaultShippingPrice: z.number().min(0).max(1_000_000),
});

export const updateOrderStatusSchema = z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const updateUserRoleSchema = z.enum(["customer", "seller", "admin"]);

export const trackingInfoSchema = z.object({
  trackingNumber: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().max(100)
  ),
  trackingUrl: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z
      .string()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), "Invalid tracking URL")
  ),
});

export const cartItemSchema = z.object({
  cartId: z.string().trim().min(1).max(100),
  sanityProductId: z.string().trim().min(1).max(100),
  data: z.object({
    title: z.string().trim().max(300).optional(),
    price: z.number().min(0).max(1_000_000).optional(),
    image: z.string().trim().max(2000).optional(),
    quantity: z.number().int().min(0).max(1000).optional(),
  }),
  size: z.string().trim().max(50).nullable().optional(),
});