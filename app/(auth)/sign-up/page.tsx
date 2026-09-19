import AuthForm from "@/components/ui/AuthForm"
import { getLoggedInUser } from "@/lib/actions/user.actions";

const signUp = async() => { 
    return (
        <section className="flex-center size-full max-sm:px-6">
            <AuthForm 
                type="Sign-Up"
            /> 
        </section>
    )
}

export default signUp; 