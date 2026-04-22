import { useState, useEffect } from "react";
import axios from "axios";
import { server_url } from "../../App";
import { toast } from "react-toastify";
import { Trash2, Send, Edit, MessageSquare, User, Mail, X, CheckCircle } from "lucide-react";
import { AdminDeleteModal } from "../../Components/AdminDeleteModel";

export const MessageReply = () => {
    const [messages, setMessages] = useState([]);
    const [replyInputs, setReplyInputs] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Modal & Edit states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMsgId, setSelectedMsgId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // --- READ: Fetch all messages ---
    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${server_url}/api/message/all`, { withCredentials: true });
            setMessages(res.data.message || []);
            console.log("all message",res.data.message);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleReplyChange = (id, value) => {
        setReplyInputs((prev) => ({ ...prev, [id]: value }));
    };

    // --- UPDATE UI: Prepare for edit ---
    const handleEditClick = (msg) => {
        setEditingId(msg._id);
        setReplyInputs((prev) => ({ ...prev, [msg._id]: msg.answer }));
    };

    const cancelEdit = (id) => {
        setEditingId(null);
        setReplyInputs((prev) => ({ ...prev, [id]: "" }));
    };

    // --- CREATE & UPDATE: Post Reply or Put Edit ---
    const handleSendOrUpdate = async (id) => {
        const answer = (replyInputs[id] || "").trim();
        if (!answer) return toast.warning("Please type a reply.");

        try {
            // Security: Role is explicitly sent to backend for verification
            const payload = { answer, role: "admin" };

            if (editingId === id) {
                // UPDATE OPERATION
                await axios.put(`${server_url}/api/message/edit/${id}`, payload, { withCredentials: true });
                toast.success("Reply updated!");
            } else {
                // CREATE OPERATION
                await axios.post(`${server_url}/api/message/reply/${id}`, payload, { withCredentials: true });
                toast.success("Reply sent!");
            }

            setEditingId(null);
            setReplyInputs((prev) => ({ ...prev, [id]: "" }));
            fetchAll();
        } catch (err) {
            console.error("Action Error:", err);
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    // --- DELETE: Modal Logic ---
    const handleDeleteClick = (id) => {
        setSelectedMsgId(id);
        setIsDeleteModalOpen(true);
    };

    const onConfirmDelete = async () => {
        setIsDeleteModalOpen(false);
        try {
            // Security: deleteType 'both' ensures record is cleared globally
            await axios.put(`${server_url}/api/message/delete/${selectedMsgId}`, {
                role: "admin",
                deleteType: "both"
            }, { withCredentials: true });

            toast.success("Message deleted permanently");
            fetchAll();
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Delete failed");
        } finally {
            setSelectedMsgId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-lg rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                        <MessageSquare size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-purple-700">User Feedback & Replies</h2>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-purple-700 text-white">
                            <tr>
                                <th className="p-4 text-left">S.No</th>
                                <th className="p-4 text-left">Examinee Details</th>
                                <th className="p-4 text-left">User Feedback</th>
                                <th className="p-4 text-left">Admin Response</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-10 text-center">Loading...</td></tr>
                            ) : messages.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-500 italic">No messages found.</td></tr>
                            ) : (
                                messages.map((msg, idx) => (
                                    <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-400">#{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 flex items-center gap-1">
                                                <User size={14} className="text-gray-400" /> {msg.examineeId?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail size={12} /> {msg.examineeId?.email || "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-4 italic text-gray-600 max-w-xs">"{msg.question}"</td>
                                        <td className="p-4">
                                            {msg.answer && editingId !== msg._id ? (
                                                <div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-100 text-xs">
                                                    <strong>Replied:</strong> {msg.answer}
                                                </div>
                                            ) : (
                                                <span className="text-amber-500 text-xs font-medium bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                    {editingId === msg._id ? "Modifying..." : "Pending Response"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={replyInputs[msg._id] || ""}
                                                        onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                                                        className={`w-full border rounded-lg px-3 py-1.5 text-xs outline-none transition-all ${editingId === msg._id ? 'border-blue-500 ring-2 ring-blue-100' : 'focus:ring-2 focus:ring-purple-400'}`}
                                                        placeholder={msg.answer ? "Update message..." : "Type reply..."}
                                                    />
                                                    <button
                                                        onClick={() => handleSendOrUpdate(msg._id)}
                                                        className={`${editingId === msg._id ? 'bg-blue-600' : 'bg-purple-600'} text-white p-2 rounded-lg transition-all active:scale-95 flex items-center gap-1`}
                                                    >
                                                        {editingId === msg._id ? <CheckCircle size={14} /> : <Send size={14} />}
                                                    </button>
                                                    {editingId === msg._id && (
                                                        <button onClick={() => cancelEdit(msg._id)} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300">
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 justify-end">
                                                    {msg.answer && editingId !== msg._id && (
                                                        <button onClick={() => handleEditClick(msg)} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                            <Edit size={12} /> Edit
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteClick(msg._id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
            />
        </div>
    );
};