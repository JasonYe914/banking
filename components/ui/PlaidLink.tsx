import { Button } from "./button";
import { useState, useCallback, useEffect } from "react";
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";
import { createLinkToken } from "@/lib/actions/user.actions";
import { exchangePublicToken } from "@/lib/actions/user.actions";

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
                <Button>
                    Connect Bank 
                </Button>
            ): (
                <Button>
                    Connect Bank
                </Button>
            )} 
        </>
    )
}

export default PlaidLink; 