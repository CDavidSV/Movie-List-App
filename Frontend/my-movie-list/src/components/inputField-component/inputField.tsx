import { useEffect, useState } from "react";
import "./inputField.css";
import React from "react";

export default function InputField(
    { type, id, required, label, onInputChange, status, value, clearButton, autofocus, autocomplete }: 
    { type: string, id: string, required: boolean, label: string, onInputChange: (value: string) => void , status?: string, value?: string, clearButton?: boolean, autofocus?: boolean, autocomplete?: string }) {
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

        onInputChange(event.target.value);
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
        <div className={`input-box ${status ? status : ""}`}>
            {type === "password" && 
                <span onClick={togglePasswordView} className="material-icons">
                    { showPassword ? "visibility" : "visibility_off"}
                </span>
            }
            {clearButton && <span onClick={clearinput} style={{userSelect: "none"}} className="material-icons">close</span>}
            <input 
            ref={inputRef} 
            onChange={inputChangeEvent} 
            type={showPassword ? "text" : type} 
            id={id} required={required} 
            defaultValue={value}
            autoComplete={autocomplete}
            autoFocus={autofocus ? autofocus : false}/>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}