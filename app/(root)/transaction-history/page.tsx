import HeaderBox from "@/components/ui/HeaderBox";
import { requireLoggedInUser } from "@/lib/actions/user.actions"; 
import { getAccounts, getAccount } from "@/lib/actions/bank.actions";
import { formatAmount } from "@/lib/utils";
import TransactionsTable from "@/components/ui/TransactionsTable";

const transactionHistory = async ({searchParams}: SearchParamProps) => {
    const {id, page} = await searchParams;
    const currentPage = parseInt(page as string) || 1; 
    const loggedIn = await requireLoggedInUser();
    const accounts = await getAccounts({userId: loggedIn.$id});
    
    if(!accounts) return; 
    
    const accountData = accounts?.data[0];
    const appwriteItemId = (id as string) || accountData?.appwriteItemId; 
    const account = await getAccount({appwriteItemId});
    return (
        <section className="transactions">
            <div className="transactions-header">
                <HeaderBox 
                    title="Transaction History"
                    subtext="View all your transactions history"
                /> 
            </div>
            <div className="space-y-6">
                <div className="transactions-account">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-18 font-bold text-white">
                            {accountData.name}
                        </h2>
                        <p className="text-14 text-blue-25">{accountData.officialName}</p>
                        <p className="text-14 font-semibold tracking-[1.1px] text-white">
                            ●●●● ●●●● ●●●● <span className="text-16">
                            {accountData.mask}
                        </span>
                        </p>

                    </div>
                    <div className="transactions-account-balance">
                        <p className="text-14">
                            Current Balance
                        </p>
                        <p className="text-24 text-center font-bold">
                            {formatAmount(accountData.currentBalance)}
                        </p>
                    </div>
                </div>
                <section className="flex flex-col w-full gap-6"> 
                    <TransactionsTable 
                        transactions={accountData.transactions || []}
                    /> 
                </section>
            </div>
        </section>
    )
}

export default transactionHistory; 