export const useExamResume = (examId) => {
    const savedData = localStorage.getItem(`exam_${examId}`);
    const savedTime = localStorage.getItem(`exam_time_${examId}`);

    return {
        savedState: savedData ? JSON.parse(savedData) : null,
        savedTime: savedTime ? parseInt(savedTime) : null
    };
};