import React from "react";

const QuestionCard = ({
    question,
    questionNumber,
    selectedAnswer,
    onAnswerChange,
    isMarked,
    onToggleReview
}) => {
    if (!question) return null;

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border min-h-[400px]">
            {/* Header: Question Number & Badge */}
            <div className="flex justify-between items-center mb-6">
                <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm">
                    Question {questionNumber}
                </span>
                {isMarked && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-bold">
                        Marked for Review
                    </span>
                )}
            </div>

            {/* Question Text */}
            <p className="text-xl mb-8 font-medium text-gray-800 leading-relaxed">
                {question.question}
            </p>

            {/* Options List */}
            <div className="space-y-4">
                {question.options.map((opt, i) => (
                    <label
                        key={i}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedAnswer === opt
                                ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <input
                            type="radio"
                            name={`question-${question._id}`}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            checked={selectedAnswer === opt}
                            onChange={() => onAnswerChange(question._id, opt)}
                        />
                        <span className={`ml-4 text-lg ${selectedAnswer === opt ? "text-indigo-900 font-semibold" : "text-gray-700"}`}>
                            {opt}
                        </span>
                    </label>
                ))}
            </div>

            {/* Local Action Button (Review) */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                    onClick={() => onToggleReview(question._id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${isMarked
                            ? "bg-yellow-400 text-yellow-900 shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                    {isMarked ? "Remove Review" : "Mark for Review"}
                </button>
            </div>
        </div>
    );
};

export default QuestionCard;