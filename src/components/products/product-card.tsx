"use client"

import { Product, ProductVariation } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Pencil } from "lucide-react"
import { deleteProduct, updateVariationStock } from "@/app/actions/product"
import { useTransition, useState } from "react"
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

type ProductCardProps = {
    product: Product & { variations: ProductVariation[] }
}

export function ProductCard({ product }: ProductCardProps) {
    const [pending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return
        startTransition(async () => {
            await deleteProduct(product.id)
        })
    }

    return (
        <Card className="overflow-hidden glass-panel border-white/5 relative group">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                disabled={pending}
            >
                <Trash className="h-4 w-4" />
            </Button>
            <CardHeader className="pb-2">
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Variations:</p>
                    <div className="space-y-1">
                        {product.variations.map((v) => (
                            <VariationRow key={v.id} variation={v} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function VariationRow({ variation }: { variation: ProductVariation }) {
    const [open, setOpen] = useState(false)
    const [qty, setQty] = useState(variation.quantity.toString())
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await updateVariationStock(variation.id, parseInt(qty))
        setLoading(false)
        setOpen(false)
    }

    return (
        <div className="flex justify-between text-sm items-center border-b border-border/50 last:border-0 pb-1 group/var">
            <span className="text-muted-foreground">{variation.name}</span>
            <div className="flex gap-2 items-center">
                <Badge variant={variation.quantity > 0 ? "secondary" : "destructive"}>
                    {variation.quantity} in stock
                </Badge>
                <span className="font-bold text-primary">Tk {variation.price}</span>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/var:opacity-100 transition-opacity">
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleUpdate}>
                            <DialogHeader>
                                <DialogTitle>Update Stock</DialogTitle>
                                <DialogDescription>
                                    Manually adjust the quantity for {variation.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="quantity" className="text-right">
                                        Quantity
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Updating..." : "Update Stock"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
