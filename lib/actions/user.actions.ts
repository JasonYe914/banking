'use server'; 
import { ID } from "node-appwrite";
import { createAdminClient } from "./appwrite";
import { cookies } from "next/headers";
import { createSessionClient } from "./appwrite";
import { parseStringify } from "../utils";
import { Products, CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum } from "plaid";
import { plaidClient } from "./plaid";

export const signIn = async({email, password}: signInProps) => {
    try{
        const { account } = await createAdminClient();
        const response = await account.
        createEmailPasswordSession({email: email, password: password});

        //Authenticated with createEmailPasswordSession, now we need to set the cookie for the session
        //e.g. save it so that when we go to home page.tsx getLoggedInUser() can get the user info from the session cookie
        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        console.log("Sign-In Response", response);
        return parseStringify(response);

    }catch(error){
        console.error("Error", error); 
    }
}

export const signUp = async(userData:SignUpParams) => {
    const {
            email, password, firstName, lastName, 
            address1, city, state, postalCode, dateOfBirth, 
            ssn
        } = userData; 
    try{
        
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession({
            email: email,
            password: password
        });
        const newUserAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name: `${firstName} ${lastName}`

        });
        
        const cookieStore = await cookies(); 
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        return parseStringify(newUserAccount); 
        
    }catch(error){
        console.error("Error", error); 
    }
}

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    console.log(user);

    return parseStringify(user);
  } catch (error) {
    console.error("account.get() failed:", error);
    throw error;
  }
};

export const logoutAccount = async() => {
    try{
        const { account } = await createSessionClient()
        const cookieStore = await cookies(); 
        cookieStore.delete("appwrite-session");
        await account.deleteSession({sessionId: "current"});
    }catch(error){
        console.log("Error logging out", error);
        return null; 
    }
}

export const createLinkToken = async(user: User) => {
    try{
        const tokenParam = {
            user: {
                client_user_id: user.$id,
                
            },
            client_name: user.name,
            products: ['auth'] as Products[], 
            language: 'en', 
            country_codes: ['US'] as CountryCode[], 
        } 

        const response = await plaidClient.linkTokenCreate(tokenParam);
        return parseStringify({linkToken: response.data.link_token});
    }catch(error){
        console.log("Error creating link token", error);
    } 
}

export const exchangePublicToken = async ({
    publicToken, user,
}: exchangePublicTokenProps) => {
    try{
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken, 
        }); 

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        }); 

        const accountData = accountsResponse.data.accounts[0]; 
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken, 
            account_id: accountData.account_id, 
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum, 
        }; 

        const processorTokenResponse = await plaidClient.processorTokenCreate(request); 
        const processorToken = processorTokenResponse.data.processor_token; 

        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId, 
            processorToken,
            bankName: accountData.name,
        }); 

        if(!fundingSourceUrl) throw Error;  

        await createBankAccount({
            userId: user.$id,
            bankId: itemId, 
            accountId: accountData.account_id,
            accessToken, 
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        })

        revalidatePath("/"); 

        return parseStringify({
            publicTokenExchange: 'Complete', 
        });


    }catch(error){
        console.log("Error exchanging public token", error);
    }
}

