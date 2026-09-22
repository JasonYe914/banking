import HeaderBox from "@/components/ui/HeaderBox";
import { requireLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts } from "@/lib/actions/bank.actions";
import BankCard from "@/components/ui/BankCard";

const myBanks = async () => {
    const loggedIn = await requireLoggedInUser();
    const accounts = await getAccounts({userId: loggedIn.$id});
    return (
        <section className="flex">
            <div className="my-banks">
                <HeaderBox
                    title="My Bank Accounts"
                    subtext="Effortlessy manage your banking activities"
                /> 
                <div className="space-y-4">
                    <h2 className="header-2">
                        Your Cards
                    </h2>
                    <div className="flex flex-wrap gap-6">
                        {accounts?.data.map((a: Account) => (
                            <BankCard 
                                key={a.id}
                                account={a}
                                userName={loggedIn?.firstName}
                            /> 
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default myBanks; 