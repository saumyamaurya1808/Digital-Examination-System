import { useState, useEffect } from "react";
import axios from "axios";
import { server_url } from "../../App";
import { toast } from "react-toastify";
import { confirmDelete } from "../../Components/confirmDelete";

export const Examination = () => {

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        duration: "",
        totalMarks: "",
        passingMarks: "",
        sessionId: "",
        status: "Scheduled",
        questionDistribution: [{ subject: "", questionCount: "" }]
    });

    // --- Cascading States ---
    const [selectedSessionName, setSelectedSessionName] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");

    const [subjects, setSubjects] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [subjectQuestions, setSubjectQuestions] = useState({});
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [overLimitIndexes, setOverLimitIndexes] = useState([]);

    const [filteredExam, setFilteredExam] = useState([]);
    const [search, setSearch] = useState("");
    const [filterCourse, setFilterCourse] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterSession, setFilterSession] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [isGrouped, setIsGrouped] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {

            const [subjectRes, sessionRes] = await Promise.all([
                axios.get(`${server_url}/api/subject`),
                axios.get(`${server_url}/api/session`),
            ]);

            setSubjects(subjectRes.data || []);
            setSessions(sessionRes.data.result || []);

        } catch (err) {

            console.log(err);
            setError("Failed to load data");
        }
    };

    const fetchFilteredExams = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${server_url}/api/exams/getfilteredexams`,
                {
                    params: {
                        course: filterCourse,
                        branch: filterBranch,
                        session: filterSession,
                        year: filterYear,
                        search: search,
                        group: isGrouped
                    }
                }
            );
            console.log("filtered Data: ", res.data.data)
            setFilteredExam(res.data.data);
        } catch (error) {
            console.log("Filter error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchFilteredExams();
        }, 500);
        return () => clearTimeout(delay);
    }, [search, filterCourse, filterBranch, filterSession, filterYear, isGrouped]);


    // ====CASCADING LOGIC (The Core Logic)====
    const uniqueSessionNames = [...new Set(sessions.map(s => s.name))];

    const availableCourses = [...new Set(sessions
        .filter(s => s.name === selectedSessionName)
        .map(s => s.course))];

    const availableBranches = [...new Set(sessions
        .filter(s => s.name === selectedSessionName && s.course === selectedCourse)
        .map(s => s.branch))];

    const availableYears = sessions
        .filter(s => s.name === selectedSessionName &&
            s.course === selectedCourse &&
            s.branch === selectedBranch);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuestionDistChange = async (index, e) => {
        const updated = [...formData.questionDistribution];
        updated[index][e.target.name] = e.target.value;

        setFormData({
            ...formData,
            questionDistribution: updated
        });

        const newOverLimit = [];

        updated.forEach((q, i) => {
            const available =
                subjectQuestions[q.subject]?.totalQuestions || 0;

            if (parseInt(q.questionCount || 0) > available) {
                newOverLimit.push(i);
            }
        });

        setOverLimitIndexes(newOverLimit);

        if (e.target.name === "subject") {
            const subjectId = e.target.value;
            if (subjectQuestions[subjectId]) return;
            try {
                const res = await axios.get(
                    `${server_url}/api/subject/specificsubject/${subjectId}`
                );
                setSubjectQuestions(prev => ({
                    ...prev,
                    [subjectId]: res.data
                }));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const addDistributionField = () => {
        setFormData({
            ...formData,
            questionDistribution: [
                ...formData.questionDistribution,
                { subject: "", questionCount: "" }
            ]
        });

    };

    const removeDistributionField = (index) => {
        if (formData.questionDistribution.length === 1) {
            setError("At least one subject required");
            return;
        }
        const updated = [...formData.questionDistribution];
        updated.splice(index, 1);
        setFormData({
            ...formData,
            questionDistribution: updated
        });
        const newOverLimit = overLimitIndexes.filter(i => i !== index);
        setOverLimitIndexes(newOverLimit);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.sessionId) {
            return setError("Please select a session");
        }

        for (let q of formData.questionDistribution) {

            if (!q.subject || !q.questionCount) {
                return setError("Please fill subject and question count");
            }

        }

        if (overLimitIndexes.length > 0) {
            return setError("Question count exceeds available questions");
        }

        const payload = {
            ...formData,
            totalMarks: Number(formData.totalMarks),
            passingMarks: Number(formData.passingMarks),
            questionDistribution: formData.questionDistribution.map(q => ({
                subject: q.subject,
                questionCount: Number(q.questionCount)
            }))
        };

        // console.log("PayLoad ", payload)

        try {
            if (isEditing) {
                await axios.put(
                    `${server_url}/api/exams/${editingExamId}`,
                    payload,
                    { withCredentials: true }
                );
                toast.success("Exam Updated");
            } else {
                await axios.post(
                    `${server_url}/api/exams`,
                    payload,
                    { withCredentials: true }
                );
                toast.success("Exam Created");
            }

            setFormData({
                title: "",
                date: "",
                time: "",
                duration: "",
                totalMarks: "",
                passingMarks: "",
                sessionId: "",
                status: "Scheduled",
                questionDistribution: [{ subject: "", questionCount: "" }]
            });

            setSelectedSessionName("");
            setSelectedCourse("");
            setSelectedBranch("");



            setIsEditing(false);
            setEditingExamId(null);
            setOverLimitIndexes([]);

            fetchData();
            fetchFilteredExams();

        } catch (err) {
            console.log(err.response?.data || err);
            setError(
                err.response?.data?.message ||
                "Error submitting form"
            );
        }
    };

    const handleDelete = async (id) => {
        const confirm = await confirmDelete();
        if (!confirm) return;
        try {
            await axios.delete(
                `${server_url}/api/exams/${id}`,
                { withCredentials: true }
            );
            toast.success("Exam Deleted");
            fetchData();
            fetchFilteredExams();
        } catch (error) {
            console.error("Delete Exam Error:", error);
            toast.error("Error deleting exam");
        }
    };

    const handleEdit = (exam) => {
        const session = exam.sessionData;

        setSelectedSessionName(session?.name || "");
        setSelectedCourse(session?.course || "");
        setSelectedBranch(session?.branch || "");

        setFormData({
            title: exam.title,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            date: exam.date,
            time: exam.time,
            duration: exam.duration,
            sessionId: exam.sessionData?._id || exam.sessionData,
            status: exam.status,
            questionDistribution: exam?.questionDistribution?.map(q => ({
                subject: q.subject?._id || q.subject,
                questionCount: q.questionCount
            }))
        });

        setEditingExamId(exam._id);
        setIsEditing(true);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // cancel edit
    const handleCancel = () => {

        setSelectedSessionName("");
        setSelectedCourse("");
        setSelectedBranch("");

        setFormData({
            title: "",
            date: "",
            time: "",
            duration: "",
            totalMarks: "",
            passingMarks: "",
            sessionId: "",
            status: "Scheduled",
            questionDistribution: [{ subject: "", questionCount: "" }]
        });
        setIsEditing(false);
        setEditingExamId(null);
        setOverLimitIndexes([]);
        setError(""); // Purane errors bhi clear ho jayenge
    };

    const isSubmitDisabled = overLimitIndexes.length > 0;

    return (
        <div className="p-6 space-y-6 bg-slate-50">

            {/* FORM SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isEditing ? "Edit Examination" : "Create New Examination"}
                    </h2>
                    <p className="text-slate-500 text-sm">Fill in the details to schedule a new exam session.</p>
                </div>

                {error && <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Basic Info */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Title</label>
                            <input type="text" name="title" placeholder="e.g. PUT/Semster/Sessional" value={formData.title} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Marks</label>
                            <input type="number" name="totalMarks" placeholder="100" value={formData.totalMarks} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passing Marks</label>
                            <input type="number" name="passingMarks" placeholder="33" value={formData.passingMarks} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                    </div>

                    {/* Row 2: Date & Time */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (Min)</label>
                            <input type="number" name="duration" placeholder="120" value={formData.duration} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Draft">Draft</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>


                    {/* Row 3: Cascading Session Selectors */}
                    <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-4">
                        <label className="text-xs font-black text-purple-400 uppercase tracking-[2px]">Academic Target (Cascading Selection)</label>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">1. Session</label>
                                <select value={selectedSessionName} onChange={(e) => { setSelectedSessionName(e.target.value); setSelectedCourse(""); setSelectedBranch(""); }} className="w-full border border-slate-200 p-2 rounded-lg bg-white text-sm">
                                    <option value="">Select Session</option>
                                    {uniqueSessionNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">2. Course</label>
                                <select disabled={!selectedSessionName} value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBranch(""); }} className="w-full border border-slate-200 p-2 rounded-lg bg-white text-sm">
                                    <option value="">Select Course</option>
                                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">3. Branch</label>
                                <select disabled={!selectedCourse} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg bg-white text-sm">
                                    <option value="">Select Branch</option>
                                    {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">4. Year</label>
                                <select name="sessionId" disabled={!selectedBranch} value={formData.sessionId} onChange={handleChange} className="w-full border-2 border-purple-200 p-2 rounded-lg bg-white text-sm">
                                    <option value="">Select Year</option>
                                    {availableYears.map(s => <option key={s._id} value={s._id}>{s.year} Year</option>)}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* Question Distribution */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Question Distribution</h3>
                            <button type="button" onClick={addDistributionField} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition-colors uppercase">+ Add Subject</button>
                        </div>

                        {formData.questionDistribution.map((item, index) => {
                            const available = subjectQuestions[item.subject]?.totalQuestions || 0;
                            const isOver = overLimitIndexes.includes(index);
                            return (
                                <div key={index} className="grid md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Select Subject</label>
                                        <select name="subject" value={item.subject} onChange={(e) => handleQuestionDistChange(index, e)} className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white">
                                            <option value="">Choose...</option>
                                            {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">No. of Questions (Max: {available})</label>
                                        <input type="number" name="questionCount" value={item.questionCount} onChange={(e) => handleQuestionDistChange(index, e)} className={`w-full border p-2 rounded-lg text-sm ${isOver ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 bg-white"}`} />
                                    </div>
                                    <button type="button" onClick={() => removeDistributionField(index)} className="bg-white border border-red-100 text-red-500 text-xs font-bold py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">Remove</button>
                                </div>
                            );
                        })}
                    </div>


                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={isSubmitDisabled} className={`flex-1 py-3.5 rounded-2xl text-white font-bold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${isSubmitDisabled ? "bg-slate-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-purple-200"}`}>
                            {isEditing ? "Update Examination" : "Create Examination"}
                        </button>
                        {isEditing && <button type="button" onClick={handleCancel} className="px-10 py-3.5 rounded-2xl bg-slate-100 text-slate-500 font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>}
                    </div>
                </form>
            </div>



            {/* exams list in layout card */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Examination List</h2>
                        <p className="text-sm text-slate-500 font-medium">Manage and monitor all scheduled exams</p>
                    </div>
                    <div className="text-sm font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 shadow-sm">
                        {filteredExam.length} Total Exams
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">

                    {/* SEARCH */}
                    <input
                        type="text"
                        placeholder="Search exam..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-slate-200 px-3 py-2 rounded-lg text-sm"
                    />

                    {/* SESSION */}
                    <select
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                        className="border border-slate-200 px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">All Sessions</option>
                        {[...new Set(sessions.map(s => s.name))].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* COURSE */}
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="border border-slate-200 px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">All Courses</option>
                        {[...new Set(sessions.map(s => s.course))].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* BRANCH */}
                    <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="border border-slate-200 px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">All Branch</option>
                        {[...new Set(sessions.map(s => s.branch))].map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    {/* YEAR */}
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="border border-slate-200 px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">All Years</option>
                        {[...new Set(sessions.map(s => s.year))].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* GROUP BUTTON */}
                    <button
                        onClick={() => {
                            setIsGrouped(!isGrouped);
                            setFilteredExam([]);   // reset old structure; there was 
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        {isGrouped ? "Ungroup" : "Group"}
                    </button>
                </div>

                {/* ================= LOADING ================= */}
                {loading && (
                    <div className="bg-white shadow rounded p-10 text-center">
                        <div className="flex flex-col items-center gap-3">

                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>

                            <p className="text-gray-600 text-sm">
                                Loading Exams data...
                            </p>

                        </div>
                    </div>
                )}


                {!loading && !isGrouped && (
                    <>
                        {filteredExam.length === 0 ? (
                            <div className="bg-white shadow-sm rounded-2xl p-10 text-center border border-slate-200">
                                <p className="text-slate-500 font-medium italic">No Exam Found</p>
                            </div>
                        ) :
                            (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredExam?.map((exam, index) => (
                                    <div key={exam._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative group">

                                        {/* Year Badge (Floating Style) */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="flex flex-col">
                                                <span className="bg-white/90 backdrop-blur-sm border border-purple-100 text-purple-600 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider m-auto">
                                                    {exam.sessionData?.year || "N/A"}
                                                </span>
                                                <p className="bg-white/90 backdrop-blur-sm border border-purple-100 text-purple-600 px-2.5 py-1 rounded-lg text-[12px] font-bold shadow-sm uppercase tracking-wider mt-1">
                                                    {exam.sessionData?.name || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Header Section */}
                                        <div className="p-5 border-b border-slate-50 bg-gradient-to-br from-purple-50/30 to-white">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-[2px]">Exam Record 👉#{index + 1}</span>
                                                <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-purple-700 transition-colors uppercase">
                                                    {exam.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Main Body */}
                                        <div className="p-5 space-y-5 flex-grow">
                                            {/* Status & Timing */}
                                            <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Schedule</p>
                                                    <p className="text-sm text-slate-700 font-semibold">{exam.date}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{exam.time} • {exam.duration} Min</p>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${exam.status === 'Scheduled' ? 'bg-indigo-500 text-white' :
                                                    exam.status === 'Closed' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                                                    }`}>
                                                    {exam.status}
                                                </div>
                                            </div>

                                            {/* Academic Information */}
                                            <div className="space-y-2.5 px-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-[1.5px] w-3 bg-purple-200"></div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Academic Context</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2 py-0.5 rounded">
                                                            {exam.sessionData?.course}
                                                        </span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-slate-600 font-medium text-xs italic">
                                                            {exam.sessionData?.branch}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- Subjects Section --- */}
                                            <div className="space-y-2 px-1">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Subjects Included</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {exam?.questionDistribution.map((dist, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-2 py-1 rounded-md">
                                                            <span className="text-[11px] font-bold text-purple-700">
                                                                {dist?.subject?.name || "N/A"}
                                                            </span>
                                                            <span className="text-[10px] bg-purple-200/50 text-purple-600 px-1 rounded font-medium">
                                                                {dist.questionCount}Q
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* --------------------------- */}

                                            {/* Score & Question Summary */}
                                            <div className="flex items-center gap-4 pt-4 border-t border-dashed border-slate-200">
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Passing Score</p>
                                                    <p className="text-lg font-bold text-emerald-600 leading-none">
                                                        {exam.passingMarks}
                                                        <span className="text-[11px] text-slate-400 font-medium ml-1.5">/ {exam.totalMarks}</span>
                                                    </p>
                                                </div>
                                                <div className="h-8 w-[1px] bg-slate-100"></div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Questions</p>
                                                    <p className="text-sm font-semibold text-slate-700 italic">
                                                        {exam.questionDistribution?.reduce((acc, curr) => acc + (curr.questionCount || 0), 0)} Items
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-4 bg-slate-50/50 flex gap-3">
                                            <button
                                                onClick={() => handleEdit(exam)}
                                                className="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Edit Exam
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam._id)}
                                                className="flex-1 bg-white border border-rose-100 text-rose-500 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>)}
                    </>
                )}


                {!loading && isGrouped &&
                    <>
                        {
                            filteredExam.length === 0 ? (
                                <div className="bg-white shadow-sm rounded-2xl p-10 text-center border border-slate-200">
                                    <p className="text-slate-500 font-medium italic">No Exam Found</p>
                                </div>
                            ) : (
                                filteredExam.map((courseGroup) => (
                                    <div key={courseGroup._id} className="space-y-6">
                                        <h2 className="text-lg font-bold text-purple-700">
                                            {courseGroup._id}
                                        </h2>

                                        {courseGroup?.sessions?.map((sessionGroup) => (

                                            <div key={sessionGroup.session} className="space-y-4">

                                                <h3 className="text-sm font-semibold text-slate-600">
                                                    Session : {sessionGroup?.session}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                                    {sessionGroup?.exams.map((exam, index) => (

                                                        <div key={exam._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative group">

                                                            {/* Year Badge (Floating Style) */}
                                                            <div className="absolute top-4 right-4 z-10">
                                                                <span className="bg-white/90 backdrop-blur-sm border border-purple-100 text-purple-600 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                                                    {exam?.sessionData?.year || "N/A"}
                                                                </span>
                                                            </div>

                                                            {/* Header Section */}
                                                            <div className="p-5 border-b border-slate-50 bg-gradient-to-br from-purple-50/30 to-white">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-[2px]">Exam Record 👉#{index + 1}</span>
                                                                    <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-purple-700 transition-colors uppercase">
                                                                        {exam.title}
                                                                    </h3>
                                                                </div>
                                                            </div>

                                                            {/* Main Body */}
                                                            <div className="p-5 space-y-5 flex-grow">
                                                                {/* Status & Timing */}
                                                                <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                                                                    <div className="flex flex-col">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Schedule</p>
                                                                        <p className="text-sm text-slate-700 font-semibold">{exam.date}</p>
                                                                        <p className="text-xs text-slate-500 font-medium">{exam.time} • {exam.duration} Min</p>
                                                                    </div>
                                                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${exam.status === 'Scheduled' ? 'bg-indigo-500 text-white' :
                                                                        exam.status === 'Closed' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                                                                        }`}>
                                                                        {exam.status}
                                                                    </div>
                                                                </div>

                                                                {/* Academic Information */}
                                                                <div className="space-y-2.5 px-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-[1.5px] w-3 bg-purple-200"></div>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Academic Context</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-1.5">
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2 py-0.5 rounded">
                                                                                {exam.sessionData?.course}
                                                                            </span>
                                                                            <span className="text-slate-300">/</span>
                                                                            <span className="text-slate-600 font-medium text-xs italic">
                                                                                {exam.sessionData?.branch}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* --- NEW: Subjects Section --- */}
                                                                <div className="space-y-2 px-1">
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Subjects Included</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {exam.questionDistribution?.map((dist, idx) => (
                                                                            <div key={idx} className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-2 py-1 rounded-md">
                                                                                <span className="text-[11px] font-bold text-purple-700">
                                                                                    {dist.subject?.name || "N/A"}
                                                                                </span>
                                                                                <span className="text-[10px] bg-purple-200/50 text-purple-600 px-1 rounded font-medium">
                                                                                    {dist.questionCount}Q
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {/* --------------------------- */}

                                                                {/* Score & Question Summary */}
                                                                <div className="flex items-center gap-4 pt-4 border-t border-dashed border-slate-200">
                                                                    <div className="flex-1">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Passing Score</p>
                                                                        <p className="text-lg font-bold text-emerald-600 leading-none">
                                                                            {exam.passingMarks}
                                                                            <span className="text-[11px] text-slate-400 font-medium ml-1.5">/ {exam.totalMarks}</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="h-8 w-[1px] bg-slate-100"></div>
                                                                    <div className="flex-1">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Questions</p>
                                                                        <p className="text-sm font-semibold text-slate-700 italic">
                                                                            {exam.questionDistribution?.reduce((acc, curr) => acc + (curr.questionCount || 0), 0)} Items
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Footer Actions */}
                                                            <div className="p-4 bg-slate-50/50 flex gap-3">
                                                                <button
                                                                    onClick={() => handleEdit(exam)}
                                                                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                                                >
                                                                    Edit Exam
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(exam._id)}
                                                                    className="flex-1 bg-white border border-rose-100 text-rose-500 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )
                        }
                    </>
                }
            </div>
        </div >
    );
};