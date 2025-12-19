"use client"

import { Button } from "@/components/ui/button"
import { processOrder, dispatchOrder } from "@/app/actions/order"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function OrderActions({ order }: { order: any }) {
    const [pending, startTransition] = useTransition()

    const handleProcess = () => {
        startTransition(async () => {
            await processOrder(order.id)
        })
    }

    const handleDispatch = () => {
        startTransition(async () => {
            await dispatchOrder(order.id)
        })
    }

    if (order.status === "PENDING") {
        return (
            <Button size="sm" onClick={handleProcess} disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Order
            </Button>
        )
    }

    if (order.status === "PROCESSING") {
        return (
            <Button size="sm" variant="outline" onClick={handleDispatch} disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark Dispatched
            </Button>
        )
    }

    return <span className="text-muted-foreground text-sm">Completed</span>
}
