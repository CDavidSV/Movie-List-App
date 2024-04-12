import "./watchlist-progress.css";
import { useEffect, useRef, useState } from "react";

export default function WatchlistProgress(props: ProgressProps) {
    const inputChangeTimeout = useRef<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState<string>(props.progressState.progress.toString());

    useEffect(() => {
        setProgress(props.progressState.progress.toString());
    }, [props.progressState]);

    const handleProgressChange = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, action: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (action === 'add') {
            if (props.progressState.progress === props.progressState.totalProgress) return;
            setProgress((parseInt(progress) + 1).toString());
            props.updateProgress(props.progressState.progress + 1);
            return;
        } else if (action === 'remove') {
            if (props.progressState.progress === 0) return;
            setProgress((parseInt(progress) - 1).toString());
            props.updateProgress(props.progressState.progress - 1);
            return;
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLInputElement;

        setProgress(target.value);
        if (inputChangeTimeout.current) clearTimeout(inputChangeTimeout.current);
        inputChangeTimeout.current = setTimeout(() => {
            if (target.value === '' || isNaN(parseInt(target.value))) return;

            const newProgress = parseInt(target.value);

            if (newProgress < 0 ) {
                setProgress('0');
            } else if (newProgress > props.progressState.totalProgress) {
                setProgress(props.progressState.totalProgress.toString());
            }
            props.updateProgress(newProgress);

            inputChangeTimeout.current = null;
        }, 500);
    }

    return (
        <div className="progress">
            <div>
                <input 
                    className="progress-indicator input" 
                    type="text" name="current_progress" 
                    value={progress} 
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            (e.target as HTMLInputElement).blur();
                        }
                    }}/>
                    <span style={{paddingRight: "12px"}}>/</span>
                <span className="progress-indicator">{props.progressState.totalProgress}</span>
            </div>
            <span className="progress-btn material-icons" onClick={(e) => handleProgressChange(e, 'add')}>add</span>
        </div>
    );
}