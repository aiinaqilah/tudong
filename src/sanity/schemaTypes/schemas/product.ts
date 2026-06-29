import { defineField, defineType } from 'sanity';

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'array',
            of: [{ type: 'image' , options: { hotspot: true }  }],
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'productCategory' }],
        }),
        defineField({
            name: 'brand',
            title: 'Brand',
            type: 'reference',
            to: [{ type: 'brand' }],
        }),
        defineField({
            name: 'material',
            title: 'Material',
            type: 'reference',
            to: [{ type: 'material' }],
        }),
        defineField({
            name: 'color',
            title: 'Color',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'name',
                            title: 'Color Name',
                            type: 'string',
                        },
                        {
                            name: 'hex',
                            title: 'Hex Code',
                            type: 'string',
                        }
                    ]
                }
            ]
        }),
        defineField({
            name: 'size',
            title: 'Size',
            type: 'array',
            of: [ {
                type : 'reference',
                to: [{ type: 'size' }]
             }]
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            initialValue: 0,
            validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
            name: 'inStock',
            title: 'In Stock',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'discount',
            title: 'Discount (%)',
            type: 'number',
            description: 'Seller-set discount percentage off the listed price (0–100)',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'sellerId',
            title: 'Seller ID',
            type: 'string',
            description: 'User ID of the seller who owns this product',
        }),
    ],
});
