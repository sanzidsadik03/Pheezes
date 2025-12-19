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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { createTransaction, updateTransaction, TransactionInput } from "@/app/actions/cash"
import { useRouter } from "next/navigation"

type TransactionDialogProps = {
    transaction?: any // If provided, we are in edit mode
}

export function TransactionDialog({ transaction }: TransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const isEdit = !!transaction
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [description, setDescription] = useState(transaction?.description || "")
    const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
    const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type || "INCOME")
    const [account, setAccount] = useState<"BKASH" | "MISC">(transaction?.account || "MISC")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: TransactionInput = {
            description,
            amount: Number(amount),
            type,
            account
        }

        let res;
        if (isEdit) {
            res = await updateTransaction(transaction.id, payload)
        } else {
            res = await createTransaction(payload)
        }

        setLoading(false)

        if (res.success) {
            setOpen(false)
            if (!isEdit) {
                setDescription("")
                setAmount("")
                setType("INCOME")
                setAccount("MISC")
            }
            router.refresh()
        } else {
            alert("Failed to save transaction")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Entry
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Transaction" : "Add Cash Entry"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Update transaction details." : "Record manual cash inflow or expense."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex. Restock T-Shirts or Courier Payment"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INCOME">Income (+)</SelectItem>
                                        <SelectItem value="EXPENSE">Expense (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Account</Label>
                            <Select value={account} onValueChange={(v: any) => setAccount(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BKASH">Bkash</SelectItem>
                                    <SelectItem value="MISC">Miscellaneous</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Transaction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
