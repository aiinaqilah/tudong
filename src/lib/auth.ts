
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { defineConfig } from "prisma/config";
// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(defineConfig, {
        provider: "postgresql", 
    }),
});
