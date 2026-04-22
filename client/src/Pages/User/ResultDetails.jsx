import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Circle, HelpCircle } from 'lucide-react';
import { server_url } from '../../App';

export const ResultDetails = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`${server_url}/api/exams/result-single/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setResult(res.data.result);
                }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold animate-pulse text-indigo-600">Generating Answer Key...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen">
            {/* Header Section */}
            <header className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{result?.examId?.title}</h1>
                        <p className="text-gray-500 font-medium mt-1">Examinee: <span className="text-indigo-600">{result?.examineeId?.name}</span></p>
                        <p className="text-gray-500 font-medium mt-1">Email: <span className="text-indigo-600">{result?.examineeId?.email}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] uppercase font-black text-gray-400">Final Score</p>
                            <p className="text-xl font-bold text-indigo-600">{result?.score} <span className="text-gray-300 text-sm">/ {result?.totalMarks}</span></p>
                        </div>
                        <div className={`px-6 py-2 rounded-2xl flex items-center shadow-sm font-bold border ${result?.status === 'Passed' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                            {result?.status}
                        </div>
                    </div>
                </div>
            </header>

            {/* Questions List */}
            <div className="space-y-8">
                {result?.submittedAnswers.map((ans, index) => {
                    const questionObj = ans.questionId;
                    const options = questionObj?.options || [];

                    return (
                        <div key={index} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div className={`px-6 py-3 flex justify-between items-center ${ans.isCorrect ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question {index + 1}</span>
                                {ans.isCorrect ?
                                    <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-white px-2 py-1 rounded-lg border border-green-100"><CheckCircle size={14} /> Correct</div> :
                                    <div className="flex items-center gap-1 text-red-600 font-bold text-xs bg-white px-2 py-1 rounded-lg border border-red-100"><XCircle size={14} /> Incorrect</div>
                                }
                            </div>

                            <div className="p-6">
                                <p className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">
                                    {questionObj?.question || "Question text missing"}
                                </p>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 gap-3">
                                    {options.map((opt, optIdx) => {
                                        const isCorrectOption = opt === ans.correctOption;
                                        const isSelectedOption = opt === ans.selectedOption;

                                        // Styling Logic
                                        let borderColor = "border-gray-100";
                                        let bgColor = "bg-gray-50/50";
                                        let textColor = "text-gray-600";

                                        if (isCorrectOption) {
                                            borderColor = "border-green-500 ring-1 ring-green-500";
                                            bgColor = "bg-green-50";
                                            textColor = "text-green-800";
                                        } else if (isSelectedOption && !ans.isCorrect) {
                                            borderColor = "border-red-500 ring-1 ring-red-500";
                                            bgColor = "bg-red-50";
                                            textColor = "text-red-800";
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`flex items-center p-4 rounded-2xl border-2 transition-all ${borderColor} ${bgColor}`}
                                            >
                                                <div className={`mr-3 ${isCorrectOption ? 'text-green-600' : isSelectedOption ? 'text-red-600' : 'text-gray-300'}`}>
                                                    {isCorrectOption ? <CheckCircle size={20} /> : isSelectedOption && !ans.isCorrect ? <XCircle size={20} /> : <Circle size={20} />}
                                                </div>
                                                <span className={`font-semibold ${textColor}`}>{opt}</span>

                                                {/* Labels */}
                                                <div className="ml-auto flex gap-2">
                                                    {isCorrectOption && <span className="text-[10px] font-black uppercase bg-green-600 text-white px-2 py-0.5 rounded">Correct Answer</span>}
                                                    {isSelectedOption && !ans.isCorrect && <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded">Your Choice</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Summary Note */}
                                {ans.selectedOption === null && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm font-medium flex items-center gap-2">
                                        <HelpCircle size={16} /> You did not attempt this question.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="mt-12 text-center text-gray-400 text-sm pb-10">
                End of Answer Key • {new Date().getFullYear()} Examination System
            </footer>
        </div>
    );
};