import { useState } from "react";
import "./inputField.css";

export default function InputField(
    { type, id, required, label, onInputChange, status,  }: 
    { type: string, id: string, required: boolean, label: string, onInputChange: Function, status?: string }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const togglePasswordView = () => {
        // Toggle the visibility of the password
        setShowPassword(!showPassword);
    }

    const inputChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(event.target.value);
    }

    return (
        <div className={`input-box ${status ? status : ""}`}>
            {type === "password" && 
                <span onClick={togglePasswordView} className="material-symbols-outlined">
                    { showPassword ? "visibility" : "visibility_off"}
                </span>
            }
            <input onChange={inputChangeEvent} type={showPassword ? "text" : type} id={id} required={required}/>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}