import axios from "axios";
import React, { useEffect, useState } from "react";
import { server_url } from "../../App";
import { motion } from "framer-motion";
import {
    BookOpen,
    Users,
    HelpCircle,
    Layers
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from "recharts";

export const AdminDashboardHome = () => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleFetch = async () => {
        try {
            const res = await axios.get(`${server_url}/api/admindashboard/`, {
                withCredentials: true
            });

            const { success, data } = res.data;

            if (!success) {
                console.error("Failed to fetch dashboard data");
                return;
            }

            console.log(data);
            setData(data);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetch();
    }, []);

    //  Bar Chart Data
    const chartData = [
        { name: "Exams", value: data?.totalExams || 0 },
        { name: "Students", value: data?.totalExaminees || 0 },
        { name: "Questions", value: data?.totalQuestions || 0 },
        { name: "Subjects", value: data?.totalSubjects || 0 },
    ];

    //  Pie Chart Data (Pass/Fail)
    const pieData = [
        { name: "Passed", value: data?.totalPassesd || 0 },
        { name: "Failed", value: data?.totalFailed || 0 }
    ];

    const pieColors = ["#22c55e", "#ef4444"];

    // 🔥 Card Component
    const Card = ({ title, value, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white shadow-md rounded-xl p-6 border flex items-center justify-between"
        >
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h2 className={`text-3xl font-bold mt-2 ${color}`}>
                    {value}
                </h2>
            </div>
            <Icon className="w-10 h-10 text-gray-400" />
        </motion.div>
    );

    // 🔥 Skeleton Loader
    const SkeletonCard = () => (
        <div className="bg-white p-6 rounded-xl shadow-md border animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500">
                    Overview of your examination system
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <Card title="Total Exams" value={data.totalExams} icon={BookOpen} color="text-blue-600" />
                        <Card title="Total Students" value={data.totalExaminees} icon={Users} color="text-green-600" />
                        <Card title="Total Questions" value={data.totalQuestions} icon={HelpCircle} color="text-purple-600" />
                        <Card title="Total Subjects" value={data.totalSubjects} icon={Layers} color="text-orange-600" />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

                {/* 🔥 Gradient Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white p-6 rounded-xl shadow-md border"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        System Overview
                    </h3>

                    {loading ? (
                        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>

                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />

                                <Bar
                                    dataKey="value"
                                    fill="url(#colorGradient)"
                                    radius={[10, 10, 0, 0]}
                                    isAnimationActive={true}
                                    animationDuration={1200}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* 🔥 Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-md border"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        Pass vs Fail
                    </h3>

                    {loading ? (
                        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={100}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={pieColors[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <hr />
                    <p>Total Exam Attemped : {data?.totalExamAttempted}</p>
                </motion.div>

            </div>

        </div>
    );
};