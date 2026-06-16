import AuthForm from "@/components/ui/AuthForm"

const signIn = () => { 
    return (
        <section className="flex-center size-full max-sm:px-6">
            <AuthForm 
                type="Sign-In"
            /> 
        </section>
    )
}

export default signIn; 