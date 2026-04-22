import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { server_url } from "../../App";
import { Lock, ShieldCheck, Eye, EyeOff, KeyRound, Save } from "lucide-react";

export const AdminChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [form, setform] = useState({ op: "", np: "", cnp: "" });
    const [show, setShow] = useState({ op: false, np: false, cnp: false });

    const handleChange = (e) => setform({ ...form, [e.target.name]: e.target.value });
    const toggle = (field) => setShow({ ...show, [field]: !show[field] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.np !== form.cnp) return toast.error("New passwords do not match");
        setLoading(true);
        try {
            const response = await axios.put(`${server_url}/api/admin/changepassword`, form, { withCredentials: true });
            toast.success("Password updated");
            setform({ op: "", np: "", cnp: "" });
        } catch (er) {
            toast.error(er.response?.data?.message || "Error updating password");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-sm";

    return (
        /* H-FULL aur OVERFLOW-HIDDEN scroll rokne ke liye */
        <div className="h-full w-full flex flex-col bg-white overflow-hidden font-sans">
            
            {/* Header Section */}
            <div className="px-8 py-6 border-b border-slate-100 shrink-0">
                <h1 className="text-xl font-bold text-slate-800">Security Settings</h1>
                <p className="text-xs text-slate-500 mt-1">Manage and update your administrative access.</p>
            </div>

            {/* Scrollable Area (Only if content exceeds) */}
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Security Tip Card */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3 text-indigo-600">
                                <ShieldCheck size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Safety Protocol</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                A strong password helps prevent unauthorized access to your admin console. Use symbols like @, #, or $.
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={16} />
                                    <input type={show.op ? "text" : "password"} name="op" value={form.op} onChange={handleChange} className={inputClass} placeholder="Old password" required />
                                    <button type="button" onClick={() => toggle("op")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                                        {show.op ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={16} />
                                    <input type={show.np ? "text" : "password"} name="np" value={form.np} onChange={handleChange} className={inputClass} placeholder="New password" required />
                                    <button type="button" onClick={() => toggle("np")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                                        {show.np ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verify Password</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={16} />
                                    <input type={show.cnp ? "text" : "password"} name="cnp" value={form.cnp} onChange={handleChange} className={inputClass} placeholder="Repeat new password" required />
                                    <button type="button" onClick={() => toggle("cnp")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                                        {show.cnp ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-slate-50">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                                        loading 
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                        : "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200"
                                    }`}
                                >
                                    {loading ? "Syncing..." : "Update Vault"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};