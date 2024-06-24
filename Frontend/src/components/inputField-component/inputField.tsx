import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react"; 
import React from "react";
import "./inputField.css";
import { cn } from "@/lib/utils";

export default function InputField(
    { type, id, required, label, onInputChange, status, defaultValue, clearButton, autofocus, autocomplete, value, className }: 
    { type: string, id: string, required: boolean, label: string, onInputChange?: (value: string) => void , status?: string, defaultValue?: string, clearButton?: boolean, autofocus?: boolean, autocomplete?: string, value?: string, className?: React.HTMLAttributes<HTMLDivElement>["className"] }) {
    const [showPassword, setShowPassword] = useState(false)
    const inputRef = React.createRef<HTMLInputElement>();
    
    const togglePasswordView = () => {
        // Toggle the visibility of the password
        setShowPassword(!showPassword);
    }

    const inputChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        // if the input changes and it is not empty, apply the "has-content" class to the input box
        if (event.target.value !== "") {
            event.target.classList.add("has-content");
        } else {
            event.target.classList.remove("has-content");
        }

        if (onInputChange) onInputChange(event.target.value);
    }

    const clearinput = () => {
        // Clear the input field
        inputRef.current!.value = "";
    }

    useEffect(() => {
        // If the input field is not empty, apply the "has-content" class to the input box
        if (inputRef.current!.value !== "") {
            inputRef.current!.classList.add("has-content");
        }
    }, []);

    return (
        <div className={cn(`input-box ${status ? status : ""}`, className)}>
            {type === "password" && 
                <span onClick={togglePasswordView}>
                    { showPassword ? <Eye /> : <EyeOff /> }
                </span>
            }
            {clearButton && <span onClick={clearinput} style={{userSelect: "none"}}><X /></span> }
            <input 
            ref={inputRef} 
            onChange={inputChangeEvent}
            type={showPassword ? "text" : type} 
            id={id} required={required} 
            defaultValue={defaultValue}
            value={value}
            autoComplete={autocomplete}
            autoFocus={autofocus ? autofocus : false}/>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}