"use client"

import { Button } from "@/components/ui/button"
import { processOrder, dispatchOrder, deleteOrder, returnOrder } from "@/app/actions/order"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function OrderActions({ order }: { order: any }) {
    const [loading, setLoading] = useState(false)

    const handleProcess = async () => {
        setLoading(true)
        await processOrder(order.id)
        setLoading(false)
    }

    const handleDispatch = async () => {
        setLoading(true)
        await dispatchOrder(order.id)
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        setLoading(true)
        await deleteOrder(order.id)
        setLoading(false)
    }

    const handleReturn = async () => {
        if (!confirm("Mark this order as RETURNED? Stock will NOT be restored automatically.")) return;
        setLoading(true)
        await returnOrder(order.id)
        setLoading(false)
    }

    return (
        <div className="flex gap-2">
            {order.status === "PENDING" && (
                <Button size="sm" onClick={handleProcess} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Process
                </Button>
            )}
            {order.status === "PROCESSING" && (
                <Button size="sm" onClick={handleDispatch} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Dispatch
                </Button>
            )}
            {order.status === "DISPATCHED" && (
                <Button size="sm" variant="outline" onClick={handleReturn} disabled={loading} className="text-yellow-500 hover:text-yellow-600 border-yellow-500/50">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Return
                </Button>
            )}
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </Button>
        </div>
    )
}
