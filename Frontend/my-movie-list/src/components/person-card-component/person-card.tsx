import "./person-card.css";

export default function PersonCard(props: PersonCardProps) {
    return (
        <div className="person-card">
            <img src={props.profleUrl} alt={props.name} />
            <div className="person-card-info">
                <h5>{props.name}</h5>
                <p>{props.character}</p>
            </div>
        </div>
    );
}