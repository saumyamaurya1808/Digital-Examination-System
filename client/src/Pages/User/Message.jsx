import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, Edit3, Trash2, MessageSquare, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { server_url } from '../../App';
import { confirmDelete } from '../../Components/confirmDelete';
import { DeleteModal } from '../../Components/DeleteModel';

export const Message = () => {
    const [user, setUser] = useState(null);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const userId = user?._id;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMsgId, setSelectedMsgId] = useState(null);

    const handleDeleteClick = (id) => {
        setSelectedMsgId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (deleteType) => {
        setIsDeleteModalOpen(false);
        if (!userId || !selectedMsgId) return;

        try {
            await axios.put(`${server_url}/api/message/delete/${selectedMsgId}`, {
                role: 'user',
                userId: userId,
                deleteType: deleteType
            }, { withCredentials: true });

            toast.success(deleteType === 'both' ? 'Deleted for everyone' : 'Hidden from you');
            fetchUserMessages();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${server_url}/api/examinee/currentuser`, { withCredentials: true });
                if (res.data.success) setUser(res.data.user);
                // console.log("Current User",res.data.user);
            } catch (err) {
                toast.error("Failed to load profile");
            }
        };
        fetchUser();
    }, []);

    const fetchUserMessages = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${server_url}/api/message/user/${userId}`);
            setMessages(res.data.message || []);
        } catch (err) {
            console.error('Error fetching user messages:', err);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserMessages();
        }
    }, [userId]);

    const handleEditClick = (msg) => {
        setEditingId(msg._id);
        setQuestion(msg.question);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setQuestion('');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!question.trim()) return toast.warning('Please enter a message');
        if (!userId) return toast.error("User ID not found. Please log in again.");

        setIsSending(true);
        try {
            if (editingId) {
                await axios.put(`${server_url}/api/message/edit/${editingId}`, {
                    question: question.trim(),
                    role: 'user',
                    userId: userId
                }, {withCredentials: true});
                toast.info('Message updated');
            } else {
                await axios.post(`${server_url}/api/message`, {
                    question: question.trim()
                }, {withCredentials: true});
                toast.success('Feedback sent successfully!');
            }

            setQuestion('');
            setEditingId(null);
            fetchUserMessages();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" /> Support & Feedback
                    </h2>
                    <p className="text-gray-500 text-sm">Send your queries or feedback directly to our admin team.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-6 border border-indigo-50">
                {editingId && (
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-orange-500">EDITING MESSAGE</span>
                        <button onClick={cancelEdit} className="text-xs text-red-500 underline font-bold uppercase">Cancel</button>
                    </div>
                )}
                <form onSubmit={sendMessage} className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-4 pr-16 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all min-h-[120px] text-gray-700 placeholder:text-gray-400"
                        placeholder="Describe your issue or share your feedback..."
                    />
                    <button
                        disabled={isSending}
                        type="submit"
                        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-90 disabled:opacity-50"
                    >
                        {isSending ? <Clock className="animate-spin" /> : editingId ? <CheckCircle2 size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 px-2">
                    Your Conversation History
                </h3>

                {messages.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <AlertCircle className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400 font-medium">No active messages found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div key={msg._id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all overflow-hidden group ${msg.deletedByUser ? 'opacity-80' : ''}`}>
                                <div className="p-5 md:p-6">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex-grow">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">Your Message</span>

                                            {/* Logic for Deleted Message Placeholder */}
                                            {msg.deletedByUser ? (
                                                <div className="flex items-center gap-2 text-gray-400 italic bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200 text-sm">
                                                    <Info size={14} /> You deleted this message
                                                </div>
                                            ) : (
                                                <p className="text-gray-800 font-semibold leading-relaxed">{msg.question}</p>
                                            )}
                                        </div>

                                        {/* Buttons hide if message is answered OR already deleted by user */}
                                        {!msg.answer && !msg.deletedByUser && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(msg)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(msg._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Reply - No conditions, always visible */}
                                    <div className={`rounded-xl p-4 flex items-start gap-3 ${msg.answer ? 'bg-green-50/50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                                        {msg.answer ? (
                                            <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                                        ) : (
                                            <Clock size={18} className="text-gray-400 mt-0.5 shrink-0" />
                                        )}
                                        <div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                                Admin Reply
                                            </span>
                                            <p className={`text-sm ${msg.answer ? 'text-gray-700 font-medium' : 'text-gray-400 italic'}`}>
                                                {msg.answer || 'Waiting for admin to review and reply...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};