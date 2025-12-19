import { getTransactions, deleteTransaction } from "@/app/actions/cash"
import { TransactionDialog } from "@/components/cash/transaction-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionList } from "@/components/cash/transaction-list"

export const dynamic = "force-dynamic"

export default async function CashPage() {
    const transactions = await getTransactions()

    // Initial Investment: 8000tk (2000 * 4) as starting point or base?
    // User said: "Each gave 2000tk in the starting... we just update out total cash and from there how much we each have"
    // So 8000 is the "Capital".
    // Does Capital exist in Bkash or Misc? Usually Misc/Hand.
    // Let's assume Capital is essentially part of the "Total Cash". 
    // We can just add a base amount or assume it's already "in hand".
    // I'll calculate total based on transactions + 8000 base capital.
    // Or better, should the user ADD the capital as a transaction? 
    // "We are 4 share holder... Each gave 2000tk... For example if we have 10000 cash... each person will have 2500"
    // This implies Total Cash is all that matters for the split.
    // I'll keep the 8000 base for now so they don't see 0 initially.

    const initialCapital = 8000

    const bkashTotal = transactions
        .filter(t => t.account === "BKASH")
        .reduce((acc, t) => t.type === "INCOME" ? acc + t.amount : acc - t.amount, 0)

    const miscTotal = transactions
        .filter(t => t.account === "MISC") // Default account
        .reduce((acc, t) => t.type === "INCOME" ? acc + t.amount : acc - t.amount, 0)

    // If no transactions have account (old data), treat as MISC? 
    // Logic: type INCOME adds, expense subtracts.
    // If initialCapital is "Cash in Hand", maybe it belongs to MISC implicitly?
    // Let's just show the calculated totals + 8000 added to the Grand Total for Shareholder Calc.

    const grandTotal = initialCapital + bkashTotal + miscTotal
    const sharePerPerson = grandTotal / 4

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Cash Management</h1>
                    <p className="text-muted-foreground">Track manual deposits, expenses, and equity.</p>
                </div>
                <TransactionDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass border-pink-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bkash Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-pink-500">Tk {bkashTotal.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="glass border-amber-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Miscellaneous / Cash</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-500">
                            Tk {(miscTotal + initialCapital).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Includes 8000k Initial Capital</p>
                    </CardContent>
                </Card>
                <Card className="glass border-indigo-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Shareholder Equity (25%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">Tk {sharePerPerson.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Per person share</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <TransactionList transactions={transactions} />
                </CardContent>
            </Card>
        </div>
    )
}
