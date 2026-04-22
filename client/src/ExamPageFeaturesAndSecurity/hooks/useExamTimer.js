import { useState, useEffect, useCallback } from "react";

export const useExamTimer = (initialTime, testStarted, submitted, onTimeUp) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    // Function to format seconds into HH:MM:SS
    const formatTime = useCallback((seconds) => {
        if (seconds <= 0) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
        }
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    }, []);

    useEffect(() => {
        // Agar test start nahi hua, submit ho gaya, ya time hi nahi mila toh ruk jao
        if (!testStarted || submitted || timeLeft === null || timeLeft === undefined) return;

        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [testStarted, submitted, timeLeft, onTimeUp]);
    
    return { timeLeft, setTimeLeft, formatTime };
};