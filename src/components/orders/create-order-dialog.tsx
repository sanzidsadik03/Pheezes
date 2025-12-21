"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Trash } from "lucide-react"
import { createOrder, OrderInput } from "@/app/actions/order"
import { useRouter } from "next/navigation"

type Product = {
    id: number
    name: string
    variations: { id: number, name: string, price: number, quantity: number }[]
}

export function CreateOrderDialog({ products }: { products: Product[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [details, setDetails] = useState("")
    const [advance, setAdvance] = useState("0")

    // Restore items state
    const [items, setItems] = useState<{ variationId: string, quantity: number, price: number }[]>([])

    const addItem = () => {
        setItems([...items, { variationId: "", quantity: 1, price: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        // @ts-ignore
        newItems[index][field] = value

        // Auto-update price if variation changes
        if (field === "variationId") {
            const variation = products.flatMap(p => p.variations).find(v => v.id.toString() === value)
            if (variation) {
                newItems[index].price = variation.price
            }
        }
        setItems(newItems)
    }

    // Calculate total from items
    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: OrderInput = {
            details,
            totalAmount: Number(totalAmount),
            advance: Number(advance),
            customerName: "Manual Order",
            items: items.map(i => ({
                productVariationId: Number(i.variationId),
                quantity: Number(i.quantity),
                price: Number(i.price)
            }))
        }

        const res = await createOrder(payload)
        setLoading(false)

        if (res.success) {
            setOpen(false)
            setDetails("")
            setItems([])
            setAdvance("0")
            router.refresh()
        } else {
            alert("Failed to create order")
        }
    }

    const allVariations = products.flatMap(p => p.variations.map(v => ({ ...v, productName: p.name })))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Create Order
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Order</DialogTitle>
                        <DialogDescription>
                            Enter customer details and select products.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Order Details & Customer Info</Label>
                            <Textarea
                                className="min-h-[100px] font-mono text-sm"
                                placeholder="Customer Name, Address, Contact, Notes..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            />
                        </div>

                        {/* Product Selection Section */}
                        <div className="space-y-3 pt-2 border-t text-sm">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold">Products</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {items.map((item, i) => (
                                    <div key={i} className="flex gap-2 items-center border p-2 rounded bg-muted/10">
                                        <div className="flex-1">
                                            <Select value={item.variationId} onValueChange={(val) => updateItem(i, "variationId", val)}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Select Product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {allVariations.map((v) => (
                                                            <SelectItem key={v.id} value={v.id.toString()}>
                                                                {v.productName} - {v.name} (Tk {v.price})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-20">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => updateItem(i, "price", e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="w-20 text-right font-medium">
                                            Tk {item.price * item.quantity}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => removeItem(i)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {items.length === 0 && <p className="text-center text-muted-foreground p-4">No items selected</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-2">
                                <Label>Total Amount</Label>
                                <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-sm font-bold">
                                    Tk {totalAmount}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Advance Paid</Label>
                                <Input
                                    type="number"
                                    value={advance}
                                    onChange={(e) => setAdvance(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-sm flex justify-between font-medium">
                            <span>Due (COD):</span>
                            <span className={Number(totalAmount) - Number(advance) > 0 ? "text-red-500" : "text-green-500"}>
                                Tk {Number(totalAmount) - Number(advance)}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Creating..." : "Create Order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
