import {defineField, defineType } from "sanity";

export const material = defineType({
    name: "material",
    title: "Material",
    type: "document",
    fields: [   
        defineField({
          name: "name",
          title: "Name",
          type: "string",  
        }),
        defineField({   
            name: "description",
            title: "Description",
            type: "text"
        }),
    ]
})