import { defineField, defineType } from "sanity";

export const promotionCode = defineType({
    name: "promotionCode",
    title: "Promo Code",
    type: "document",
    fields: [
        defineField({
            name: "code",
            title: "Code",
            type: "string",
            description: "Uppercase code customers enter at checkout (e.g. HEMAT10)",
            validation: (Rule) => Rule.required().uppercase(),
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
            description: "Enter percentage (e.g. 10 for 10% off) or fixed RM amount (e.g. 5 for RM5 off)",
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: "expiresAt",
            title: "Expires At",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "usageLimit",
            title: "Usage Limit",
            type: "number",
            description: "Maximum number of times this code can be used. Leave blank for unlimited.",
        }),
        defineField({
            name: "usageCount",
            title: "Usage Count",
            type: "number",
            description: "How many times this code has been used. Managed automatically.",
            initialValue: 0,
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: "code",
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
