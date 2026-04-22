import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from 'sweetalert2';
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { server_url } from "../../App";

// Custom Hooks
import { useExamTimer } from "../../ExamPageFeaturesAndSecurity/hooks/useExamTimer";
import { useExamSecurity } from "../../ExamPageFeaturesAndSecurity/hooks/useExamSecurity";
import { useAutoSave } from "../../ExamPageFeaturesAndSecurity/hooks/useAutoSave";
import { useExamResume } from "../../ExamPageFeaturesAndSecurity/hooks/useExamResume";


// Components
import ExamHeader from "../../ExamPageFeaturesAndSecurity/components/ExamHeader";
import InstructionScreen from "../../ExamPageFeaturesAndSecurity/components/InstructionScreen";
import QuestionCard from "../../ExamPageFeaturesAndSecurity/components/QuestionCard";
import QuestionPalette from "../../ExamPageFeaturesAndSecurity/components/QuestionPalette";


export const GetExams = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const submittingRef = useRef(false);

    // --- Core States ---
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState({})
    const [securityWarning, setSecurityWarning] = useState({ show: false, message: "" });

    // --- Resume Strategy ---
    const { savedState, savedTime } = useExamResume(examId);
    const latestAnswersRef = useRef(answers);

    useEffect(() => {
        latestAnswersRef.current = answers;
    }, [answers]);

    const handleCloseWarning = () => {
        setSecurityWarning({ show: false, message: "" });

        // User click ke baad fullscreen request karna mandatory hai browser security ke liye
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.log("Fullscreen request denied", err);
            });
        }
    };

    // --- Fetch Initial Data ---
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await axios.get(
                    `${server_url}/api/exams/exam/${examId}`,
                    { withCredentials: true }
                );
                setExam(res.data.exam);
                setQuestions(res.data.questions);
                setUser(res.data.user);
                console.log("Fetched exam data:", res.data);
            } catch (err) {
                console.error("Failed to fetch exam:", err);

                // Backend se aane wala "Scheduled" ya "Expired" message yahan milega
                const errorMessage = err.response?.data?.message || "Something went wrong!";

                Swal.fire({
                    title: 'Access Denied',
                    text: errorMessage,
                    icon: 'warning',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'Go Back',
                    allowOutsideClick: false // Student bina button dabaye popup band na kar sake
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/userdashboard/myexams");
                    }
                });
            }
        };
        fetchExam();
    }, [examId, navigate]);

    // --- Sync Saved Progress ---
    useEffect(() => {
        // Agar questions load ho gaye hain aur local storage mein purana data hai
        // aur current answers state abhi khali hai, tabhi set karein.
        if (questions.length > 0 && savedState && Object.keys(answers).length === 0) {
            setAnswers(savedState.answers || {});
            setMarkedForReview(savedState.review || {});
            console.log("Progress Resumed!");
        }
        // Dependency array se 'answers' hata diya hai loop rokne ke liye
    }, [questions, savedState]);

    // 1. Fullscreen exit ke liye ek helper function (component ke andar ya bahar)
    const exitFull = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.error("Exit Fullscreen Error:", err));
        }
    };

    // --- Submission Logic ---
    const handleSubmit = useCallback(async () => {
        console.log("Submitted Exam Id", examId)
        console.log("Submitted Exam Answer", answers)

        if (submittingRef.current || submitted) return;
        submittingRef.current = true;

        try {
            const res = await axios.post(
                `${server_url}/api/exams/submit-exam`,
                { examId, answers: latestAnswersRef.current },
                { withCredentials: true }
            );

            // Success logic
            setSubmitted(true);
            localStorage.removeItem(`exam_${examId}`);
            localStorage.removeItem(`exam_time_${examId}`);

            exitFull();

            navigate("/userdashboard/result");

        } catch (err) {
            // console.error("Submission error:", err);
            submittingRef.current = false;

            // --- YAHAN CHANGE HAI ---
            const errorMessage = err.response?.data?.message || "Submission failed. Please check your connection.";

            // Custom SweetAlert2 Popup
            Swal.fire({
                title: 'Submission Status',
                text: errorMessage,
                icon: err.response?.status === 400 ? 'warning' : 'error', // Duplicate par Warning, server error par Error
                confirmButtonColor: '#4f46e5', // Indigo-600 (Aapke buttons ka color)
                confirmButtonText: 'Got it!',
                background: '#ffffff',
                customClass: {
                    title: 'text-gray-800 font-bold',
                    popup: 'rounded-2xl shadow-2xl border'
                }
            }).then(() => {
                // Agar pehle hi attempt kar chuke hain, toh navigate karein
                if (err.response?.status === 400 && errorMessage.toLowerCase().includes("already")) {
                    exitFull();
                    navigate("/userdashboard/myexams");
                }
            });
        }
    }, [examId, navigate, submitted]);

    // --- Hooks Integration ---

    // Timer
    // Timer calculation ko useMemo mein daalein taaki ye baar-baar recalculate na ho
    const initialTime = React.useMemo(() => {
        if (savedTime) return savedTime;
        if (exam) return parseInt(exam.duration) * 60;
        return null;
    }, [exam, savedTime]);

    const { timeLeft, setTimeLeft, formatTime } = useExamTimer(
        initialTime,
        testStarted,
        submitted,
        handleSubmit
    );

    // Jab exam data load ho jaye, tab timer state ko update karein
    useEffect(() => {
        if (initialTime !== null && timeLeft === null) {
            setTimeLeft(initialTime);
        }
    }, [initialTime, timeLeft, setTimeLeft]);


    // Security (Tab switch, Fullscreen, etc.)
    useExamSecurity(
        testStarted,
        submitted,
        () => handleSubmit(),  // Final Submission
        (msg) => setSecurityWarning({ show: true, message: msg })  // Show Notification
    );

    // AutoSave
    useAutoSave(examId, answers, markedForReview, timeLeft);

    // --- Handlers ---
    const startExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => setTestStarted(true))
                .catch(() => alert("Fullscreen is required to start the exam."));
        }
    };

    const handleAnswerChange = (qid, option) => {
        setAnswers(prev => ({ ...prev, [qid]: option }));
    };

    const toggleReview = (qid) => {
        setMarkedForReview(prev => ({ ...prev, [qid]: !prev[qid] }));
    };

    // --- Loading & Gatekeeper ---
    if (!exam || questions.length === 0) {
        return <div className="flex items-center justify-center h-screen font-bold">Loading Exam Data...</div>;
    }

    if (!testStarted) {
        return <InstructionScreen startExam={startExam} />;
    }

    const currentQ = questions[currentQuestion];

    const confirmSubmit = () => {
        Swal.fire({
            title: 'Submit Exam?',
            text: "Kya aap sure hain? Submit karne ke baad aap answers change nahi kar payenge.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5', // Indigo-600
            cancelButtonColor: '#d33',     // Red for cancel
            confirmButtonText: 'Yes, Submit it!',
            cancelButtonText: 'No, Wait',
            reverseButtons: true, // "No" ko left aur "Yes" ko right rakhne ke liye
            background: '#ffffff',
            customClass: {
                popup: 'rounded-2xl',
                title: 'font-bold text-gray-800'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Agar user ne confirm kiya tabhi submit call hoga
                handleSubmit();
            }
        });
    };

    return (
        <div className="relative min-h-screen bg-gray-50 pb-12">

            {/* Notification Overlay */}
            {securityWarning.show && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border-t-8 border-red-600 animate-bounce-short">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6 text-red-600">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase">Last Warning!</h2>
                        <p className="text-gray-700 font-bold text-lg leading-relaxed mb-8">
                            {securityWarning.message}. <br />
                            <span className="text-red-600 underline">Doobara galti karne par exam turant submit ho jayega.</span>
                        </p>
                        <button
                            onClick={handleCloseWarning}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xl shadow-2xl transition-all active:scale-95"
                        >
                            OK, I UNDERSTAND
                        </button>
                    </div>
                </div>
            )}

            {/* 1. Security Watermark */}
            <div className="exam-watermark-container">
                {Array(30).fill(null).map((_, i) => (
                    <div key={i} className="watermark-item">
                        {/* Use real user email from your global state/auth here */}
                        {user.email}
                    </div>
                ))}
            </div>

            {/* 2. Header */}
            <ExamHeader
                timeLeftDisplay={formatTime(timeLeft)}
                examName={exam.title}
                isWarning={timeLeft < 300} // 5 mins warning
            />

            <main className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 mt-4 transition-all duration-500 ${securityWarning.show ? "blur-2xl pointer-events-none" : ""}`}>

                {/* 3. Question Section */}
                <div className="lg:col-span-3">
                    <QuestionCard
                        question={currentQ}
                        questionNumber={currentQuestion + 1}
                        selectedAnswer={answers[currentQ._id]}
                        onAnswerChange={handleAnswerChange}
                        isMarked={markedForReview[currentQ._id]}
                        onToggleReview={toggleReview}
                    />

                    {/* Navigation Bar */}
                    <div className="flex justify-between mt-6 bg-white p-4 rounded-xl border shadow-sm">
                        <button
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold disabled:opacity-30 transition-all hover:bg-gray-200"
                        >
                            ← Previous
                        </button>

                        <div className="hidden md:block text-gray-500 font-medium">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>



                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={confirmSubmit}
                                className="px-8 py-2 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-700 transition-all"
                            >
                                Final Submit
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. Sidebar (Palette) */}
                <aside>
                    <QuestionPalette
                        questions={questions}
                        answers={answers}
                        review={markedForReview}
                        currentIdx={currentQuestion}
                        setIdx={setCurrentQuestion}
                    />

                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <h4 className="text-sm font-bold text-indigo-800 mb-2">Summary</h4>
                        <div className="flex justify-between text-xs text-indigo-700">
                            <span>Attempted: {Object.keys(answers).length}</span>
                            <span>Remaining: {questions.length - Object.keys(answers).length}</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};