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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ShoppingCart, Trash } from "lucide-react"
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

    const [customerName, setCustomerName] = useState("")
    const [contact, setContact] = useState("")
    const [address, setAddress] = useState("")

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: OrderInput = {
            customerName,
            customerContact: contact,
            customerAddress: address,
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
            setCustomerName("")
            setContact("")
            setAddress("")
            setItems([])
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
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Order</DialogTitle>
                        <DialogDescription>
                            Create a new order for a customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Customer Name</Label>
                            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Contact</Label>
                                <Input value={contact} onChange={(e) => setContact(e.target.value)} />
                            </div>
                            <div>
                                <Label>Address/Notes</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Item
                                </Button>
                            </div>
                            {items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-muted/20">
                                    <div className="col-span-6">
                                        <Label className="text-xs">Product</Label>
                                        <Select value={item.variationId} onValueChange={(val) => updateItem(i, "variationId", val)}>
                                            <SelectTrigger>
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
                                    <div className="col-span-2">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(i, "quantity", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Label className="text-xs">Price (Unit)</Label>
                                        <div className="flex bg-muted h-10 items-center px-3 rounded text-sm">
                                            {item.price}
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeItem(i)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-right font-bold text-lg">
                            Total: Tk {items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || items.length === 0}>
                            {loading ? "Creating..." : "Create Order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
