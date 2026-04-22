import React from "react";

const QuestionPalette = ({ questions, answers, review, currentIdx, setIdx }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow h-fit sticky top-4">
            <h3 className="font-bold mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                    const isAnswered = !!answers[q._id];
                    const isReview = !!review[q._id];
                    const isActive = currentIdx === i;

                    let bgColor = "bg-gray-200 text-gray-700";
                    if (isAnswered) bgColor = "bg-green-500 text-white";
                    if (isReview) bgColor = "bg-yellow-400 text-black";
                    if (isActive) bgColor = "ring-2 ring-indigo-600 ring-offset-2 " + bgColor;

                    return (
                        <button
                            key={q._id}
                            onClick={() => setIdx(i)}
                            className={`h-10 w-full rounded font-bold text-sm transition-all ${bgColor}`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded"></div> Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded"></div> Not Visited</div>
            </div>
        </div>
    );
};

export default QuestionPalette;