"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Wallet, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Inventory",
        url: "/products",
        icon: Package,
    },
    {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
    },
    {
        title: "Cash & Shares",
        url: "/cash",
        icon: Wallet,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-card z-50 relative">
                <span className="font-bold text-xl gradient-text">Pheezes</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu />
                </Button>
            </div>

            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:border-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center border-b px-6 hidden md:flex">
                        <span className="font-bold text-xl gradient-text">Pheezes</span>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid gap-1 px-2">
                            {items.map((item, index) => {
                                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`) && item.url !== "/"
                                return (
                                    <Link
                                        key={index}
                                        href={item.url}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="p-4 border-t">
                        <div className="text-xs text-muted-foreground text-center">
                            © 2024 Pheezes Inc.
                        </div>
                    </div>
                </div>
            </div>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
