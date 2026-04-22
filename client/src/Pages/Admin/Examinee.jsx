import axios from "axios";
import React, { useEffect, useState } from "react";
import { server_url } from "../../App";
import { confirmDelete } from "../../Components/confirmDelete";
import { toast } from "react-toastify";

export const Examinee = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [collapsedCourses, setCollapsedCourses] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [allSessions, setAllSessions] = useState([]);
    const [sessionFilter, setSessionFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const itemsPerPage = 10;

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        college: "",
        course: "",
        branch: "",
        year: "",
        session: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [editFormVisible, setEditFormVisible] = useState(false);


    /*================= FETCH =================*/
    const handlefetchSession = async () => {
        try {
            const res = await axios.get(`${server_url}/api/session`, { withCredentials: true });
            setAllSessions(res.data.result);
            console.log(res.data.result);
        } catch (err) {
            toast.error("Failed to fetch sessions");
            console.error("Fetch error:", err);
        }
    }

    const handlefetch = async (page = 1) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${server_url}/api/examinee?page=${page}&limit=${itemsPerPage}&search=${debouncedSearch}&session=${sessionFilter}&course=${courseFilter}&branch=${branchFilter}&year=${yearFilter}`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setData(res.data.data);
                setCurrentPage(res.data.currentPage);
                setTotalPages(res.data.totalPages);

                console.log(res.data.data)
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlefetchSession();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);


    useEffect(() => {
        handlefetch(currentPage);
    }, [currentPage, debouncedSearch, sessionFilter, courseFilter, branchFilter, yearFilter]);


    /* ================= CASCADING LOGIC ================= */
    // 1. Get Unique Sessions
    const availableSessions = [...new Set(allSessions.map(s => s.name))];

    // 2. Filter Courses based on selected Session
    const availableCourses = [...new Set(allSessions
        .filter(s => s.name === form.session)
        .map(s => s.course))];

    // 3. Filter Branches based on selected Session AND Course
    const availableBranches = [...new Set(allSessions
        .filter(s => s.name === form.session && s.course === form.course)
        .map(s => s.branch))];

    // 4. NEW: Filter Years based on Session, Course, AND Branch
    const availableYears = [...new Set(allSessions
        .filter(s =>
            s.name === form.session &&
            s.course === form.course &&
            s.branch === form.branch
        )
        .map(s => s.year))]; // Assuming your session API returns a 'year' field

    /* ================= DELETE ================= */

    const handleDelete = async (id) => {

        const confirm = await confirmDelete();
        if (!confirm) return;

        try {

            const res = await axios.delete(`${server_url}/api/examinee/${id}`, {
                withCredentials: true
            });

            if (res.data.success) {
                toast.success("Deleted");
                handlefetch(currentPage);
            }

        } catch (error) {
            toast.error("Delete failed");
        }

    };


    /* ================= EDIT ================= */

    const handleEdit = (item) => {

        setForm({
            name: item.name,
            email: item.email,
            phone: item.phone,
            college: item.college,
            course: item.course,
            branch: item.branch,
            year: item.year,
            session: item.session
        });

        setEditingId(item._id);
        setEditFormVisible(true);

        window.scrollTo({ top: 0, behavior: "smooth" });

    };


    /* ================= FORM CHANGE ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    /* ================= UPDATE ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.put(
                `${server_url}/api/examinee/${editingId}`,
                form,
                { withCredentials: true }
            );
            if (res.data.success) {

                toast.success("Updated");

                setEditFormVisible(false);
                setEditingId(null);

                handlefetch(currentPage);

            }
        } catch (error) {
            toast.error("Update failed");
        }

    };
    /* ================= FILTER (FRONTEND COURSE ONLY) ================= */
    const filteredData = data;

    /* ================= GROUP DATA ================= */

    const groupedData = filteredData.reduce((acc, item) => {

        if (!acc[item.course]) acc[item.course] = {};
        if (!acc[item.course][item.session]) acc[item.course][item.session] = [];

        acc[item.course][item.session].push(item);

        return acc;

    }, {});


    /* ================= COLLAPSE ================= */
    const toggleCourse = (course) => {
        setCollapsedCourses(prev => ({
            ...prev,
            [course]: !prev[course]
        }));
    };


    /* ================= EXPORT EXCEL ================= */

    const exportExcel = () => {
        window.open(`${server_url}/api/examinee/export`);
    };


    return (
        <>
            <div className="p-6 bg-gray-100 min-h-screen">
                {/* ================= TOP BAR ================= */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {/* SEARCH NAME / EMAIL */}
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="border p-2 rounded w-64"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    {/* SESSION */}
                    <select
                        className="border p-2 rounded"
                        value={sessionFilter}
                        onChange={(e) => {
                            setSessionFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Sessions</option>
                        {[...new Set(allSessions.map(s => s.name))].map((s, i) => (
                            <option key={i} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* COURSE */}
                    <select
                        className="border p-2 rounded"
                        value={courseFilter}
                        onChange={(e) => {
                            setCourseFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Courses</option>
                        {[...new Set(allSessions.map(s => s.course))].map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* BRANCH */}
                    <select
                        className="border p-2 rounded"
                        value={branchFilter}
                        onChange={(e) => {
                            setBranchFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Branches</option>
                        {[...new Set(allSessions.map(s => s.branch))].map((b, i) => (
                            <option key={i} value={b}>{b}</option>
                        ))}
                    </select>

                    <select
                        className="border p-2 rounded bg-white font-semibold text-purple-700 border-purple-200"
                        value={yearFilter}
                        onChange={(e) => {
                            setYearFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Years</option>
                        {/* allSessions se unique years nikal kar map karna */}
                        {[...new Set(allSessions.map(s => s.year))].filter(Boolean).sort().map((y, i) => (
                            <option key={i} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* EXPORT */}
                    <button
                        onClick={exportExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Export Excel
                    </button>

                </div>


                {/* ================= EDIT FORM ================= */}

                {editFormVisible && (
                    <div className="bg-white shadow-xl rounded-lg p-6 mb-6 border-l-8 border-purple-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Update Examinee Record</h2>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">STEP-BY-STEP FLOW</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* --- SECTION 1: ACADEMIC CASCADING (The Flow) --- */}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">1. Academic Selection</h3>
                            <div className="grid md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">

                                {/* 1. SESSION */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Step 1: Session</label>
                                    <select className="border-2 p-2 rounded focus:border-purple-500 bg-white" name="session" value={form.session} onChange={handleChange} required>
                                        <option value="">-- Select Session --</option>
                                        {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* 2. COURSE */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Step 2: Course</label>
                                    <select className={`border-2 p-2 rounded focus:border-purple-500 ${!form.session ? 'bg-gray-100' : 'bg-white'}`}
                                        name="course" value={form.course} onChange={handleChange} required disabled={!form.session}>
                                        <option value="">-- Select Course --</option>
                                        {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* 3. BRANCH */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Step 3: Branch</label>
                                    <select className={`border-2 p-2 rounded focus:border-purple-500 ${!form.course ? 'bg-gray-100' : 'bg-white'}`}
                                        name="branch" value={form.branch} onChange={handleChange} required disabled={!form.course}>
                                        <option value="">-- Select Branch --</option>
                                        {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>

                                {/* 4. YEAR */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Step 4: Year</label>
                                    <select className={`border-2 p-2 rounded focus:border-purple-500 ${!form.branch ? 'bg-gray-100' : 'bg-white'}`}
                                        name="year" value={form.year} onChange={handleChange} required disabled={!form.branch}>
                                        <option value="">-- Select Year --</option>
                                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* --- SECTION 2: PERSONAL DETAILS --- */}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">2. Student Information</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Full Name</label>
                                    <input className="border-2 p-2 rounded focus:border-purple-500" name="name" value={form.name} onChange={handleChange} required placeholder="Student Name" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Email Address</label>
                                    <input className="border-2 p-2 rounded focus:border-purple-500" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="example@mail.com" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">Phone Number</label>
                                    <input className="border-2 p-2 rounded focus:border-purple-500" name="phone" value={form.phone} onChange={handleChange} required placeholder="10 Digit Mobile" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-xs font-bold mb-1 text-gray-600">College Name</label>
                                    <input className="border-2 p-2 rounded focus:border-purple-500" name="college" value={form.college} onChange={handleChange} required placeholder="College/Institute" />
                                </div>
                            </div>

                            {/* --- BUTTONS --- */}
                            <div className="flex justify-end gap-4 border-t pt-6">
                                <button type="button" onClick={() => setEditFormVisible(false)} className="px-6 py-2 rounded-md font-bold text-gray-500 hover:bg-gray-100 transition-all">
                                    Discard
                                </button>
                                <button type="submit" className="px-8 py-2 bg-purple-700 text-white rounded-md font-bold shadow-lg hover:bg-purple-800 transform active:scale-95 transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">

                        <div className="bg-white px-6 py-4 rounded shadow flex items-center gap-3">

                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>

                            <span className="text-gray-700 font-medium">
                                Loading examinee data...
                            </span>

                        </div>

                    </div>
                )}


                {/* ================= COURSE GROUP ================= */}

                {Object.keys(groupedData).map((course) => {

                    const totalStudents = Object.values(groupedData[course]).flat().length;

                    return (

                        <div key={course} className="mb-8 bg-white shadow rounded">

                            <div
                                onClick={() => toggleCourse(course)}
                                className="flex justify-between items-center p-4 cursor-pointer bg-purple-700 text-white rounded-t"
                            >

                                <h2 className="text-xl font-bold">
                                    {course} ({totalStudents} Students)
                                </h2>

                                <span>
                                    {collapsedCourses[course] ? "Expand" : "Collapse"}
                                </span>

                            </div>


                            {!collapsedCourses[course] &&
                                Object.keys(groupedData[course]).map((session) => {

                                    const students = groupedData[course][session];

                                    return (

                                        <div key={session} className="p-4">

                                            <h3 className="font-semibold mb-2">

                                                Session : {session}

                                                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    {students.length} Students
                                                </span>

                                            </h3>


                                            <div className="overflow-x-auto">

                                                <table className="w-full border">

                                                    <thead className="bg-gray-200">

                                                        <tr>
                                                            <th className="p-2">S.No</th>
                                                            <th className="p-2">Name</th>
                                                            <th className="p-2">Email</th>
                                                            <th className="p-2">College</th>
                                                            <th className="p-2">Branch</th>
                                                            <th className="p-2">year</th>
                                                            <th className="p-2">Phone</th>
                                                            <th className="p-2">Action</th>
                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {students.map((item, i) => (

                                                            <tr key={item._id} className="border">

                                                                <td className="p-2">{i + 1}</td>
                                                                <td className="p-2 font-semibold">{item.name}</td>
                                                                <td className="p-2">{item.email}</td>
                                                                <td className="p-2">{item.college}</td>
                                                                <td className="p-2">{item.branch}</td>
                                                                <td className="p-2">{item.year}</td>
                                                                <td className="p-2">{item.phone}</td>

                                                                <td className="p-2">

                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleDelete(item._id)}
                                                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </td>

                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                            </div>

                                        </div>

                                    );

                                })

                            }

                        </div>

                    );

                })}


                {/* ================= PAGINATION ================= */}

                <div className="flex justify-center mt-6 gap-2 flex-wrap">

                    {Array.from({ length: totalPages }, (_, i) => (

                        <button
                            key={i}
                            onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className={`px-3 py-1 rounded ${currentPage === i + 1
                                ? "bg-purple-700 text-white"
                                : "bg-gray-300"
                                }`}
                        >
                            {i + 1}
                        </button>

                    ))}

                </div>

            </div>
        </>
    );
};