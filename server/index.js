require("dotenv").config();
const express = require("express");
const cors = require('cors');
const http = require("http"); // 1. HTTP module import karein
const { Server } = require("socket.io"); // 2. Socket.io import karein
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");

// Routers import (aapke purane routers)
const { adminRouter } = require("./routers/admin-router");
const { dashboardRouter } = require("./routers/dashboard-router");
const { sessionRouter } = require("./routers/session-route");
const { subjectRouter } = require("./routers/subject-route");
const { examinationRouter } = require("./routers/examination-router");
const { questionBankRouter } = require("./routers/questionbank-route");
const { examineeRouter } = require("./routers/examinee-router");
const { messageRouter } = require("./routers/message-router");
const { userDashboardRouter } = require("./routers/user-dashboard-router");
const { Examinee } = require("./models/examinee-model");
const { otpRouter } = require("./routers/otp-router");

const app = express();
const server = http.createServer(app); // 4. Server create karein

const corsOptions = {
    origin: ["http://localhost:5173", "https://digital-examination-system.vercel.app","https://localhost:5000"],
    methods: "POST, GET, PUT, DELETE, PATCH, HEAD",
    credentials: true
};

// 5. Socket initialization
const io = new Server(server, {
    cors: corsOptions
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// API Routes 
app.use('/api/admin', adminRouter);
app.use('/api/session', sessionRouter);
app.use('/api/subject', subjectRouter);
app.use('/api/exams', examinationRouter);
app.use('/api/question', questionBankRouter);
app.use('/api/examinee', examineeRouter);
app.use('/api/message', messageRouter);
app.use('/api/admindashboard', dashboardRouter);
app.use('/api/userdashboard', userDashboardRouter);
app.use('/api/otp', otpRouter);

// socket
io.on("connection", async (socket) => {
    console.log("New connection:", socket.id);

    // initial count send
    const emitActiveCount = async () => {
        const count = await Examinee.countDocuments({ status: "active" });
        io.emit("updateActiveCount", count);
    };

    // send current count to newly connected client
    await emitActiveCount();

    // STUDENT ONLINE
    socket.on("student_online", async (studentId) => {
        console.log("ONLINE EVENT:", studentId);

        const existing = await Examinee.findById(studentId);


        // already active ho to skip
        if (existing?.isOnline && existing?.socketId === socket.id) {
            return;
        }

        if (!existing) {
            console.log("User deleted, disconnecting socket:", socket.id);
            socket.disconnect(); // ✅ clean removal
            return;
        }

        // Add socket id if not already there
        const socketIds = existing.socketIds || [];

        if (!socketIds.includes(socket.id)) socketIds.push(socket.id);

        await Examinee.findByIdAndUpdate(studentId, {
            status: 'active',
            isOnline: true,
            socketId: socket.id
        });

        await emitActiveCount();
    });

    // MANUAL LOGOUT
    socket.on("student_logout", async (studentId) => {
        if (!studentId) return;

        await Examinee.findByIdAndUpdate(studentId, {
            isOnline: false,
            status: "inactive",
            socketIds: []
        });

        await emitActiveCount();

        console.log(`Student ${studentId} logged out manually`);
    });

    // DISCONNECT HANDLE (MOST IMPORTANT)
    socket.on("disconnect", async () => {

        console.log("Disconnected:", socket.id);

        const student = await Examinee.findOne({
            socketIds: socket.id
        });

        if (!student) return;

        // remove this socket
        student.socketIds = student.socketIds.filter(id => id !== socket.id);

        // agar koi socket bacha hi nahi → offline
        if (student.socketIds.length === 0) {
            student.isOnline = false;
            student.status = "inactive";
        }


        await student.save();

        await emitActiveCount();
    });
});


const PORT = process.env.PORT_NO || 5000;

connectDB()
    .then(() => {
        // 6. 'app' ki jagah 'server' ko listen karwayein
        server.listen(PORT, () => {
            console.log(`App is running at port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed");
        process.exit(1);
    });