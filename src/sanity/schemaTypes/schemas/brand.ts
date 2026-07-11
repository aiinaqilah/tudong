import {defineField, defineType } from "sanity";

export const brand = defineType({
    name: "brand",
    title: "Brand",
    type: "document",
    fields: [   
        defineField({
          name: "name",
          title: "Name",
          type: "string",  
          validation: (Rule) => Rule.required(),
        }),
        defineField({   
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "name",
                maxLength:50,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "logo",
            title: "Logo",
            type: 'image',
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text"
        }),
        defineField({
            name: "sellerId",
            title: "Seller ID",
            type: "string",
            description: "BetterAuth user ID of the seller who owns this brand",
        }),
        defineField({
            name: "sellerName",
            title: "Seller Name",
            type: "string",
            description: "Display name for this seller (shown to customers)",
        }),
        defineField({
            name: "defaultShippingPrice",
            title: "Default Shipping Price (RM)",
            type: "number",
            description: "Default shipping fee per order for this seller. Can be overridden per product.",
            initialValue: 0,
            validation: (Rule) => Rule.min(0),
        }),
    ]
})