"use client"

import { TransactionDialog } from "@/components/cash/transaction-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteTransaction } from "@/app/actions/cash"
import { useTransition } from "react"

export function TransactionList({ transactions }: { transactions: any[] }) {
    const [pending, startTransition] = useTransition()

    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        startTransition(async () => {
            await deleteTransaction(id)
        })
    }

    if (transactions.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No transactions found.</div>
    }

    return (
        <div className="space-y-4">
            {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{t.description || "Transaction"}</span>
                            <Badge variant="outline" className="text-xs">{t.account}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant={t.type === "INCOME" ? "default" : "destructive"}>
                                {t.type}
                            </Badge>
                            <span className={t.type === "EXPENSE" ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                                {t.type === "EXPENSE" ? "-" : "+"} Tk {t.amount}
                            </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TransactionDialog transaction={t} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)} disabled={pending}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
