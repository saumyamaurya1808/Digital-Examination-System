import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, CheckCircle, XCircle, ChevronRight, User } from 'lucide-react';
import { server_url } from '../../App';
import { Link } from 'react-router-dom';

export const Result = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handlefetch = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${server_url}/api/exams/examinee-result/`, {withCredentials: true});
            if (res.data.success) {
                console.log("Result Data:", res.data);
            }
            const resultData = res.data?.result;
            setData(Array.isArray(resultData) ? resultData : resultData ? [resultData] : []);
        } catch (err) {
            console.error(err.response?.data?.message || "Error fetching results");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlefetch();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Examination <span className="text-indigo-600">Results</span></h1>
                        <p className="text-gray-500 mt-1">Review your performance and grade history</p>
                    </div>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 px-4">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Exams</p>
                            <p className="text-lg font-bold text-gray-800">{data.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Passing</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.length > 0 ? data.map((item, i) => (
                                    <tr key={item?._id || i} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                                                    {item?.examId?.title?.charAt(0) || "E"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{item?.examId?.title || "N/A"}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <User size={12} /> {item?.examineeId?.name || "Student"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-block px-3 py-1 bg-indigo-50 rounded-full">
                                                <span className="text-indigo-700 font-bold">{item?.score}</span>
                                                <span className="text-indigo-300 mx-1">/</span>
                                                <span className="text-indigo-400 text-sm">{item?.totalMarks}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-medium text-gray-600">
                                            {item?.passingMarks}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {item?.status === "Pass" || item?.status === "Passed" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide">
                                                    <CheckCircle size={14} /> Passed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide">
                                                    <XCircle size={14} /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                to={`/result-details/${item._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-300 hover:text-indigo-600 transition-colors inline-flex items-center"
                                            >
                                                <ChevronRight size={20} />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                    <Trophy size={48} className="text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No result data available yet.</p>
                                                <p className="text-gray-400 text-sm">Once you complete an exam, your scores will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Help */}
                <p className="mt-8 text-center text-gray-400 text-sm italic">
                    If you notice any discrepancy in your marks, please contact the administration department.
                </p>
            </div>
        </div>
    );
};
