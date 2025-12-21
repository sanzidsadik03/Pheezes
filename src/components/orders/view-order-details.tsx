"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"

export function ViewOrderDetails({ details }: { details?: string | null }) {
    if (!details) return <span className="text-muted-foreground text-xs">No details</span>

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4 text-sky-500" />
                    <span className="sr-only">View Details</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>Full text details for this order.</DialogDescription>
                </DialogHeader>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{details}</pre>
                </div>
            </DialogContent>
        </Dialog>
    )
}
