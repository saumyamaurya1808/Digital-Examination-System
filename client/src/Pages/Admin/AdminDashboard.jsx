import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { server_url } from "../../App";
import axios from "axios";
import { io } from "socket.io-client";

import {
    LayoutDashboard, Users, Calendar, BookOpen,
    HelpCircle, Settings, FileText, Lock, MessageSquare, LogOut, Zap, Activity, ShieldCheck,
    User2Icon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useServerLoad } from "../../Custom Hooks/useServerLoad";


export const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeExaminees, setActiveExaminees] = useState(0);
    const serverLoad = useServerLoad();

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const response = await axios.post(`${server_url}/api/admin/logout`, {}, { withCredentials: true });
            if (response.data.success) {
                toast.success(response.data.message || "Session Terminated");
                navigate("/adminlogin");
            }
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    // Formatted Data
    const formattedDate = currentTime.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const formattedTime = currentTime.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const menu = [
        { name: "Dashboard", path: "/adminDashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Examinee", path: "/adminDashboard/examinee", icon: <Users size={18} /> },
        { name: "Session", path: "/adminDashboard/session", icon: <Calendar size={18} /> },
        { name: "Subject", path: "/adminDashboard/subject", icon: <BookOpen size={18} /> },
        { name: "Question Bank", path: "/adminDashboard/question", icon: <HelpCircle size={18} /> },
        { name: "Manage Exams", path: "/adminDashboard/examination", icon: <Settings size={18} /> },
        { name: "Reports", path: "/adminDashboard/reportgeneration", icon: <FileText size={18} /> },
        { name: "Messages", path: "/adminDashboard/messagereply", icon: <MessageSquare size={18} /> },
        { name: "Security", path: "/adminDashboard/adminChangePassword", icon: <Lock size={18} /> },
    ];

    useEffect(() => {
        // 1. Socket Connection banayein (Backend URL ke saath)
        const socket = io("http://localhost:5000", {
            withCredentials: true
        });

        // 2. Server se aane wale count ko listen karein
        socket.on("updateActiveCount", (count) => {
            console.log("New Active Count:", count);
            setActiveExaminees(count);
        });

        // 3. Cleanup: Jab admin dashboard close kare toh socket disconnect ho jaye
        return () => {
            socket.off("updateActiveCount");
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 overflow-hidden">

            {/* Sidebar: Added 'no-scrollbar' */}
            <aside className="w-72 bg-[#020617] text-gray-300 flex flex-col shadow-2xl relative z-20">

                {/* ExamNode Logo Section */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 transition-transform group-hover:rotate-12">
                            <Zap size={22} className="text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter uppercase leading-none italic text-white">
                                Exam<span className="text-blue-500">Node</span>
                            </span>
                            <span className="text-[9px] tracking-[0.3em] font-bold text-slate-500 uppercase mt-1">Admin Terminal</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu: Added 'no-scrollbar' to allow scrolling without bars */}
                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto no-scrollbar">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Main Infrastructure</p>
                    {menu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/adminDashboard"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                            <span className="text-sm font-bold tracking-wide">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Bottom: Status & Logout */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <div className="mb-4 px-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node: Active</span>
                        </div>
                        <ShieldCheck size={14} className="text-blue-500 opacity-50" />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-widest border border-red-500/20 hover:border-transparent"
                    >
                        <LogOut size={16} />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center relative z-10 shadow-sm">

                    {/* Left Side: Page Context & Welcome */}
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase italic">
                                System <span className="text-blue-600">Console</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Infrastructure / {window.location.pathname.split("/adminDashboard").pop() || "Overview"}
                                </span>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                        {/* Live System Stats */}
                        <div className="hidden lg:flex items-center gap-8">
                            <div className="flex flex-col gap-1 w-28 px-4 border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load</span>
                                    <span className={`text-[10px] font-bold ${serverLoad > 80 ? 'text-red-500' : 'text-slate-700'}`}>
                                        {serverLoad}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-in-out ${serverLoad > 80 ? 'bg-red-500' : serverLoad > 50 ? 'bg-amber-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${serverLoad}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex flex-col border-l border-slate-200 px-6">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    Active Examinees
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Activity size={14} className="text-blue-500" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {activeExaminees.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Admin Profile & Date */}
                    <div className="flex items-center gap-5">

                        <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 group transition-all hover:bg-white hover:border-blue-200 shadow-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Calendar size={16} />
                            </div>

                            <div className="flex flex-col border-r border-slate-200 pr-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">System Date</span>
                                <span className="text-xs font-bold text-slate-700 leading-none mt-1">
                                    {formattedDate}
                                </span>
                            </div>

                            <div className="flex flex-col pl-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Live Time</span>
                                <span className="text-xs font-mono font-bold text-blue-600 leading-none mt-1">
                                    {formattedTime}
                                </span>
                            </div>
                        </div>

                        {/* Profile Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-black text-xs ring-1 ring-slate-200 overflow-hidden group">
                            {/* Yahan image ya Initial aa sakta hai */}
                            <span className="group-hover:scale-110 transition-transform"><User2Icon size={20} /></span>
                        </div>
                    </div>
                </header>

                {/* Main Viewport: Added 'no-scrollbar' so page content scrolls cleanly */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] no-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};