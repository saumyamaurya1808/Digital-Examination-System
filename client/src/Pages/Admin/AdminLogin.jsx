import axios from 'axios';
import { useState, useEffect } from 'react';
import { server_url } from '../../App';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, CheckCircle2, LayoutDashboard, Users, FileSpreadsheet, Zap, Activity } from 'lucide-react';

export const AdminLogin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Browser tab title update
    useEffect(() => {
        document.title = "ExamNode | Secure Admin Access";
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${server_url}/api/admin/login`, form, { withCredentials: true });
            if (res.data.success) {
                toast.success("Authentication Successful");
                navigate("/admindashboard");
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error) {
            toast.error('Login failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans selection:bg-blue-100">
            
            {/* Left Side: Professional ExamNode Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#020617] flex-col justify-between p-16 text-white relative overflow-hidden">
                {/* Visual Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[140px] opacity-20"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="relative z-10">
                    {/* Updated Logo Section */}
                    <div className="flex items-center gap-4 mb-16 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 ring-4 ring-white/5 transition-transform group-hover:scale-110">
                            <Zap size={30} className="text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter uppercase leading-none italic">
                                Exam<span className="text-blue-500">Node</span>
                            </span>
                            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-500 uppercase mt-1">Intelligence Terminal</span>
                        </div>
                    </div>

                    <h2 className="text-6xl font-black leading-[1] mb-10 tracking-tighter">
                        Manage <br /> 
                        <span className="text-blue-500">The Infrastructure</span> <br />
                        Of Learning.
                    </h2>

                    {/* Features List */}
                    <div className="space-y-8 mt-12 max-w-md">
                        <div className="flex items-start gap-4 group">
                            <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-blue-500 transition-all">
                                <LayoutDashboard size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white">Centralized Orchestration</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">Real-time exam deployment and automated paper generation nodes.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-blue-500 transition-all">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white">Advanced Proctoring</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">Secure candidate monitoring with high-integrity data protocols.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status Footer */}
                <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-8">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">
                            <Activity size={14} className="text-blue-500" />
                            System: Operational
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-green-500 tracking-widest uppercase animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Encrypted SSL Access
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="w-full max-w-[440px] bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Admin Sign-In</h2>
                        <p className="text-slate-500 font-medium italic">Verify your network identity.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Node Identity (Email)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@examnode.io"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Security Cipher (Password)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#020617] hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 mt-4 tracking-widest text-sm uppercase"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={22} />
                            ) : (
                                "INITIALIZE AUTHENTICATION"
                            )}
                        </button>

                        {/* Register Link */}
                        <div className="text-center pt-8 border-t border-slate-50 mt-8">
                            <p className="text-sm text-slate-500 font-bold">
                                New Administrator?{" "}
                                <Link
                                    to="/adminregister"
                                    className="text-blue-600 hover:text-blue-800 underline underline-offset-8 decoration-2 ml-1 transition-all"
                                >
                                    Request Access
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};