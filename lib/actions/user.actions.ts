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
        createEmailPasswordSession(email, password); 
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
        const newUserAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name: `${firstName} ${lastName}`

        });
        const session = await account.createEmailPasswordSession({
            email,
            password
        });
        
        const cookieStore = await cookies(); 
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount); 
        
    }catch(error){
        console.error("Error", error); 
    }
}

export const getLoggedInUser = async() => {
    try{ 
        const { account} = await createSessionClient();
        const user = await account.get(); 
        return parseStringify(user);
    }catch(error){ 
        return null;
    } 
}