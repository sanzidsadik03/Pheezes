"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type OrderItemInput = {
    productVariationId: number
    quantity: number
    price: number
}

export type OrderInput = {
    details?: string
    totalAmount: number
    advance?: number
    // Legacy fields kept optional for now or reused if needed
    customerName?: string
    customerContact?: string
    customerAddress?: string
    items?: OrderItemInput[]
}

export async function createOrder(data: OrderInput) {
    try {
        // Calculate total amount from items to ensure accuracy
        const totalAmount = data.items
            ? data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            : data.totalAmount

        // Transaction to ensure order creation and stock deduction happen together
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    details: data.details || "",
                    // Fallbacks if user fills them, otherwise generic/empty
                    customerName: data.customerName || "Manual Order",
                    customerContact: data.customerContact,
                    customerAddress: data.customerAddress,
                    status: "PENDING",
                    totalAmount,
                    advance: data.advance || 0,
                    // Items created only if provided (legacy support or future persistence)
                    items: data.items ? {
                        create: data.items.map(item => ({
                            productVariationId: item.productVariationId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    } : undefined
                }
            })

            // Immediately deduct stock if items exist
            if (data.items) {
                for (const item of data.items) {
                    await tx.productVariation.update({
                        where: { id: item.productVariationId },
                        data: {
                            quantity: {
                                decrement: item.quantity
                            }
                        }
                    })
                }
            }

            return newOrder
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

            // Stock deduction removed (moved to createOrder)

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
        // Restore Stock on Return
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            })

            if (!order) throw new Error("Order not found")

            // Restore stock
            for (const item of order.items) {
                await tx.productVariation.update({
                    where: { id: item.productVariationId },
                    data: { quantity: { increment: item.quantity } }
                })
            }

            await tx.order.update({
                where: { id: orderId },
                data: { status: "RETURNED" }
            })
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
        // Restore Stock on Delete (if it was deducted)
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            })

            if (!order) return // Already deleted?

            // Only restore if not already returned (since returning already restores)
            if (order.status !== "RETURNED") {
                for (const item of order.items) {
                    await tx.productVariation.update({
                        where: { id: item.productVariationId },
                        data: { quantity: { increment: item.quantity } }
                    })
                }
            }

            await tx.order.delete({
                where: { id: orderId }
            })
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
