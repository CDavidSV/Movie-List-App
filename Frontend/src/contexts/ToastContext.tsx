import { createContext, useMemo, useState } from "react";
import Toast from "../components/toast-component/toast-component";
import { ToastType } from "../models/types";

interface ToastContextProps {
    open: (message: string, type?: ToastType) => void;
    close: (id: number) => void;
}

type Toast = {
    id: number;
    message: string;
    type?: ToastType;
}

export const ToastContext = createContext<ToastContextProps>({
    open: () => {},
    close: () => {}
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    const open = (message: string, type?: ToastType) => {
        const toastId = Date.now();
        const toast = {
            id: toastId,
            message,
            type
        };
        setToasts(prevToasts => [...prevToasts, toast]);
    }

    const close = (id: number) => {
       setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id)) 
    };

    const contextValue = useMemo(() => ({
        open,
        close
    }), []);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="toasts">
                {toasts.map((toast) => (
                    <Toast type={toast.type || "info"} key={toast.id} message={toast.message} onClose={() => close(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}