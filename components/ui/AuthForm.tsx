'use client'

import Link from 'next/link';
import Image from 'next/image';
import {useState} from "react"; 

import {email, z} from "zod"; 
import {zodResolver} from "@hookform/resolvers/zod"; 
import {Controller, useForm} from "react-hook-form"; 
import {Button} from "@/components/ui/button"; 
import {Input} from "@/components/ui/input"; 
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"; 
import CustomInputs from './CustomInputs';
import { formSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const authForm = ({type}: {type:String}) => {
    const [user, setUser] = useState(null);  
    const [isLoading, setIsLoading] = useState(false); 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), 
        defaultValues: {
            email: "", 
            password:"", 
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>){
        setIsLoading(true)
        console.log(values) 
        setIsLoading(false) 
    }

    return (
        <section className="auth-form">
            <header className="flex flex-col gap-5 md:gap-8">
                <Link href='/' 
                    className="cursor-pointer flex items-center gap-1"
                >
                    <Image 
                        src="/icons/logo.svg"
                        width={34}
                        height={34}
                        alt="logo"
                    />
                    <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Horizon</h1>
                </Link>
                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        {user ? "Link Account" : 
                        type === 'Sign-In' ? 
                        'Sign-In' : 'Sign-Up'}
                    </h1>
                    <p className="text-16 font-normal text-gray-600">
                        {user ? 'Link your account to get started' : 'Please enter your details'}
                    </p>
                </div>
            </header>
            {user ? (<div className="flex flex-col gap-4">
                
            </div>) : <>
                <form onSubmit={form.handleSubmit(onSubmit)} 
                    className="space-y-8" id="form-rhf-demo">
                        {type === 'Sign-Up' && (<> 
                            <CustomInputs 
                                control={form.control}
                                name="FirstName"
                                placeholder="ex: John"
                                label="First Name"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="LastName"
                                placeholder="ex: Doe"
                                label="Last Name"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="Address"
                                placeholder="Enter your specific address"
                                label="Address"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="State"
                                placeholder="ex: NY"
                                label="State"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="PostalCode"
                                placeholder="ex: 11101"
                                label="Postal Code"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="DateofBirth"
                                placeholder="yyyy-mm-dd"
                                label="Date of Birth"
                            />
                            <CustomInputs 
                                control={form.control}
                                name="SSN"
                                placeholder="ex: 1234"
                                label="SSN"
                            />
                        </>)}

                    <CustomInputs 
                        control={form.control}
                        name="email"
                        placeholder="Enter your email"
                        label="Email"
                    /> 
                    <CustomInputs 
                        control={form.control}
                        name="password"
                        placeholder="Enter your password"
                        label="Password"
                    /> 
                    <Field className="flex flex-col gap-4">
                        <Button type="submit" form="form-rhf-demo" className="form-btn">
                            {isLoading ? (<>
                                <Loader2 className="animate-spin" size={20}/> &nbsp; 
                                Loading...
                            </>) : type === 'Sign-In' ? 'Sign In' : 'Sign up'}
                        </Button>
                    </Field>
                </form>
                <footer className="flex justify-center gap-1">
                    <p className="text-14 font-normal text-gray-600">
                        {type === 'Sign-In' ? "Don't have an account?" : "Already have an account?" }
                    </p>
                    <Link href={type === 'Sign-In' ? "/sign-up" : "/sign-in"} className="form-link">
                            {type === 'Sign-In' ? 'Sign Up' : 'Sign In'}
                    </Link>
                </footer>
            </>}
        </section>
    )
}

export default authForm; 