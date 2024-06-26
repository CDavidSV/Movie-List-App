import ReactDOM from "react-dom";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./modal.css";

type ModalState = "open" | "closed" | "opening" | "closing";

export default function Modal({ open, onClose, children, style, background = true }: { open: boolean, onClose: () => void, children: React.ReactNode, style?: React.CSSProperties, background?: boolean }) {    
    const [modalState, setModalState] = useState<ModalState>("closed");

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            setModalState("opening");
            setTimeout(() => {
                setModalState("open");
            }, 50);
            return;
        }

        setModalState("closing");
        document.body.style.overflow = "auto";
        setTimeout(() => {
            setModalState("closed");
        }, 300);
    }, [open]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, []);

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    }
    
    if (modalState === "closed") return null;
    
    return ReactDOM.createPortal(
        <>
            <div className={`modal ${modalState} ${background && "background"}`} style={style}>
                <span className="modal-close" onClick={() => onClose()}>
                    <X />
                </span>
                <div>
                    {children}
                </div>
            </div>
            <div className={`modal-container ${modalState}`} onClick={() => onClose()}></div>
        </>
    , document.getElementById("portal")!);
}