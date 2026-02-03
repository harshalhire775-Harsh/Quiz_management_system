import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getTimerColor = () => {
        if (timeLeft < 60) return 'var(--error)';
        if (timeLeft < 300) return 'var(--secondary)';
        return 'var(--primary)';
    };

    return (
        <div className="glass-card" style={{
            padding: '10px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '1.2rem',
            color: getTimerColor(),
            border: `2px solid ${getTimerColor()}`
        }}>
            <Clock size={24} />
            <span>{formatTime(timeLeft)}</span>
        </div>
    );
};

export default Timer;
