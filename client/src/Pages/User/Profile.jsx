import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server_url } from '../../App';
import { User, Mail, Phone, GraduationCap, School, MapPin, Save, Edit2, Calendar, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // ✅ Missing Import Added

export const Profile = () => {
    const [user, setUser] = useState({
        name: '', email: '', phone: '', college: '', course: '', branch: '', session: '', year: '', status: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [allSessions, setAllSessions] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableBranches, setAvailableBranches] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, sessionRes] = await Promise.all([
                    axios.get(`${server_url}/api/examinee/currentuser`, { withCredentials: true }),
                    axios.get(`${server_url}/api/session`)
                ]);

                if (userRes.data.success) {
                    const userData = userRes.data.user;
                    setUser(userData);

                    console.log("User data in profile ", userData) // Check the user data

                    if (sessionRes.data.result) {
                        const sessions = sessionRes.data.result;
                        setAllSessions(sessions);

                        // Initial dropdown population logic
                        const courses = [...new Set(sessions.filter(s => s.name === userData.session).map(s => s.course))];
                        setAvailableCourses(courses);
                        const branches = [...new Set(sessions.filter(s => s.name === userData.session && s.course === userData.course).map(s => s.branch))];
                        setAvailableBranches(branches);
                        const years = [...new Set(sessions.filter(s => s.name === userData.session && s.course === userData.course && s.branch === userData.branch).map(s => s.year))];
                        setAvailableYears(years);
                    }
                }
            } catch (err) {
                toast.error("Failed to load data");
            }
        };
        fetchData();
    }, []);

    // ✅ New: Image Change Handler (Preview ke liye)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file)); // Local preview dikhane ke liye
        }
    };

    const handleSessionChange = (e) => {
        const sessionName = e.target.value;
        const filtered = allSessions.filter(s => s.name === sessionName);
        setAvailableCourses([...new Set(filtered.map(s => s.course))]);
        setAvailableBranches([]);
        setAvailableYears([]);
        setUser({ ...user, session: sessionName, course: '', branch: '', year: '' });
    };

    const handleCourseChange = (e) => {
        const courseName = e.target.value;
        const filtered = allSessions.filter(s => s.name === user.session && s.course === courseName);
        setAvailableBranches([...new Set(filtered.map(s => s.branch))]);
        setAvailableYears([]);
        setUser({ ...user, course: courseName, branch: '', year: '' });
    };

    const handleBranchChange = (e) => {
        const branchName = e.target.value;
        const filtered = allSessions.filter(s => s.name === user.session && s.course === user.course && s.branch === branchName);
        const years = [...new Set(filtered.map(s => s.year))];
        setAvailableYears(years);
        setUser({ ...user, branch: branchName, year: years.length === 1 ? years[0] : '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            // User object se wahi keys bhejein jo update karni hain
            const { profileImage, profileImagePublicId, ...textData } = user;
            Object.keys(textData).forEach(key => {
                formData.append(key, textData[key]);
            });

            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }

            const res = await axios.put(`${server_url}/api/examinee/${user._id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success("Profile updated!");
                setUser(res.data.user);
                setIsEditing(false);
                setSelectedImage(null);
                setPreviewUrl(""); // Preview clear karein success ke baad
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally { setLoading(false); }
    };

    const handleDeleteImage = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Remove your profile picture?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const res = await axios.delete(`${server_url}/api/examinee/delete-image/${user._id}`, { withCredentials: true });
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Image removed.', 'success');
                    setUser({ ...user, profileImage: null, profileImagePublicId: null });
                    setPreviewUrl("");
                    setSelectedImage(null);
                }
            } catch (err) {
                toast.error("Failed to remove image");
            } finally { setLoading(false); }
        }
    };

    

    return (
        <div className="w-full max-w-5xl mx-auto p-2 md:p-6">
            <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="h-24 md:h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                <div className="px-4 md:px-12 pb-8 md:pb-12">
                    <div className="relative -mt-10 md:-mt-12 mb-8 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                        <div className="relative group">
                            {/* Hidden Input */}
                            <input
                                type="file"
                                id="imageInput"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            <div
                                className={`w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-1 shadow-xl overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                                onClick={() => isEditing && document.getElementById('imageInput').click()}
                            >
                                {previewUrl || user.profileImage ? (
                                    <img src={previewUrl || user.profileImage} className="w-full h-full object-cover rounded-xl" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {isEditing && (user.profileImage || previewUrl) && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 border-2 border-white z-20"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{user.name}</h1>
                            <p className="text-indigo-600 text-sm md:text-base font-bold flex items-center justify-center md:justify-start gap-1.5">
                                <GraduationCap size={16} /> {user.course || 'N/A'} <span className="hidden sm:inline">in</span> {user.branch || 'N/A'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(!isEditing);
                                setPreviewUrl(""); // Cancel par preview clear
                                setSelectedImage(null);
                            }}
                            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-sm md:text-base ${isEditing ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'}`}
                        >
                            {isEditing ? 'Cancel' : <><Edit2 size={16} /> Edit Details</>}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Personal Info */}
                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-50 pb-2">Personal Information</h3>

                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><User size={18} /></div>
                                    <input disabled={!isEditing} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></div>
                                    <input disabled={true} className="w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-500 text-sm md:text-base font-semibold" value={user.email} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><Phone size={18} /></div>
                                    <input disabled={!isEditing} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Academic Details */}
                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-xs md:text-sm font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-50 pb-2">Academic Details</h3>

                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">College/University</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><School size={18} /></div>
                                    <input disabled={!isEditing} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.college} onChange={(e) => setUser({ ...user, college: e.target.value })} />
                                </div>
                            </div>

                            {/* Session */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Academic Session</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><Calendar size={18} /></div>
                                    <select disabled={!isEditing} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold appearance-none ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.session} onChange={handleSessionChange}>
                                        <option value="">Select Session</option>
                                        {[...new Set(allSessions.map(s => s.name))].map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Course */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Course</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><GraduationCap size={18} /></div>
                                    <select disabled={!isEditing || !user.session} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold appearance-none ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.course} onChange={handleCourseChange}>
                                        <option value="">Select Course</option>
                                        {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Branch</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><MapPin size={18} /></div>
                                    <select disabled={!isEditing || !user.course} className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold appearance-none ${isEditing ? 'border-indigo-50 focus:border-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-500'}`} value={user.branch} onChange={handleBranchChange}>
                                        <option value="">Select Branch</option>
                                        {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Year - Now a Dropdown and Editable */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Current Year</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <BookOpen size={18} />
                                    </div>

                                    <select
                                        disabled={!isEditing || !user.branch}
                                        className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border-2 transition-all outline-none text-sm md:text-base font-semibold appearance-none ${isEditing
                                                ? 'border-indigo-50 focus:border-indigo-500 bg-white'
                                                : 'border-transparent bg-gray-50 text-gray-500'
                                            }`}
                                        value={user.year || ""}
                                        onChange={(e) => setUser({ ...user, year: e.target.value })}
                                    >
                                        <option value="">Select Year</option>
                                        {availableYears.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="md:col-span-2 mt-4">
                                <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                                    {loading ? 'Saving...' : <><Save size={20} /> Update Profile</>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};