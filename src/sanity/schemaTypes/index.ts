import { order, orderItem, shippingAddress } from './schemas/order'
import { brand } from './schemas/brand'
import { product } from './schemas/product'
import { productCategory } from './schemas/productCategory'
import { promotionCampaign } from './schemas/promotionCampaign'
import { promotionCode } from './schemas/promotionCode'
import { type SchemaTypeDefinition } from 'sanity'
import { size } from './schemas/size'
import { material } from './schemas/material'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    promotionCode,
    promotionCampaign,

    productCategory,
    product,
    brand,
    material,
    size,

    shippingAddress,
    orderItem,
    order,
  ],
}
