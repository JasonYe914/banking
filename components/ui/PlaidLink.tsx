import { Button } from "./button";
import { useState, useCallback, useEffect } from "react";
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";
import { createLinkToken } from "@/lib/actions/user.actions";
import { exchangePublicToken } from "@/lib/actions/user.actions";
import Image from "next/image";

const PlaidLink = ({user, variant}: PlaidLinkProps) => {
    const router = useRouter(); 
    
    const [token, setToken] = useState(''); 
    //allows to use side effects then syncs component after side effect is complete
    useEffect(() => {
        const getLinkToken = async () => {
           const data = await createLinkToken(user); 
           setToken(data?.linkToken); 
        }

        getLinkToken();
    }, [user]);
    
    //useCallback prevents child components from re-rendering by caching function b/w states
    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string | null) => {
        if (!public_token) return;

        await exchangePublicToken({
            publicToken: public_token,
            user, 
        });
        router.push('/');
    }, [user, router]);

    const config: PlaidLinkOptions = {
        token, 
        onSuccess 
    }

    const { open, ready } = usePlaidLink(config); 

    return (
        <>
            {variant === "primary" ? (
                <Button className="plaidlink-primary" onClick={() => open()} disabled={!ready}>
                    Connect Bank 
                </Button>
            ): variant === "ghost" ? (
                <Button onClick={() => open()} variant="ghost" className="plaidlink-ghost pr-10">
                    <Image 
                        src="/icons/connect-bank.svg"
                        alt="connect-bank"
                        width={34}
                        height={34}
                    />
                    <p className="hidden text-16 font-semibold text-black-2 xl:block">
                        Connect Bank
                    </p>
                </Button>
            ): (
                <Button onClick={() => open()} className="plaidlink-default">
                    <Image 
                        src="/icons/connect-bank.svg"
                        alt="connect-bank"
                        width={24}
                        height={24}
                    />
                    <p className="sidebar-label">Connect Bank</p>
                </Button>
            )} 
        </>
    )
}

export default PlaidLink; 