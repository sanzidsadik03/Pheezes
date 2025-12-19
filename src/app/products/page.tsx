import { getProducts } from "@/app/actions/product"
import { AddProductDialog } from "@/components/products/add-product-dialog"

import { ProductCard } from "@/components/products/product-card"

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
                    <ProductCard key={product.id} product={product} />
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
