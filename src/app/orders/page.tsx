import { getOrders, processOrder, dispatchOrder } from "@/app/actions/order"
import { getProducts } from "@/app/actions/product"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { OrderActions } from "@/components/orders/order-actions"
import { ViewOrderDetails } from "@/components/orders/view-order-details"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
    const orders = await getOrders()
    const products = await getProducts()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Orders</h1>
                    <p className="text-muted-foreground">Manage order processing and dispatch.</p>
                </div>
                <CreateOrderDialog products={products} />
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Advance</TableHead>
                            <TableHead>Due (COD)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>
                                    <div className="font-bold">{order.customerName}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-xs text-muted-foreground">{order.customerContact}</div>
                                        <ViewOrderDetails details={order.details} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="text-sm">
                                                {item.quantity}x {item.productVariation.name}
                                            </div>
                                        ))}
                                        {order.items.length === 0 && <span className="text-muted-foreground text-xs italic">No items (Manual)</span>}
                                    </div>
                                </TableCell>
                                <TableCell>Tk {order.totalAmount}</TableCell>
                                <TableCell className="text-green-500">Tk {order.advance}</TableCell>
                                <TableCell className="font-bold">Tk {order.totalAmount - order.advance}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        order.status === "PENDING" ? "secondary" :
                                            order.status === "PROCESSING" ? "default" : "outline"
                                    }>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <OrderActions order={order} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
