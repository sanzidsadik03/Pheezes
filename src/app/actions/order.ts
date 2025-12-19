"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type OrderItemInput = {
    productVariationId: number
    quantity: number
    price: number
}

export type OrderInput = {
    customerName: string
    customerContact?: string
    customerAddress?: string
    items: OrderItemInput[]
}

export async function createOrder(data: OrderInput) {
    try {
        const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        const order = await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerContact: data.customerContact,
                customerAddress: data.customerAddress,
                status: "PENDING",
                totalAmount,
                items: {
                    create: data.items.map(item => ({
                        productVariationId: item.productVariationId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })
        revalidatePath("/orders")
        return { success: true, order }
    } catch (error) {
        console.error("Failed to create order:", error)
        return { success: false, error: "Failed to create order" }
    }
}

export async function processOrder(orderId: number) {
    try {
        // Transaction to ensure stock consistency
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            })

            if (!order) throw new Error("Order not found")
            if (order.status !== "PENDING") throw new Error("Order is already processed or dispatched")

            // Deduct stock
            for (const item of order.items) {
                await tx.productVariation.update({
                    where: { id: item.productVariationId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                })
            }

            // Update status
            await tx.order.update({
                where: { id: orderId },
                data: { status: "PROCESSING" }
            })

            // Transaction is now handled manually manually by the user
            // via the Cash Management page.
        })

        revalidatePath("/orders")
        revalidatePath("/products") // Stock changed
        revalidatePath("/cash") // Cash changed
        return { success: true }
    } catch (error) {
        console.error("Failed to process order:", error)
        return { success: false, error: "Failed to process order" }
    }
}

export async function dispatchOrder(orderId: number) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "DISPATCHED" }
        })
        revalidatePath("/orders")
        return { success: true }
    } catch (error) {
        console.error("Failed to dispatch order:", error)
        return { success: false, error }
    }
}

export async function returnOrder(orderId: number) {
    try {
        // We only mark status as RETURNED. Stock is NOT automatically restored.
        // User must manually restock if the item is salvageable.
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "RETURNED" }
        })
        revalidatePath("/orders")
        return { success: true }
    } catch (error) {
        console.error("Failed to return order:", error)
        return { success: false, error }
    }
}

export async function deleteOrder(orderId: number) {
    try {
        await prisma.order.delete({
            where: { id: orderId }
        })
        revalidatePath("/orders")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete order:", error)
        return { success: false, error }
    }
}

export async function getOrders() {
    return await prisma.order.findMany({
        include: { items: { include: { productVariation: true } } },
        orderBy: { createdAt: "desc" }
    })
}
