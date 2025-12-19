"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type TransactionInput = {
    amount: number
    description: string
    type: "INCOME" | "EXPENSE"
    account: "BKASH" | "MISC"
}

export async function createTransaction(data: TransactionInput) {
    try {
        await prisma.transaction.create({
            data: {
                amount: data.amount,
                description: data.description,
                type: data.type,
                account: data.account
            }
        })
        revalidatePath("/cash")
        return { success: true }
    } catch (error) {
        console.error("Failed to create transaction:", error)
        return { success: false, error: "Failed to create transaction" }
    }
}

export async function updateTransaction(id: number, data: TransactionInput) {
    try {
        await prisma.transaction.update({
            where: { id },
            data: {
                amount: data.amount,
                description: data.description,
                type: data.type,
                account: data.account
            }
        })
        revalidatePath("/cash")
        return { success: true }
    } catch (error) {
        console.error("Failed to update transaction:", error)
        return { success: false, error: "Failed to update transaction" }
    }
}

export async function deleteTransaction(id: number) {
    try {
        await prisma.transaction.delete({
            where: { id }
        })
        revalidatePath("/cash")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete transaction:", error)
        return { success: false, error: "Failed to delete transaction" }
    }
}

export async function getTransactions() {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: "desc" }
        })
        return transactions
    } catch (error) {
        return []
    }
}
