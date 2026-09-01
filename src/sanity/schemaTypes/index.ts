import { order, orderItem, shippingAddress } from './schemas/order'
import { brand } from './schemas/brand'
import { product } from './schemas/product'
import { productCategory } from './schemas/productCategory'
import { promotionCode } from './schemas/promotionCode'
import { type SchemaTypeDefinition } from 'sanity'
import { size } from './schemas/size'
import { material } from './schemas/material'
import { collection } from './schemas/collection'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    promotionCode,

    productCategory,
    product,
    brand,
    material,
    size,
    collection,

    shippingAddress,
    orderItem,
    order,
  ],
}
