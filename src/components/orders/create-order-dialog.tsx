"use client"

import { useState, useEffect } from "react"
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
import { Plus, ShoppingCart, Trash, Wand2 } from "lucide-react"
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

    const [rawText, setRawText] = useState("")
    const [customerName, setCustomerName] = useState("")
    const [contact, setContact] = useState("")
    const [address, setAddress] = useState("")
    const [advance, setAdvance] = useState("0")

    // Calculated fields
    const [items, setItems] = useState<{ variationId: string, quantity: number, price: number }[]>([])

    const parseText = () => {
        if (!rawText) return

        // Regex patterns
        const nameMatch = rawText.match(/Name:\s*(.+?)(?=\n|$|,)/i)
        const phoneMatch = rawText.match(/Phone:\s*(.+?)(?=\n|$|,)/i)
        const addressMatch = rawText.match(/Address:\s*(.+?)(?=\n|$|Adv:|Cod:)/i)
        const advMatch = rawText.match(/Adv:\s*(\d+)/i)
        // We calculate COD automatically usually, but we can look for it if needed. 
        // Logic: Total - Advance = COD.

        if (nameMatch) setCustomerName(nameMatch[1].trim())
        if (phoneMatch) setContact(phoneMatch[1].trim())
        if (addressMatch) setAddress(addressMatch[1].trim())
        if (advMatch) setAdvance(advMatch[1])
        else setAdvance("0")
    }

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

    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const dueAmount = totalAmount - Number(advance)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: OrderInput = {
            customerName,
            customerContact: contact,
            customerAddress: address,
            advance: Number(advance),
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
            setRawText("")
            setAdvance("0")
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
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Order</DialogTitle>
                        <DialogDescription>
                            Create a new order manually or paste customer details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Magic Paste Section */}
                        <div className="space-y-4 border-r pr-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-purple-500" />
                                    Magic Paste
                                </Label>
                                <Textarea
                                    className="min-h-[150px] bg-muted/50 font-mono text-xs"
                                    placeholder={`Name: John Doe\nPhone: 01700000000\nAddress: 123 Street\nAdv: 500\nCod: 1500`}
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={parseText} className="w-full">
                                    Extract Details
                                </Button>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>Tk {totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-500 font-medium">
                                    <span>Advance Paid:</span>
                                    <span>- Tk {advance}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Due (COD):</span>
                                    <span>Tk {dueAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
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
                                    <Label>Advance (Tk)</Label>
                                    <Input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold">Items</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                    {items.map((item, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-muted/10">
                                            <div className="col-span-12 sm:col-span-6">
                                                <Select value={item.variationId} onValueChange={(val) => updateItem(i, "variationId", val)}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {allVariations.map((v) => (
                                                                <SelectItem key={v.id} value={v.id.toString()}>
                                                                    {v.productName} - {v.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-3 sm:col-span-3">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                                                    className="h-8 text-xs"
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-2 text-xs font-bold text-right py-2">
                                                {item.price * item.quantity}
                                            </div>
                                            <div className="col-span-1 sm:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={() => removeItem(i)}
                                                >
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || items.length === 0} className="w-full sm:w-auto">
                            {loading ? "Creating..." : `Create Order (Due: ${dueAmount})`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
