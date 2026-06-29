import { defineField, defineType } from "sanity";

export const promotionCampaign = defineType({
    name: "promotionCampaign",
    title: "Promotion Campaign",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Campaign Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 2,
        }),
        defineField({
            name: "isActive",
            title: "Active",
            type: "boolean",
            initialValue: true,
        }),
        defineField({
            name: "discountType",
            title: "Discount Type",
            type: "string",
            options: {
                list: [
                    { title: "Percentage Off (%)", value: "percentage" },
                    { title: "Fixed Amount Off (RM)", value: "fixed" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "discountValue",
            title: "Discount Value",
            type: "number",
            description: "Enter percentage (e.g. 20 for 20% off) or fixed RM amount (e.g. 5 for RM5 off)",
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: "startDate",
            title: "Start Date",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "endDate",
            title: "End Date",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "products",
            title: "Products in Campaign",
            type: "array",
            of: [{ type: "reference", to: [{ type: "product" }] }],
            description: "Select the products this campaign applies to",
        }),
    ],
    preview: {
        select: {
            title: "title",
            discountType: "discountType",
            discountValue: "discountValue",
            isActive: "isActive",
        },
        prepare({ title, discountType, discountValue, isActive }) {
            const badge = isActive ? "✅" : "⏸";
            const discount = discountType === "percentage"
                ? `${discountValue}% off`
                : `RM${discountValue} off`;
            return { title: `${badge} ${title}`, subtitle: discount };
        },
    },
});
