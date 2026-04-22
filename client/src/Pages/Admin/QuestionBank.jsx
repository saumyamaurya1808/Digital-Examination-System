import React, { useEffect, useState } from "react";
import axios from "axios";
import { server_url } from "../../App";
import { toast } from "react-toastify";
import { confirmDelete } from "../../Components/confirmDelete";

export const QuestionBank = () => {

    const [formData, setFormdata] = useState({
        question: "",
        options: ["", ""],
        correctAnswer: "",
        subject: "",
    });

    const [subjects, setSubjects] = useState([]);
    const [id, setId] = useState({ id: "" });
    const [editform, setEditForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [search, setSearch] = useState("");

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;

        setFormdata({
            ...formData,
            options: newOptions
        });
    };

    const addOption = () => {
        setFormdata({
            ...formData,
            options: [...formData.options, ""],
        });
    };

    const removeOption = (index) => {

        if (formData.options.length <= 2) {
            toast.error("Minimum 2 options required");
            return;
        }

        const newOptions = formData.options.filter((_, i) => i !== index);

        setFormdata({
            ...formData,
            options: newOptions
        });
    };

    const handleChange = (e) => {
        setFormdata({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (editform) {

                const res = await axios.put(
                    `${server_url}/api/question/${id.id}`,
                    formData,
                    { withCredentials: true }
                );

                toast.success(res.data.message || "Question updated successfully");

            } else {

                const res = await axios.post(
                    `${server_url}/api/question`,
                    formData,
                    { withCredentials: true }
                );

                toast.success(res.data.message || "Question added successfully");
            }

            setFormdata({
                question: "",
                options: ["", ""],
                correctAnswer: "",
                subject: "",
            });

            setEditForm(false);
            setId({ id: "" });

            handlefetch();

        } catch (err) {
            toast.error(err.response?.data?.message || "Error");
        }
    };

    const handlefetch = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${server_url}/api/question`, {
                withCredentials: true
            });

            console.log("Question API Response:", res.data);

            // API response handle
            if (res.data?.data) {
                setData(res.data.data);
            }
            else if (Array.isArray(res.data)) {
                setData(res.data);
            }
            else {
                setData([]);
            }

            const res1 = await axios.get(`${server_url}/api/subject`, {
                withCredentials: true
            });

            console.log("Subject API Response:", res1.data);

            if (Array.isArray(res1.data)) {
                setSubjects(res1.data);
            }
            else if (res1.data?.data) {
                setSubjects(res1.data.data);
            }
            else {
                setSubjects([]);
            }

        } catch (error) {

            console.error("Fetch Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch questions or subjects"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlefetch();
    }, []);

    const handleDelete = async (id) => {

        const confirm = await confirmDelete();
        if (!confirm) return;

        try {

            await axios.delete(
                `${server_url}/api/question/${id}`,
                { withCredentials: true }
            );
            toast.success("Question deleted successfully");
            handlefetch();

        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (q) => {

        setFormdata({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            subject: q.subject?._id,
        });

        setId({ id: q._id });
        setEditForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // subject count
    const getSubjectCount = (subjectId) => {
        return data.filter((q) => q.subject?._id === subjectId).length;
    };

    // filter logic
    const filteredData = data.filter((q) => {

        const subjectMatch = selectedSubject
            ? q.subject?._id === selectedSubject
            : true;

        const searchMatch = q.question
            .toLowerCase()
            .includes(search.toLowerCase());

        return subjectMatch && searchMatch;

    });

    // pagination logic
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentQuestions = filteredData.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

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

            <div className="bg-white shadow-lg rounded-xl p-6 border mb-6">

                <h2 className="text-xl font-bold text-purple-700 mb-4">
                    {editform ? "Edit Question" : "Add Question"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <textarea
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        required
                        placeholder="Enter Question Here"
                        className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
                    />

                    <div className="grid md:grid-cols-2 gap-3">

                        {formData.options.map((opt, index) => (

                            <div key={index} className="flex gap-2">

                                <input
                                    type="text"
                                    value={opt}
                                    placeholder={`Option ${index + 1} `}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="border rounded-lg p-2 w-full"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="bg-red-500 text-white px-3 rounded"
                                >
                                    X
                                </button>

                            </div>

                        ))}

                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                        + Add Option
                    </button>

                    <div className="grid md:grid-cols-2 gap-4">

                        <input
                            name="correctAnswer"
                            placeholder="Correct Answer"
                            className="border rounded-lg p-2"
                            value={formData.correctAnswer}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="border rounded-lg p-2"
                            required
                        >

                            <option value="">Select Subject</option>

                            {subjects.map((sub) => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-lg shadow"
                    >
                        {editform ? "Update Question" : "Add Question"}
                    </button>

                </form>
            </div>

            {/* TABLE */}

            <div className="bg-white shadow-xl rounded-xl border overflow-hidden">

                <div className="px-4 md:px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-2">

                    <h2 className="text-lg md:text-xl font-bold text-purple-700">
                        Question List
                    </h2>

                    <span className="text-sm text-gray-500">
                        Total: {filteredData.length}
                    </span>

                </div>

                {/* SEARCH */}

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search Question..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg p-2 w-full md:w-80"
                    />
                </div>

                {/* SUBJECT FILTER */}

                <div className="p-4 flex flex-wrap gap-2">

                    <button
                        onClick={() => setSelectedSubject("")}
                        className={`px-3 py-1 rounded text-sm hover:bg-gray-300 ${selectedSubject === "" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                    >
                        All ({data.length})
                    </button>

                    {subjects.map((sub) => (

                        <button
                            key={sub._id}
                            onClick={() => setSelectedSubject(sub._id)}
                            className={`px-3 py-1 rounded text-sm hover:bg-gray-300 ${selectedSubject === sub._id ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                        >
                            {sub.name} ({getSubjectCount(sub._id)})
                        </button>

                    ))}

                </div>

                <div className="overflow-x-auto">

                    <table className="min-w-[700px] w-full text-sm text-left border border-gray-300 border-collapse">

                        <thead className="bg-purple-700 text-white text-xs md:text-sm">

                            <tr>
                                <th className="border px-3 md:px-4 py-3">#</th>
                                <th className="border px-3 md:px-4 py-3">Question</th>
                                <th className="border px-3 md:px-4 py-3">Subject</th>
                                <th className="border px-3 md:px-4 py-3">Options</th>
                                <th className="border px-3 md:px-4 py-3 text-center">Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {currentQuestions.map((q, index) => (

                                <tr key={q._id} className="hover:bg-gray-50">

                                    <td className="border px-4 py-3">
                                        {indexOfFirst + index + 1}
                                    </td>

                                    <td className="border px-4 py-3">
                                        {q.question}
                                    </td>

                                    <td className="border px-4 py-3">
                                        {q.subject?.name}
                                    </td>

                                    <td className="border px-4 py-3">
                                        {q.options.map((opt, i) => {
                                            // Check if this option is the correct answer
                                            const isCorrect = opt === q.correctAnswer;

                                            return (
                                                <div
                                                    key={i}
                                                    className={isCorrect ? "text-green-600 font-bold" : "text-gray-700"}
                                                >
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                    {isCorrect && <span className="ml-2 text-xs">(Correct)</span>}
                                                </div>
                                            );
                                        })}
                                    </td>

                                    <td className="border px-4 py-3 text-center">

                                        <button
                                            onClick={() => handleEdit(q)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(q._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

                {/* PAGINATION */}

                <div className="p-4 flex justify-center gap-2 flex-wrap">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1 border rounded"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (

                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className="px-3 py-1 border rounded"
                        >
                            {i + 1}
                        </button>

                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 border rounded"
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>
    );
};