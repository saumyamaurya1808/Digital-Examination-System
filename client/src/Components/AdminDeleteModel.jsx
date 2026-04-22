import React from 'react';
import { Trash2, X, AlertCircle } from 'lucide-react';

export const AdminDeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Trash2 className="text-red-600" size={30} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Are you sure?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        This message will be deleted for <span className="font-bold text-red-500">BOTH</span> the user and the admin. This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all active:scale-95">
                            OK, Delete
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 p-3 flex items-center justify-center gap-2 border-t border-gray-100">
                    <AlertCircle size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Permanent Action</span>
                </div>
            </div>
        </div>
    );
};