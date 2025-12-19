import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

async function getTransactions() {
    return await prisma.transaction.findMany({ orderBy: { date: "desc" } })
}

export default async function CashPage() {
    const transactions = await getTransactions()

    // Starting cash: 8000tk (2000 * 4)
    // Assuming transactions are delta.
    // Total = 8000 + sum(transactions using signed amount if needed, but schema has type)
    // Type INCOME (+), EXPENSE (-), INVESTMENT (+)

    const initialCash = 8000

    const runningTotal = transactions.reduce((acc, t) => {
        if (t.type === "INCOME" || t.type === "INVESTMENT") return acc + t.amount
        if (t.type === "EXPENSE") return acc - t.amount
        return acc
    }, 0)

    const totalCash = initialCash + runningTotal
    const sharePerPerson = totalCash / 4

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text">Cash Management</h1>
                <p className="text-muted-foreground">Track cash flow and shareholder equity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card className="glass border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cash in Hand</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">Tk {totalCash.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Starting Balance: Tk {initialCash}</p>
                    </CardContent>
                </Card>
                <Card className="glass border-indigo-500/20">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Shareholder Equity (25%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white">Tk {sharePerPerson.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Per person share</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">{t.description || "Transaction"}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={t.type === "INCOME" ? "default" : t.type === "EXPENSE" ? "destructive" : "secondary"}>
                                        {t.type}
                                    </Badge>
                                    <span className={t.type === "EXPENSE" ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                                        {t.type === "EXPENSE" ? "-" : "+"} Tk {t.amount}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center text-muted-foreground">No transactions yet.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
