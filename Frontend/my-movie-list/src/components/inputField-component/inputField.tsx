import { useState } from "react";
import "./inputField.css";
import React from "react";

export default function InputField(
    { type, id, required, label, onInputChange, status, value, clearButton, autofocus }: 
    { type: string, id: string, required: boolean, label: string, onInputChange: (value: string) => void , status?: string, value?: string, clearButton?: boolean, autofocus?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = React.createRef<HTMLInputElement>();
    let autocomplete: string = "off";

    switch (type) {
        case "email":
            autocomplete = "email";
            break;
        case "password":
            autocomplete = "current-password";
            break;
        default:
            break;
    }
    
    const togglePasswordView = () => {
        // Toggle the visibility of the password
        setShowPassword(!showPassword);
    }

    const inputChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(event.target.value);
    }

    const clearinput = () => {
        // Clear the input field
        inputRef.current!.value = "";
    }

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
            value={value} 
            autoComplete={autocomplete}
            autoFocus={autofocus ? autofocus : false}/>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}