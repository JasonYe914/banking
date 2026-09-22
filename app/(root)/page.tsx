import react from "react"; 
import HeaderBox from "@/components/ui/HeaderBox";
import TotalBalanceBox from "@/components/ui/TotalBalanceBox";
import RightSideBar from "@/components/ui/RightSideBar"
import { requireLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts, getAccount } from "@/lib/actions/bank.actions";
import  RecentTransactions from "@/components/ui/RecentTransactions";

const Home = async ({searchParams}: SearchParamProps) => {
    const {id, page} = await searchParams;
    const currentPage = parseInt(page as string) || 1; 
    const loggedIn = await requireLoggedInUser();
    const accounts = await getAccounts({userId: loggedIn.$id});

    if(!accounts) return; 

    const accountData = accounts?.data[0];
    const appwriteItemId = (id as string) || accountData?.appwriteItemId; 
    const account = await getAccount({appwriteItemId});

    return (
        <section className= "home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox 
                        type="greeting"
                        title="Welcome" 
                        user={loggedIn?.firstName || "Guest"}
                        subtext="Access and manage your 
                        accounts and transactions efficently"
                    />
                    <TotalBalanceBox 
                        accounts={[accountData]}
                        totalBanks={accounts?.totalBanks}
                        totalCurrentBalance={accounts?.totalCurrentBalance}
                    />
                </header>
                <RecentTransactions 
                    accounts={accounts?.data}
                    transactions={account?.transaction}
                    appwriteItemId={appwriteItemId}
                    page={currentPage}
                />
            </div> 
            <RightSideBar 
                user={loggedIn}
                transactions={accounts?.transactions}
                banks={accounts?.data?.slice(0,2)}
            /> 
        </section>
    )
}

export default Home; 

