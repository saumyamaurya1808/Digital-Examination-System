import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Calendar, Clock, Play } from 'lucide-react'; // Icons ke liye
import { server_url } from '../../App';

export const Myexams = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const handlefetchExams = async () => {
        try {
            const res = await axios.get(
                `${server_url}/api/exams/student-exams`, { withCredentials: true }
            );
            setData(res.data.data);
            console.log("Handle fetch exams ", res.data.data)
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Timer setup: Har 60 seconds mein state update hogi
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date()); // Ye pure component ko re-render karega
        }, 1000); // 60000ms = 1 Minute

        // Clean up: Jab user page se jaye toh timer band ho jaye
        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        handlefetchExams();
    }, []);

    const getLiveStatus = (examDate, examTime, duration) => {
        const start = new Date(`${examDate}T${examTime}`);
        const now = new Date();
        const end = new Date(start.getTime() + parseInt(duration) * 60000);

        if (now < start) return { label: "Upcoming", color: "text-amber-600 bg-amber-50 border-amber-100" };
        if (now >= start && now <= end) return { label: "Live Now", color: "text-green-600 bg-green-50 border-green-100 animate-pulse" };
        return { label: "Expired", color: "text-red-600 bg-red-50 border-red-100" };
    };

    const formatTo12Hr = (timeStr) => {
        if (!timeStr) return "";
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 ko 12 bana dega
        return `${hours}:${minutes} ${ampm}`;
    };

    const formatCountdown = (milliseconds) => {
        if (milliseconds <= 0) return "00:00:00";

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return [hrs, mins, secs]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    };

    const renderActionButton = (exam) => {

        // 1. Sabse pehle attempt check
        if (exam.isAttempted) {
            return (
                <Link
                    to={`/userdashboard/result`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md m-auto"
                >
                    VIEW RESULT
                </Link>
            );
        }
        const start = new Date(`${exam.date}T${exam.time}`);
        const end = new Date(start.getTime() + parseInt(exam.duration) * 60000);
        const now = currentTime;

        // CASE 1: Upcoming (Show Countdown)
        if (now < start) {
            const diff = start - now; // Milliseconds difference
            return (
                <div className="flex flex-col items-end space-y-1">
                    <button disabled className="bg-gray-100 text-gray-400 cursor-not-allowed px-4 py-2 rounded-lg font-bold text-sm">
                        LOCKED
                    </button>
                    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Starts in: {formatCountdown(diff)}
                    </span>
                </div>
            );
        }

        // CASE 2: Live (Show Start Button)
        if (now >= start && now <= end) {
            return (
                <Link
                    to={`/getexam/${exam._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center"
                >
                    <Play size={14} className="mr-2 fill-current" />
                    START NOW
                </Link>
            );
        }

        // CASE 3: Expired
        return (
            <button disabled className="bg-red-50 text-red-300 cursor-not-allowed px-4 py-2 rounded-lg font-bold text-sm border border-red-100">
                CLOSED
            </button>
        );
    };


    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Available Examinations</h1>
                <p className="text-sm text-gray-500">Please read the instructions carefully before starting any exam.</p>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">SN.</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Exam Details</th>
                            {/* --- Naya Column Head --- */}
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Subject</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Schedule</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Duration</th>
                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((exam, i) => (
                                <tr key={exam._id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                            {exam.title}
                                        </div>
                                        <div className="text-xs text-gray-400">ID: {exam._id.slice(-6).toUpperCase()}</div>
                                    </td>

                                    {/* --- Naya Data Cell (Subject) --- */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {exam.questionDistribution && exam.questionDistribution.length > 0 ? (
                                                exam.questionDistribution.map((dist, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100"
                                                    >
                                                        <span className="uppercase">{dist.subject.name}</span>
                                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[8px]">
                                                            {dist.questionCount}Q
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">No subjects</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-2">
                                            {/* Date & Time Info */}
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm font-medium text-gray-700">
                                                    <Calendar size={14} className="mr-2 text-indigo-500" />
                                                    {exam.date}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock size={14} className="mr-2 text-indigo-400" />
                                                    {formatTo12Hr(exam.time)}
                                                </div>
                                            </div>

                                            {/* Dynamic Status Badge */}
                                            {(() => {
                                                const status = getLiveStatus(exam.date, exam.time, exam.duration);
                                                return (
                                                    <div className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${status.label === "Live Now" ? "bg-green-500" : status.label === "Upcoming" ? "bg-amber-500" : "bg-red-500"}`}></span>
                                                        {status.label}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            {exam.duration} Mins
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {renderActionButton(exam)}
                                    </td>
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                No exams found for your account.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Note */}
            <div className="mt-4 flex items-center p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                <span className="text-xs font-medium">
                    <strong>Note:</strong> Once you click "START", the timer will begin. Ensure a stable internet connection.
                </span>
            </div>
        </div>
    );
}
