import {defineField, defineType } from "sanity";

export const size = defineType({
    name: "size",
    title: "Size",
    type: "document",
    fields: [   
        defineField({
          name: "name",
          title: "Size Name",
          type: "string",  
        })
    ]
})