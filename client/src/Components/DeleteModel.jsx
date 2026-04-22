import React from 'react';
import { Trash2, X, User, Users } from 'lucide-react';

export const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-xl text-red-600">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Delete Message?</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Aap is message ko kaise delete karna chahte hain? Chuniye:
                    </p>

                    <div className="space-y-3">
                        {/* Delete for Me */}
                        <button
                            onClick={() => onConfirm('self')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group text-left"
                        >
                            <div className="bg-white shadow-sm p-3 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                <User size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800">Delete for Me</span>
                                <span className="text-xs text-gray-500">Sirf aapki history se hatega.</span>
                            </div>
                        </button>

                        {/* Delete for Both */}
                        <button
                            onClick={() => onConfirm('both')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-red-100 hover:bg-red-50/50 transition-all group text-left"
                        >
                            <div className="bg-white shadow-sm p-3 rounded-xl text-red-600 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800">Delete for Everyone</span>
                                <span className="text-xs text-gray-500">Database aur Admin side se bhi hat jayega.</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
