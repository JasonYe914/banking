import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankTabItem } from "./BankTabItem";
import BankInfo from "./BankInfo";
import TransactionsTable from "./TransactionsTable";


const recentTransactions = ({accounts, transactions = [], appwriteItemId, page = 1 }: 
    RecentTransactionsProps) => {
    return (
        <section className="recent-transactions"> 
            <header className="flex item-center justify-between">
                <h2 className="recent-transactions-label">
                    Recent Transactions
                </h2>
                <Link href={`/transaction-history/?id=${appwriteItemId}`}
                    className="view-all-btn"
                >   
                    view All
                </Link>
            </header>
            <Tabs defaultValue={appwriteItemId} className="w-full">
                <TabsList className="recent-transactions-tablist">
                    {accounts?.map((a: Account) => (
                        <TabsTrigger key={a.id} value={a.appwriteItemId}>
                            <BankTabItem 
                                key={a.id}
                                account={a}
                                appwriteItemId={appwriteItemId}
                            /> 
                        </TabsTrigger>
                    ))}
                </TabsList>
                {accounts?.map((a : Account) => (
                    <TabsContent value={a.appwriteItemId} key={a.id} className="space-y-4">
                        <BankInfo 
                            account={a}
                            appwriteItemId={appwriteItemId}
                            type="full"
                        /> 
                        <TransactionsTable transactions={transactions}/> 
                    </TabsContent>
                ))}
            </Tabs>
        </section>
    )
}

export default recentTransactions;