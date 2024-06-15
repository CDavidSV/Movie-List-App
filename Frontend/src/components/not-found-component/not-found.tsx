import "./not-found.css";
import { Frown } from "lucide-react";

export default function NotFound({ message }: { message: string }) {
    return (
        <div style={{width: "100%"}}>
            <div className="not-found">
                <Frown size={120}/>
                <h3>Nothing here yet</h3>
                <p>{message}</p>
            </div>
        </div>
    );
}