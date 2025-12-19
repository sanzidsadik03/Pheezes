"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ProductVariationInput = {
    name: string
    quantity: number
    price: number
}

export type ProductInput = {
    name: string
    description?: string
    variations: ProductVariationInput[]
}

export async function createProduct(data: ProductInput) {
    try {
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                variations: {
                    create: data.variations.map((v) => ({
                        name: v.name,
                        quantity: v.quantity,
                        price: v.price,
                    })),
                },
            },
            include: {
                variations: true,
            },
        })
        revalidatePath("/products")
        return { success: true, product }
    } catch (error) {
        console.error("Failed to create product:", error)
        return { success: false, error: "Failed to create product" }
    }
}

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                variations: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return products
    } catch (error) {
        console.error("Failed to fetch products:", error)
        return []
    }
}
