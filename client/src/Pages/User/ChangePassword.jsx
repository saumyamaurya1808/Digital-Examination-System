import React, { useState } from 'react';
import axios from 'axios';
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { server_url } from '../../App';
import { useParams } from 'react-router-dom';

export const ChangePassword = () => {
    // Note: Ensure 'id' is defined. If using context/params, get it here.
    const { id } = useParams();

    const [form, setform] = useState({
        op: '', np: '', cnp: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        op: false, np: false, cnp: false
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value });
    };

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.np !== form.cnp) return toast.error("New passwords do not match!");

        setLoading(true);
        try {
            const res = await axios.put(`${server_url}/api/examinee/change/${id}`, form, { withCredentials: true });
            toast.success(res.data.message || "Password updated successfully!");
            setform({ op: '', np: '', cnp: '' });
        } catch (er) {
            toast.error(er.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                    {/* Left Side: Info & Header (Width increased, Height reduced) */}
                    <div className="md:w-1/3 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white flex flex-col justify-center items-center text-center relative">
                        <div className="absolute top-0 left-0 p-4 opacity-10 hidden md:block">
                            <Lock size={120} />
                        </div>
                        <div className="inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-md mb-4 ring-1 ring-white/30">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight relative z-10">Security Center</h3>
                        <p className="text-indigo-100 text-sm mt-2 relative z-10">
                            Keep your account safe by using a strong password.
                        </p>
                    </div>

                    {/* Right Side: Form (Horizontal Layout) */}
                    <div className="md:w-2/3 p-6 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Current Password - Full Width */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                                    <input
                                        type={showPasswords.op ? "text" : "password"}
                                        name="op" value={form.op} onChange={handleChange}
                                        placeholder="Enter current password"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                                        required
                                    />
                                    <button type="button" onClick={() => toggleVisibility('op')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                                        {showPasswords.op ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Passwords - Side by Side on Desktop */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                                        <input
                                            type={showPasswords.np ? "text" : "password"}
                                            name="np" value={form.np} onChange={handleChange}
                                            placeholder="New password"
                                            className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                                            required
                                        />
                                        <button type="button" onClick={() => toggleVisibility('np')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPasswords.np ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                                        <input
                                            type={showPasswords.cnp ? "text" : "password"}
                                            name="cnp" value={form.cnp} onChange={handleChange}
                                            placeholder="Confirm password"
                                            className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                                            required
                                        />
                                        <button type="button" onClick={() => toggleVisibility('cnp')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPasswords.cnp ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-4 italic">
                Changing your password will enhance your account security.
            </p>
        </div>
    );
};