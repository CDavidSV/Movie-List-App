import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import "./modal.css";

type ModalState = "open" | "closed" | "opening" | "closing";

export default function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {    
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
    
    if (modalState === "closed") return null;
    
    return ReactDOM.createPortal(
        <>
            <div className={`modal ${modalState}`}>
                <span className="material-icons modal-close" onClick={() => onClose()}>close</span>
                <div className="modal-content">
                    {children}
                </div>
            </div>
            <div className={`modal-container ${modalState}`} onClick={() => onClose()}></div>
        </>
    , document.getElementById("portal")!);
}