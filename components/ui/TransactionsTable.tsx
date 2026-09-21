import {
    Table, 
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table"

import { formatAmount, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

const transactionsTable = ({transactions}: TransactionTableProps) => {
    return (
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2">Transactions</TableHead>
                    <TableHead className="px-2">Amount</TableHead>
                    <TableHead className="px-2">Status</TableHead>
                    <TableHead className="px-2">Date</TableHead>
                    <TableHead className="px-2 max-md:hidden">Channel</TableHead>
                    <TableHead className="px-2 max-md:hidden">Category</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions?.map((t: Transaction) => {
                    const status = getTransactionStatus(new Date(t.date));
                    const amount = formatAmount(t.amount); 

                    const isDebit = t.type === "debit"; 
                    const isCredit = t.type === "credit";

                    return (
                        <TableRow key={t.id} className={`${isDebit || amount[0] === "-" ? 
                            "bg-[#fffbfa]" : "bg-[#f6fef9]"} !over:bg-none !border-b-default`}>
                            <TableCell className="max-w-[250px] pl-2 pr-10">
                                <div className="flex item-center gap-3">
                                    <h1 className="text-14 truncate font-semibold text-[#344054]">
                                        {removeSpecialCharacters(t.name)} 
                                    </h1>
                                </div>
                            </TableCell>
                            <TableCell className="pl-2 pr-10 font-semibold">
                                {isDebit ? `-${amount}` : isCredit ? amount:amount}
                            </TableCell>
                            <TableCell>
                                {status} 
                            </TableCell>
                            <TableCell>
                                {formatDateTime(new Date(t.date)).dateTime}
                            </TableCell>
                            <TableCell className="max-md:hidden">
                                {t.paymentChannel}
                            </TableCell>
                            <TableCell className="max-md:hidden">
                                {t.category}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default transactionsTable;