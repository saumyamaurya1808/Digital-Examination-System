import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { server_url } from "../../App";
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Loader2, Zap, FileSpreadsheet, Activity } from 'lucide-react';

export const AdminRegister = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "ExamNode | Initialize Administrator";
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
        setLoading(true);
        try {
            const res = await axios.post(server_url + "/api/admin/register", form, { withCredentials: true });
            if (!res.data.success) return toast.error(res.data.message || "Initialization failed");
            toast.success("Administrator Node Initialized Successfully");
            navigate("/admindashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans selection:bg-blue-100">
            {/* Left Side: Enterprise Node Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#020617] flex-col justify-between p-16 text-white relative overflow-hidden">
                {/* Visual Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[140px] opacity-20"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-20 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 ring-4 ring-white/5">
                            <Zap size={30} className="text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter uppercase leading-none italic">
                                Exam<span className="text-blue-500">Node</span>
                            </span>
                            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-500 uppercase mt-1">Admin Configuration</span>
                        </div>
                    </div>

                    <h2 className="text-6xl font-black leading-[0.9] mb-10 tracking-tighter">
                        New <br /><span className="text-blue-500">Admin Node.</span>
                    </h2>
                    
                    <div className="space-y-8 mt-16 max-w-sm">
                        <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-[24px] hover:border-blue-500/50 transition-all group">
                            <div className="mt-1 p-2 bg-slate-900 rounded-lg"><FileSpreadsheet size={20} className="text-blue-400" /></div>
                            <div>
                                <h4 className="font-bold text-slate-100">Direct Infrastructure</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">Automated result publishing and real-time student data synchronization.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-[24px] hover:border-blue-500/50 transition-all">
                            <div className="mt-1 p-2 bg-slate-900 rounded-lg"><ShieldCheck size={20} className="text-blue-400" /></div>
                            <div>
                                <h4 className="font-bold text-slate-100">Secure Protocol</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">End-to-end encrypted sessions for exam integrity and fraud prevention.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-10">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">
                        <Activity size={14} className="text-blue-500" />
                        System: Setup Mode
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black uppercase tracking-widest animate-pulse">
                        <ShieldCheck size={12} /> Live Integrity Check
                    </div>
                </div>
            </div>

            {/* Right Side: Professional Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#fcfcfd]">
                <div className="w-full max-w-[480px] bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Register Node</h2>
                        <p className="text-slate-500 font-medium italic">Setup your enterprise administrator profile.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Admin Name */}
                        <div className="space-y-1.5 group">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Authority Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" name="name" placeholder="Full Professional Name" 
                                    value={form.name} onChange={handleChange} required 
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium" 
                                />
                            </div>
                        </div>

                        {/* Corporate Email */}
                        <div className="space-y-1.5 group">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email Identity</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" name="email" placeholder="admin@examnode.io" 
                                    value={form.email} onChange={handleChange} required 
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium" 
                                />
                            </div>
                        </div>

                        {/* Keys Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pass-Key</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} name="password" value={form.password} 
                                        onChange={handleChange} placeholder="••••••••" required 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium" 
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Key</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} 
                                        onChange={handleChange} placeholder="••••••••" required 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium" 
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button 
                            type="submit" disabled={loading} 
                            className="w-full bg-[#020617] hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 mt-6 tracking-[0.1em] text-sm uppercase"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "INITIALIZE ADMIN ACCESS"}
                        </button>

                        <div className="text-center pt-6 border-t border-slate-50 mt-6">
                            <p className="text-sm text-slate-500 font-bold">
                                Node already active? <Link to="/adminlogin" className="text-blue-600 hover:text-blue-800 underline underline-offset-8 decoration-2 ml-1">Secure Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};