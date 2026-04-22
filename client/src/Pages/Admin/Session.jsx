import React, { useEffect, useState } from "react";
import axios from "axios";
import { server_url } from "../../App";
import { toast } from "react-toastify";
import { confirmDelete } from "../../Components/confirmDelete";

export const Session = () => {
    const [form, setForm] = useState({
        name: "",
        course: "",
        branch: "",
        year: "",
        description: "",
    });
    const [data, setData] = useState([]);
    const [edit, setEdit] = useState(false);
    const [id, setId] = useState("");

    const [search, setSearch] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [loading, setLoading] = useState(false);
    

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (edit) {
                const response = await axios.put(`${server_url}/api/session/${id}`, form, { withCredentials: true });
                console.log("edit-", response);
                if (response.data.success) {
                    toast.success(response.data.message || "Session Updated Successfully");
                } else {
                    toast.error(response.data.message || "Failed to update session");
                }
            } else {
                const response = await axios.post(`${server_url}/api/session`, form, { withCredentials: true });
                console.log("create-", response);
                if (response.data.success) {
                    toast.success(response.data.message || "Session Added Successfully");
                } else {
                    toast.error(response.data.message || "Failed to add session");
                }
            }

            setForm({
                name: "",
                course: "",
                year: "",
                branch: "",
                description: ""
            });
            setEdit(false);
            setId("");
            handleFetch();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Server Connection Error";
            toast.error(errorMsg);
            console.error("Backend Error Details:", err.response?.data);
        }
    };

    const handleFetch = async () => {
        try {
            setLoading(true)
            const res = await axios.get(
                `${server_url}/api/session/filteredsession?search=${search}&session=${sessionFilter}&course=${courseFilter}&branch=${branchFilter}`
            );
            setData(res.data.result);

        } catch (err) {
            toast.error("Failed to fetch sessions");
        }
        finally {
            setLoading(false)
        }
    };

    const handleDelete = async (id) => {
        const confirm = await confirmDelete();
        if (!confirm) return;

        try {
            const response = await axios.delete(`${server_url}/api/session/${id}`);
            if (response.data.success) {
                toast.success(response.data.message || "Session Deleted Successfully");
            } else {
                toast.error(response.data.message || "Failed to delete session");
            }
            handleFetch();
        } catch (err) {
            toast.error(err.response.data?.message || "An error occurred while deleting the session");
            console.error("Delete error:", err);
        }
    };

    const groupedData = data.reduce((acc, item) => {

        if (!acc[item.name]) acc[item.name] = {};
        if (!acc[item.name][item.course]) acc[item.name][item.course] = [];

        acc[item.name][item.course].push(item);

        return acc;

    }, {});

    const handleEdit = (item) => {
        setForm({
            name: item.name,
            description: item.description,
            course: item.course,
            year: item.year,
            branch: item.branch
        });
        setEdit(true);
        setId(item._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        handleFetch();
    }, [search, sessionFilter, courseFilter, branchFilter]);

    return (
        <div className="space-y-6">

            {/* ================= LOADING ================= */}
            {loading && (
                <div className="bg-white shadow rounded p-10 text-center">
                    <div className="flex flex-col items-center gap-3">

                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>

                        <p className="text-gray-600 text-sm">
                            Loading examinee data...
                        </p>

                    </div>
                </div>
            )}

            {/* FORM CARD */}

            <div className="bg-white shadow-md rounded-xl p-6">

                <h2 className="text-xl font-semibold text-purple-700 mb-4">
                    {edit ? "Edit Session" : "Create Session"}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Session Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Session Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            pattern="\d{4}-\d{4}"
                            placeholder="Example: 2024-2025"
                            title="Session format must be YYYY-YYYY"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* Course */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Course</label>
                        <input
                            type="text"
                            name="course"
                            value={form.course}
                            onChange={handleChange}
                            placeholder="Example: B.Tech"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* Branch */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Branch</label>
                        <input
                            type="text"
                            name="branch"
                            value={form.branch}
                            onChange={handleChange}
                            placeholder="Example: Computer Science"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* year */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Year</label>
                        <select
                            name="year"
                            value={form.year}
                            onChange={handleChange}
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Select Year</option>
                            <option value="1st year">1st Year</option>
                            <option value="2nd year">2nd Year</option>
                            <option value="3rd year">3rd Year</option>
                            <option value="4th year">4th Year</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter Description"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 md:col-span-2">

                        <button
                            type="submit"
                            className="bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800 transition"
                        >
                            {edit ? "Update Session" : "Add Session"}
                        </button>

                        {edit && (
                            <button
                                type="button"
                                onClick={() => {
                                    setForm({
                                        name: "",
                                        course: "",
                                        branch: "",
                                        year: "",
                                        description: ""
                                    });
                                    setEdit(false);
                                    setId("");
                                }}
                                className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">

                {/* SEARCH YEAR */}
                <input
                    type="text"
                    placeholder="Search by year..."
                    className="border p-2 rounded w-52"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* SESSION */}
                <select
                    className="border p-2 rounded"
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                >
                    <option value="">All Sessions</option>
                    {[...new Set(data.map(i => i.name))].map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                    ))}
                </select>

                {/* COURSE */}
                <select
                    className="border p-2 rounded"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                >
                    <option value="">All Courses</option>
                    {[...new Set(data.map(i => i.course))].map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                    ))}
                </select>

                {/* BRANCH */}
                <select
                    className="border p-2 rounded"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                >
                    <option value="">All Branches</option>
                    {[...new Set(data.map(i => i.branch))].map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                    ))}
                </select>

            </div>

            {/* TABLE */}

            {Object.keys(groupedData).map((session) => (

                <div key={session} className="mb-6 border rounded-lg shadow">

                    <div className="bg-purple-700 text-white p-3 font-bold text-lg">
                        Session: {session}
                    </div>

                    {Object.keys(groupedData[session]).map((course) => (

                        <div key={course} className="p-4">

                            <h3 className="font-semibold text-purple-700 mb-2">
                                Course: {course}
                            </h3>

                            <table className="w-full border">

                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2">Branch</th>
                                        <th className="p-2">Year</th>
                                        <th className="p-2">Description</th>
                                        <th className="p-2">Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {groupedData[session][course].map((item) => (

                                        <tr key={item._id} className="border text-center">

                                            <td className="p-2">{item.branch}</td>
                                            <td className="p-2">{item.year}</td>
                                            <td className="p-2">{item.description}</td>

                                            <td className="p-2">

                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}