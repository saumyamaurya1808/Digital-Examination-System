import axios from "axios";
import { server_url } from "../../App";
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LogOut, BookOpen, Trophy, Key, MessageSquare, UserCircle, Zap,
    Bell, CreditCard, ChevronRight, Clock
} from "lucide-react";
import { toast } from "react-toastify";
import { socket } from "../../socket";

export const UserDashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const response = await axios.get(`${server_url}/api/examinee/currentuser`, { withCredentials: true });
            if (response.data.success) {
                setCurrentUser(response.data.user);
            }
        } catch (error) {
            console.error("User fetch error");
        }
    };

    const menuItems = [
        { name: "My Profile", path: "/userdashboard/profile", icon: <UserCircle size={20} /> },
        { name: "My Exams", path: "/userdashboard/myexams", icon: <BookOpen size={20} /> },
        { name: "My Result", path: "/userdashboard/result", icon: <Trophy size={20} /> },
        { name: "Security", path: `/userdashboard/changepassword/${currentUser?._id}`, icon: <Key size={20} /> },
        { name: "Messages", path: "/userdashboard/message", icon: <MessageSquare size={20} /> },
    ];

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${server_url}/api/examinee/logout`, {}, { withCredentials: true });
            if (response.data.success) {
                const user = JSON.parse(localStorage.getItem("user"));

                if (user) {
                    socket.emit("student_logout", user._id);
                }
                socket.disconnect();
                localStorage.removeItem("user");
                toast.success(response.data.message || "Logged out successfully");
                navigate("/");
            }
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?._id) {
            console.log("📡 Dashboard mounted → checking socket");

            if (!socket.connected) {
                socket.connect(); // reconnect
            } else {
                // 🔥 VERY IMPORTANT (force emit)
                socket.emit("student_online", user._id);
            }
        }
    }, []);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                const user = JSON.parse(localStorage.getItem("user"));

                if (user?._id) {
                    console.log("Tab active in Dashboard");

                    if (!socket.connected) {
                        socket.connect();
                    } else {
                        socket.emit("student_online", user._id);
                    }
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    const activeLink = "flex items-center space-x-3 bg-white text-indigo-700 p-3 rounded-xl shadow-md transition-all duration-300 font-bold transform scale-[1.02]";
    const normalLink = "flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 group";

    return (
        <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">

            {/* Sidebar: Your Signature Blue Gradient */}
            <aside className="w-72 bg-gradient-to-b from-indigo-700 to-blue-800 text-white flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl z-20">

                {/* Branding with Node Icon */}
                <div className="p-8 flex items-center gap-3 border-b border-white/10">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Zap size={22} className="text-blue-300 fill-blue-300" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic">
                        Exam<span className="text-blue-300">Node</span>
                    </span>
                </div>

                {/* Profile Section (Polished) */}
                <div className="p-6 text-center bg-white/5">
                    <div className="relative inline-block group">
                        <div className="w-20 h-20 bg-indigo-900 rounded-full mx-auto mb-4 border-2 border-blue-400/50 overflow-hidden shadow-xl transition-transform group-hover:scale-105 hover:cursor-pointer"
                            onClick={() => navigate("/userdashboard")}>
                            {currentUser?.profileImage ? (
                                <img src={currentUser.profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-2xl font-bold uppercase text-white">
                                    {currentUser?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-4 right-0 w-5 h-5 bg-green-500 border-2 border-indigo-700 rounded-full"></div>
                    </div>
                    <h2 className="font-bold text-lg truncate px-2 leading-tight">{currentUser?.name || "Candidate"}</h2>
                    <p className="text-[10px] text-blue-200/60 lowercoase tracking-widest mt-1 font-bold">{currentUser?.email || "abc@example.com"}</p>
                </div>

                {/* Navigation Menu (Hidden Scrollbar) */}
                <nav className="flex-grow px-6 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
                    {menuItems.map((item, index) => (
                        <NavLink key={index} to={item.path} className={({ isActive }) => isActive ? activeLink : normalLink}>
                            <span className="group-hover:rotate-12 transition-transform">{item.icon}</span>
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Quick Stats Sidebar Footer (Extra Data) */}
                <div className="p-6 mt-auto bg-black/20 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-blue-200/50 mb-4 uppercase">
                        <span>System Status</span>
                        <span className="text-green-400">Stable</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-red-500/10 text-red-200 hover:bg-red-600 hover:text-white transition-all duration-300 font-black text-[11px] uppercase tracking-widest border border-red-500/20"
                    >
                        <LogOut size={16} />
                        <span>Terminate</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Polish Header with Notifications */}
                <header className="bg-white border-b border-gray-200 px-10 py-5 flex justify-between items-center shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-r pr-4 border-gray-200">
                            <Clock size={14} />
                            {new Date().toLocaleDateString('en-GB')}
                        </div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight italic">
                            Welcome back, <span className="text-indigo-600">{currentUser?.name?.split(' ')[0]}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Fake Notification Bell */}
                        <div className="relative cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-200"></div>
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/userdashboard/profile")}>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none capitalize">{currentUser?.name}</p>
                                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter mt-1">Student ID: #1092</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-black border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {currentUser?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto no-scrollbar p-10 bg-[#F8FAFC]">
                    <div className="max-w-6xl mx-auto">
                        {/* Breadcrumb Detail (Extra Polish) */}
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                            <span>User Dashboard</span>
                            <ChevronRight size={10} />
                            <span className="text-indigo-600">Overview</span>
                        </div>

                        {/* Yehi par saara content render hoga */}
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};