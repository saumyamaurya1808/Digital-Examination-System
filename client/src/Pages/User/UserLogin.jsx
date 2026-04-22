import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { server_url } from '../../App';
import { toast } from 'react-toastify';
import { Lock, Mail, ShieldCheck, X, ArrowLeft, Loader2, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { socket } from '../../socket';
import { useEffect } from 'react';

export const UserLogin = () => {
    // --- States ---
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password States
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const navigate = useNavigate();

    // --- Handlers ---
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const closeModal = () => {
        setShowModal(false);
        setStep(1);
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (!forgotEmail) return toast.error("Please enter your email");
        setOtpLoading(true);
        try {
            const res = await axios.post(`${server_url}/api/examinee/forgot-password`, { email: forgotEmail });
            toast.success(res.data.message || "OTP sent successfully");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) return toast.error("Please enter OTP");
        setOtpLoading(true);
        try {
            const res = await axios.post(`${server_url}/api/examinee/verify-otp`, { email: forgotEmail, otp });
            toast.success(res.data.message || "OTP Verified");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
        setOtpLoading(true);
        try {
            const res = await axios.post(`${server_url}/api/examinee/reset-password`, {
                email: forgotEmail,
                password: newPassword,
                confirmPassword
            });
            toast.success(res.data.message || "Password updated successfully");
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${server_url}/api/examinee/login`, form, { withCredentials: true });
            if (res.data.success) {
                const user = res.data.user;
                console.log("User ", user)
                localStorage.setItem("user", JSON.stringify(user));
                // connect once
                if (!socket.connected) {
                    socket.connect();
                }
                toast.success(res.data.message || "Login successful");
                navigate("/userdashboard");

            }
        } catch (er) {
            toast.error(er.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-white max-h-[90vh]">

                {/* Left Side: Branding Section */}
                <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Student Portal</h1>
                        <p className="mt-4 text-blue-100/80 leading-relaxed text-sm">Log in to access your exams, track your progress, and manage your profile.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <div className="bg-blue-500/20 p-2 rounded-lg"><ShieldCheck size={20} className="text-blue-300" /></div>
                            <span className="text-sm font-medium">Secure Authentication</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <div className="bg-blue-500/20 p-2 rounded-lg"><CheckCircle2 size={20} className="text-blue-300" /></div>
                            <span className="text-sm font-medium">Real-time Feedback</span>
                        </div>
                    </div>

                    <p className="text-xs text-blue-200/50">© 2026 Examination System. All rights reserved.</p>
                </div>

                {/* Right Side: Login Form */}
                <div className="lg:col-span-7 p-8 md:p-12 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                        <header className="mb-10 text-center lg:text-left">
                            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email" name="email" value={form.email} onChange={handleChange} required
                                        placeholder="name@example.com"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                    <button type="button" onClick={() => setShowModal(true)} className="text-xs font-bold text-blue-600 hover:underline">Forgot?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                New here? <Link to="/userregister" className="text-blue-600 font-bold hover:underline">Create an account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Re-styled Forgot Password Modal --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />

                    <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button onClick={closeModal} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>

                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                {step === 1 && <Mail size={24} />}
                                {step === 2 && <ShieldCheck size={24} />}
                                {step === 3 && <Lock size={24} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {step === 1 ? "Reset Password" : step === 2 ? "Verify identity" : "New Password"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2 px-4">
                                {step === 1 ? "Enter your email and we'll send an OTP." : step === 2 ? `Enter the code sent to ${forgotEmail}` : "Almost done! Set your new password."}
                            </p>
                        </div>

                        {/* Modal Step Content (Keeping your logic same but with new styling) */}
                        <div className="space-y-4">
                            {step === 1 && (
                                <>
                                    <input type="email" placeholder="Email Address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                                    <button onClick={handleSendOtp} disabled={otpLoading} className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 flex justify-center items-center shadow-lg shadow-blue-100">
                                        {otpLoading ? <Loader2 className="animate-spin" size={18} /> : "Get Reset Code"}
                                    </button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center text-xl tracking-[0.3em] font-black rounded-xl border border-gray-200 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                                    <button onClick={handleVerifyOtp} disabled={otpLoading} className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 flex justify-center items-center shadow-lg shadow-blue-100">
                                        {otpLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Code"}
                                    </button>
                                    <button onClick={() => setStep(1)} className="w-full text-xs text-gray-400 font-medium hover:text-blue-600 flex items-center justify-center gap-1"><ArrowLeft size={14} /> Use different email</button>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                                    <button onClick={handleResetPassword} disabled={otpLoading} className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-100">
                                        {otpLoading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};