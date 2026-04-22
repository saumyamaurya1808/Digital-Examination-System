import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server_url } from "../../App";
import { confirmDelete } from "../../Components/confirmDelete";

export const Subject = () => {
    const [form, setForm] = useState({ name: "", description: "" });
    const [data, setData] = useState([]);
    const [edit, setEdit] = useState(false);
    const [id, setId] = useState("");
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (edit) {

                const response = await axios.put(`${server_url}/api/subject/${id}`, form);

                if (response.data.success) {
                    toast.success(response.data.message || "Subject Updated Successfully");
                } else {
                    toast.error(response.data.message || "Failed to update subject");
                }

            } else {

                const response = await axios.post(`${server_url}/api/subject`, form);

                if (response.data.success) {
                    toast.success(response.data.message || "Subject Added Successfully");
                } else {
                    toast.error(response.data.message || "Failed to add subject");
                }

            }

            setForm({ name: "", description: "" });
            setEdit(false);
            setId("");
            handleFetch();

        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };


    const handleFetch = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${server_url}/api/subject`, { withCredentials: true });
            setData(res.data.result || res.data);

        } catch (err) {
            toast.error("Failed to fetch subjects");
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id) => {

        const confirm = await confirmDelete();
        if (!confirm) return;

        try {

            const response = await axios.delete(`${server_url}/api/subject/${id}`);

            if (response.data.success) {
                toast.success(response.data.message || "Subject Deleted Successfully");
            } else {
                toast.error(response.data.message || "Failed to delete subject");
            }

            handleFetch();

        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };


    const handleEdit = (item) => {

        setForm({
            name: item.name,
            description: item.description
        });

        setEdit(true);
        setId(item._id);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    useEffect(() => {
        handleFetch();
    }, []);


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

                <h2 className="text-xl font-semibold text-purple-800 mb-4">
                    {edit ? "Edit Subject" : "Create Subject"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter Subject Name"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Enter Subject Description"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            className="bg-purple-800 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {edit ? "Update Subject" : "Add Subject"}
                        </button>

                        {edit && (

                            <button
                                type="button"
                                onClick={() => {
                                    setForm({ name: "", description: "" });
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


            {/* TABLE */}

            {data.length > 0 && (

                <div className="bg-white shadow-md rounded-xl p-6">

                    <h2 className="text-xl font-semibold text-blue-700 mb-4">
                        Subject List
                    </h2>

                    <div className="overflow-x-auto">

                        <table className="min-w-full border">

                            <thead className="bg-purple-100 text-purple-800">

                                <tr>
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Description</th>
                                    <th className="p-2 border">Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {data.map((item, index) => (

                                    <tr
                                        key={item._id}
                                        className="text-center hover:bg-gray-50"
                                    >

                                        <td className="border p-2">
                                            {index + 1}
                                        </td>

                                        <td className="border p-2 font-medium">
                                            {item.name}
                                        </td>

                                        <td className="border p-2">
                                            {item.description}
                                        </td>

                                        <td className="border px-3 md:px-4 py-3">

                                            <div className="flex flex-col md:flex-row gap-2 justify-center">

                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs shadow"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs shadow"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
};