import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import "./toast-component.css";

export default function Toast({ message, onClose, type }: ToastProps) {
    const timeoutRef = useRef<NodeJS.Timeout>(null);
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
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    const onMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            closeToast();
        }, 3000);
    }

    return (
        <div className={`toast ${type}${closing ? " closing" : ""}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <p>{message}</p>
            <button className="toast-close-btn" onClick={closeToast}>
                <X />
            </button>
        </div>
    );
}
