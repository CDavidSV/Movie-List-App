import "./watchlist-progress.css";

interface ProgressProps {
    progressState: { progress: number, totalProgress: number },
    mediaId: string,
    type: string,
    updateProgress: (amount: number) => void,
}

export default function WatchlistProgress(props: ProgressProps) {
    const handleProgressChange = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, action: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (action === 'add') {
            if (props.progressState.progress === props.progressState.totalProgress) return;
            props.updateProgress(1);
            return;
        } else if (action === 'remove') {
            if (props.progressState.progress === 0) return;
            props.updateProgress(-1);
            return;
        }
    }

    return (
        <div className="progress">
            <span className="progress-btn material-icons" onClick={(e) => handleProgressChange(e, 'remove')}>remove</span>
            <span className="progress-indicator">{`${props.progressState.progress}/${props.progressState.totalProgress}`}</span>
            <span className="progress-btn material-icons" onClick={(e) => handleProgressChange(e, 'add')}>add</span>
        </div>
    );
}