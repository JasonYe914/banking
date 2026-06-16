import {Controller, FieldPath, Form} from "react-hook-form"; 
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
import {z} from "zod"; 
import {Control} from 'react-hook-form'; 
import { formSchema } from "@/lib/utils";

interface CustomInput{
    control: Control<z.infer<typeof formSchema>>,  
    name: FieldPath<z.infer<typeof formSchema>>, 
    placeholder: string, 
    label: string
}

const customInputs = ({control, name, placeholder, label}: CustomInput) => {
    return ( 
        <FieldGroup>
            <Controller 
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <Field className="form-item" data-invalid="form-rhf-demo-email">
                        <FieldLabel className="form-label">
                            {label}
                        </FieldLabel>
                        <div className="flex w-full flex-col">
                            <Input placeholder={placeholder}
                                className="input-class" type={name === 'password' ? 'password' : 'text'} {...field}/>
                        </div>
                        {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} className="text-red-500"/>
                        )} 
                    </Field>
                )}
            />
        </FieldGroup>
    )
}

export default customInputs; 