const mongoose = require('mongoose');
const { Message } = require('../models/message-model');

// 1. Create message (User Side)
const createMessage = async (req, res) => {
    try {
        const { question } = req.body;
        const examineeId = req.user._id;

        if (!examineeId)
            return res.status(400).json({ message: 'examineeId required' });

        const newMessage = new Message({
            question,
            examineeId,
            deletedByUser: false, // Default flags
            deletedByAdmin: false
        });

        await newMessage.save();
        res.status(201).json({ success: true, message: "Sent!", data: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get all messages (Admin View - Sirf wo jo admin ne hide nahi kiye)
const getAllMessages = async (req, res) => {
    try {
        const msgs = await Message.find({ deletedByAdmin: false })
            .populate('examineeId', 'name email')
            .sort({ createdAt: -1 });

        return res.json({ message: msgs });
    } catch (err) {
        console.error('Error fetching admin messages:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 3. Get messages for specific user (User View - Sirf wo jo user ne hide nahi kiye)
const getUserMessages = async (req, res) => {
    try {
        const msgs = await Message.find({
            examineeId: req.params.id,
            // deletedByUser: false
        })
            .populate('examineeId', 'name email')
            .sort({ createdAt: -1 });

        return res.json({ message: msgs });
    } catch (err) {
        console.error('Error fetching user messages:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 4. Edit Message (Hybrid Logic)
const editMessage = async (req, res) => {
    try {
        const { question, answer, role, userId } = req.body;
        const { id } = req.params;

        const msg = await Message.findById(id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });

        if (role === 'admin') {
            if (answer !== undefined) msg.answer = answer;
            msg.editedBy = 'admin';
        } else if (role === 'user') {
            // Security: Kya message isi user ka hai aur delete toh nahi kar diya?
            if (msg.examineeId.toString() !== userId || msg.deletedByUser) {
                return res.status(403).json({ message: 'Not allowed to edit' });
            }
            if (question !== undefined) msg.question = question;
            msg.editedBy = 'user';
        }

        await msg.save();
        return res.json({ success: true, message: 'Updated', data: msg });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// 5. Admin Reply
const replyMessage = async (req, res) => {
    try {
        const { answer, role } = req.body;
        if (role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            { answer, deletedByAdmin: false, editedBy: 'admin' }, // Reset hidden status if replying
            { new: true }
        ).populate('examineeId', 'name email');

        if (!updated) return res.status(404).json({ message: 'Not found' });
        return res.json({ message: 'Reply saved', data: updated });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// 6. NEW DELETE LOGIC (Self Side vs Both Sides)
const softDeleteMessage = async (req, res) => {
    try {
        const { role, userId, deleteType } = req.body; // deleteType: 'self' or 'both'
        const { id } = req.params;

        const msg = await Message.findById(id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });

        // CASE 1: HARD DELETE (Dono taraf se delete)
        if (deleteType === 'both') {
            await Message.findByIdAndDelete(id);
            return res.json({ success: true, message: 'Deleted for everyone' });
        }

        // CASE 2: SOFT DELETE (Sirf ek taraf se hide)
        if (role === 'user') {
            if (msg.examineeId.toString() !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            msg.deletedByUser = true;
        } else if (role === 'admin') {
            msg.deletedByAdmin = true;
        }

        // Cleanup: Agar dono ne hide kar diya toh DB se uda do
        if (msg.deletedByUser && msg.deletedByAdmin) {
            await Message.findByIdAndDelete(id);
            return res.json({ success: true, message: 'Message fully removed' });
        }

        await msg.save();
        return res.json({ success: true, message: `Hidden for ${role}` });

    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    getUserMessages,
    editMessage,
    replyMessage,
    softDeleteMessage
};