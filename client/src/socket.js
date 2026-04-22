import { io } from "socket.io-client";
const server_url = import.meta.env.VITE_SERVER_URL;

export const socket = io(server_url, {
    withCredentials: true,
    autoConnect: false
});

// ONLY HERE EMIT
socket.on("connect", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id) {
        console.log("AUTO EMIT:", user._id);
        socket.emit("student_online", user._id);
    }
});