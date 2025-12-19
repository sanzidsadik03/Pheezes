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
import { Plus, Trash, PackagePlus } from "lucide-react"
import { createProduct, ProductInput } from "@/app/actions/product"
import { useRouter } from "next/navigation"

export function AddProductDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [variations, setVariations] = useState([{ name: "", quantity: 1, price: 0 }])

    const addVariation = () => {
        setVariations([...variations, { name: "", quantity: 1, price: 0 }])
    }

    const removeVariation = (index: number) => {
        setVariations(variations.filter((_, i) => i !== index))
    }

    const updateVariation = (index: number, field: string, value: string | number) => {
        const newVariations = [...variations]
        // @ts-ignore
        newVariations[index][field] = value
        setVariations(newVariations)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: ProductInput = {
            name,
            description,
            variations: variations.map(v => ({
                ...v,
                quantity: Number(v.quantity),
                price: Number(v.price)
            }))
        }

        const res = await createProduct(payload)
        setLoading(false)

        if (res.success) {
            setOpen(false)
            setName("")
            setDescription("")
            setVariations([{ name: "", quantity: 1, price: 0 }])
            router.refresh()
        } else {
            alert("Failed to create product")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                            Create a new product with variations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Ex. Pheezes T-Shirt"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Variations</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                            </div>
                            {variations.map((v, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-muted/20">
                                    <div className="col-span-5">
                                        <Label className="text-xs">Variation Name</Label>
                                        <Input
                                            placeholder="Size/Color"
                                            value={v.name}
                                            onChange={(e) => updateVariation(i, "name", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            min="0"
                                            value={v.quantity}
                                            onChange={(e) => updateVariation(i, "quantity", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Label className="text-xs">Price</Label>
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                            value={v.price}
                                            onChange={(e) => updateVariation(i, "price", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeVariation(i)}
                                            disabled={variations.length === 1}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
