import React from "react";
import { AlertTriangle, ShieldCheck, Monitor, Clock } from "lucide-react";

const InstructionScreen = ({ startExam }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <h2 className="text-3xl font-bold">Exam Instructions</h2>
                    <p className="mt-2 opacity-90">Please read carefully before starting</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex gap-4">
                            <div className="bg-red-100 p-3 rounded-lg h-fit">
                                <Monitor className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Forced Fullscreen</h4>
                                <p className="text-sm text-gray-600">Exiting fullscreen mode will result in immediate auto-submission.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-lg h-fit">
                                <AlertTriangle className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Anti-Cheat</h4>
                                <p className="text-sm text-gray-600">Tab switching, right-clicking, and DevTools are strictly prohibited.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg h-fit">
                                <Clock className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Auto-Timer</h4>
                                <p className="text-sm text-gray-600">The exam will submit automatically when the timer reaches 00:00.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-green-100 p-3 rounded-lg h-fit">
                                <ShieldCheck className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Auto-Save</h4>
                                <p className="text-sm text-gray-600">Your progress is saved locally. You can resume after a refresh.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
                        <h5 className="font-bold text-gray-700 mb-2 underline">Final Warnings:</h5>
                        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                            <li>Do not attempt to take screenshots (detected).</li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Clicking "Start Exam" will enter Fullscreen mode.</li>
                        </ul>
                    </div>

                    <button
                        onClick={startExam}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                    >
                        I Understand, Start Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionScreen;