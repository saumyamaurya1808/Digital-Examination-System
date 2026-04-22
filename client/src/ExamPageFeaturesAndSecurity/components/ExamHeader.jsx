import React from "react";
import { Clock } from "lucide-react";

const ExamHeader = ({ timeLeftDisplay, examName, isWarning }) => {
    return (
        <header className="bg-white border-b sticky top-0 z-40 px-6 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{examName}</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold text-indigo-500">
                        Ongoing Assessment
                    </p>
                </div>

                <div className={`flex items-center gap-3 px-4 py-2 rounded-full font-mono text-xl font-bold transition-all duration-300 ${isWarning
                        ? "bg-red-100 text-red-600 animate-pulse border border-red-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}>
                    <Clock size={20} className={isWarning ? "text-red-500" : "text-gray-500"} />
                    {/* Hook se aaya hua formatted string yahan display hoga */}
                    {timeLeftDisplay}
                </div>
            </div>
        </header>
    );
};

export default ExamHeader;