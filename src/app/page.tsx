import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, ShoppingCart, Wallet } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Pheezes Manager
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Premium Inventory & Cash Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
        <Link href="/products" className="group">
          <div className="h-40 glass rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white/10 group-hover:scale-105 cursor-pointer border-white/5">
            <Package className="h-8 w-8 text-indigo-400" />
            <span className="font-semibold text-lg">Manage Inventory</span>
          </div>
        </Link>
        <Link href="/orders" className="group">
          <div className="h-40 glass rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white/10 group-hover:scale-105 cursor-pointer border-white/5">
            <ShoppingCart className="h-8 w-8 text-cyan-400" />
            <span className="font-semibold text-lg">Process Orders</span>
          </div>
        </Link>
        <Link href="/cash" className="group">
          <div className="h-40 glass rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white/10 group-hover:scale-105 cursor-pointer border-white/5">
            <Wallet className="h-8 w-8 text-emerald-400" />
            <span className="font-semibold text-lg">Cash Flow</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
