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
                    create: data.variations
                }
            },
            include: {
                variations: true
            }
        })
        revalidatePath("/products")
        return { success: true, product }
    } catch (error) {
        console.error("Failed to create product:", error)
        return { success: false, error: "Failed to create product" }
    }
}

export async function getProducts() {
    return await prisma.product.findMany({
        include: {
            variations: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}

export async function deleteProduct(id: number) {
    try {
        await prisma.product.delete({
            where: { id }
        })
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { success: false, error: "Failed to delete product" }
    }
}

export async function updateVariationStock(id: number, quantity: number) {
    try {
        await prisma.productVariation.update({
            where: { id },
            data: { quantity }
        })
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to update stock:", error)
        return { success: false, error: "Failed to update stock" }
    }
}
