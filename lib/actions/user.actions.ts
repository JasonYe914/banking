'use server'; 
import { ID } from "node-appwrite";
import { createAdminClient } from "./appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "./appwrite";
import { parseStringify } from "../utils";

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
