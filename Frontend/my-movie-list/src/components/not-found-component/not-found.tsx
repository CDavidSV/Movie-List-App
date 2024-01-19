import "./not-found.css";

export default function NotFound({ message }: { message: string }) {
    return (
        <div>
            <div className="not-found">
                <span style={{fontSize: "100px"}} className="material-icons">sentiment_dissatisfied</span>
                <h3>Nothing here yet</h3>
                <p>{message}</p>
            </div>
        </div>
    );
}