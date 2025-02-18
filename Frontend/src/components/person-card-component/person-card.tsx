import "./person-card.css";

export default function PersonCard(props: PersonCardProps) {
    return (
        <div className="person-card">
            <img src={props.profileUrl || "/img/No_Profile_Picture.jpeg"} alt={props.name} loading="lazy" />
            <div className="person-card-info">
                <h5>{props.name}</h5>
                <p>{props.character}</p>
            </div>
        </div>
    );
}
