import { getProducts } from "@/app/actions/product"
import { AddProductDialog } from "@/components/products/add-product-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Inventory</h1>
                    <p className="text-muted-foreground">Manage products and stock levels.</p>
                </div>
                <AddProductDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden glass-panel border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.description || "No description"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Variations:</p>
                                <div className="space-y-1">
                                    {product.variations.map((v) => (
                                        <div key={v.id} className="flex justify-between text-sm items-center border-b border-border/50 last:border-0 pb-1">
                                            <span className="text-muted-foreground">{v.name}</span>
                                            <div className="flex gap-2">
                                                <Badge variant={v.quantity > 0 ? "secondary" : "destructive"}>
                                                    {v.quantity} in stock
                                                </Badge>
                                                <span className="font-bold text-primary">Tk {v.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No products found. Add your first product.
                </div>
            )}
        </div>
    )
}
