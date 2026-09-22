'use server'; 
import { Client, ID, Query } from "node-appwrite";
import { createAdminClient } from "./appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "./appwrite";
import { extractCustomerIdFromUrl, parseStringify } from "../utils";
import { Products, CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum } from "plaid";
import { plaidClient } from "./plaid";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { encryptId } from "../utils";
import { revalidatePath } from "next/cache";

const { 
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID: USERS_COLLECTION_ID,
    APPWRITE_BANK_COLLECTIONS_ID: BANK_COLLECTION_ID,
} = process.env; 

export const getUserInfo = async({userId}: getUserInfoProps) => {
    try{
        const { tablesDB } = await createAdminClient();
        const user = await tablesDB.listRows({
            databaseId: DATABASE_ID!,
            tableId: USERS_COLLECTION_ID!,
            queries: [Query.equal("userId", userId)],
        })
        return parseStringify(user.rows[0]);
    }catch(error){
        console.error("Error getting user info", error);
    }
}

export const signIn = async({email, password}: signInProps) => {
    try{
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession({
            email: email,
            password: password
        });

        const cookieStore = await cookies(); 
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });


        const user = await getUserInfo({ userId: session.userId});

        console.log("Sign-In Response", user);
        return parseStringify(user);

    }catch(error){
        console.error("Error", error); 
    }
}

//extract password first then spread out other properties 
export const signUp = async({password, ...userData}: SignUpParams) => {
    const {
            email, firstName, lastName, 
            address1, city, state, postalCode, dateOfBirth, 
            ssn
        } = userData; 

    let newUserAccount; 
    try{
        const { account, tablesDB } = await createAdminClient();

        //Auth account creation 
        newUserAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name: `${firstName} ${lastName}`

        });

        const session = await account.createEmailPasswordSession({
            email: email,
            password: password
        });

        const cookieStore = await cookies(); 
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        if(!newUserAccount) throw new Error("Failed to create user account");

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData, type: "personal", 
        }); 

        if(!dwollaCustomerUrl) throw new Error("Failed to create Dwolla customer");

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl); 

        //creating account in users db 
        const newUser = await tablesDB.createRow({
            databaseId: DATABASE_ID!, 
            tableId: USERS_COLLECTION_ID!, 
            rowId: ID.unique(), 
            data: {
                ...userData, userId: newUserAccount.$id, dwollaCustomerId, dwollaCustomerUrl,
            }
        });

        return parseStringify(newUser); 
        
    }catch(error){
        console.error("Error", error); 
    }
}

// Returns the logged-in user, or null when there is no valid session.
export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({userId: result.$id});

    return parseStringify(user);
  } catch {
    // No cookie, or an expired/invalid session. Callers decide what to do.
    return null;
  }
};

// Like getLoggedInUser, but sends logged-out visitors to the sign-in page.
// redirect() throws, so it must stay outside any try/catch.
export const requireLoggedInUser = async () => {
  const user = await getLoggedInUser();
  if (!user) redirect("/sign-in");
  return user;
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

export const createBankAccount = async({ 
    accessToken, userId, accountId, bankId, fundingSourceUrl, shareableId
}: createBankAccountProps) => {
    try{
        const { tablesDB } = await createAdminClient(); 
        const bankAccount = await tablesDB.createRow({
            databaseId: DATABASE_ID!, 
            tableId: BANK_COLLECTION_ID!, 
            rowId: ID.unique(), 
            data: {
                accessToken,
                userId,
                accountId,
                bankId,
                fundingSourceUrl,
                shareableId, 
            } 
        })

        return parseStringify(bankAccount);
    }catch(error){
        console.log("Error creating bank account", error);
        throw error;
    }
}

export const createLinkToken = async(user: User) => {
    try{
        const tokenParam = {
            user: {
                client_user_id: user.$id,
                
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth', 'transactions'] as Products[], 
            language: 'en', 
            country_codes: ['US'] as CountryCode[], 
        } 

        const response = await plaidClient.linkTokenCreate(tokenParam);
        return parseStringify({linkToken: response.data.link_token});
    }catch(error){
        console.log("Error creating link token", error);
    } 
}

//handshake process to exchange public token with secret token 
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

        if(!fundingSourceUrl) throw new Error("Dwolla funding source was not created");

        await createBankAccount({
            userId: user.$id,
            bankId: itemId, 
            accountId: accountData.account_id,
            accessToken, 
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        })

        revalidatePath("/"); 

        return parseStringify({
            publicTokenExchange: 'Complete', 
        });


    }catch(error){
        console.log("Error exchanging public token", error);
    }
}

export const getBanks = async ({userId}: getBanksProps) => {
    try{
        const { tablesDB } = await createAdminClient();
        const banks = await tablesDB.listRows({
            databaseId: DATABASE_ID!,
            tableId: BANK_COLLECTION_ID!,
            queries: [Query.equal("userId", userId)],
        })
        return parseStringify(banks.rows);
    }catch(error){
        console.log("Error getting banks", error);
    }
}

export const getBank = async ({documentId}: getBankProps) => {
    try{
        const { tablesDB } = await createAdminClient();
        const bank = await tablesDB.getRow({
            databaseId: DATABASE_ID!,
            tableId: BANK_COLLECTION_ID!,
            rowId: documentId,
        })
        return parseStringify(bank);
    }catch(error){
        console.log("Error getting banks", error);
    }
}

export const getBankByAccountId = async ({accountId}: getBankByAccountIdProps) => {
    try{
        const { tablesDB } = await createAdminClient();
        const bank = await tablesDB.listRows({
            databaseId: DATABASE_ID!,
            tableId: BANK_COLLECTION_ID!,
            queries: [Query.equal("accountId", [accountId])],
        })

        if (bank.total !== 1) return null;

        return parseStringify(bank.rows[0]);
    }catch(error){
        console.log("Error getting bank by account id", error);
    }
}
