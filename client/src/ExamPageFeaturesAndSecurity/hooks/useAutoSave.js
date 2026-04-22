import { useEffect } from "react";

export const useAutoSave = (examId, answers, review, timeLeft) => {

    // 1. Sirf Answers aur Review save karein (Jab wo badlein)
    useEffect(() => {
        if (examId && (Object.keys(answers).length > 0 || Object.keys(review).length > 0)) {
            localStorage.setItem(
                `exam_${examId}`,
                JSON.stringify({ answers, review })
            );
        }
    }, [answers, review, examId]); // timeLeft ko yahan se hata diya

    // 2. Timer ko alag se save karein
    // Isse performance boost hogi kyunki har second heavy JSON.stringify nahi chalega
    useEffect(() => {
        if (examId && timeLeft !== null) {
            localStorage.setItem(`exam_time_${examId}`, timeLeft);
        }
    }, [timeLeft, examId]);
};