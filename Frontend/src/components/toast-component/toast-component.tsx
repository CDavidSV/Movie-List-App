import { useEffect, useRef, useState } from "react";
import "./toast-component.css";

export default function Toast({ message, onClose, type }: ToastProps) {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const [closing, setClosing] = useState<boolean>(false);

    const closeToast = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300);
    }

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            closeToast();
        }, 4000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const onMouseEnter = () => {
        console.log("mouse enter");
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    const onMouseLeave = () => {
        console.log("mouse leave");
        timeoutRef.current = setTimeout(() => {
            closeToast();
        }, 3000);
    }

    return (
        <div className={`toast ${type}${closing ? " closing" : ""}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <p>{message}</p>
            <button className="toast-close-btn" onClick={closeToast}>
                <span className="material-icons">close</span>
            </button>
        </div>
    );
}