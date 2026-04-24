import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminLogin } from './Pages/Admin/AdminLogin'
import { AdminRegister } from './Pages/Admin/adminRegistration';
import { AdminDashboard } from './Pages/Admin/AdminDashboard';
import { ProtectedRoute } from './Components/ProtectedRoute';
import { AdminDashboardHome } from './Pages/Admin/AdminDashboardHome';
import { AdminChangePassword } from './Pages/Admin/AdminChangePassword';
import { Examination } from './Pages/Admin/Examination';
import { Session } from './Pages/Admin/Session';
import { Subject } from './Pages/Admin/Subject';
import { Examinee } from './Pages/Admin/Examinee';
import { QuestionBank } from './Pages/Admin/QuestionBank';
import { MessageReply } from './Pages/Admin/MessageReply';
import { UserLogin } from './Pages/User/UserLogin';
import { UserRegister } from './Pages/User/UserRegister';
import { UserDashboard } from './Pages/User/UserDashboard';
import { ProtectedRouteUser } from './Components/ProtectedRouteUser';
import { Myexams } from './Pages/User/MyExams';
import { GetExams } from './Pages/User/GetExams';
import { Result } from './Pages/User/Result';
import { UserHomeDashboard } from './Pages/User/UserHomeDashboard';
import { Profile } from './Pages/User/Profile';
import { Message } from './Pages/User/Message';
import { ChangePassword } from './Pages/User/ChangePassword';
import { ResultDetails } from './Pages/User/ResultDetails';
import { AdvancedReport } from './Pages/Admin/AdvancedReport';
import { useEffect } from 'react';
import { socket } from './socket';

export const server_url = "https://digital-examination-system-1.onrender.com";

const App = () => {
  // socket connect for live count
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id && !socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?._id) {
          console.log("Tab Active → reconnect");

          if (!socket.connected) {
            socket.connect();
          } else {
            // force emit (important)
            socket.emit("student_online", user._id);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* User Route */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/userregister" element={<UserRegister />} />
        <Route path="/userdashboard" element={<ProtectedRouteUser> <UserDashboard /></ProtectedRouteUser>} >
          <Route index element={<UserHomeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="myexams" element={<Myexams />} />
          <Route path="result" element={<Result />} />
          <Route path="message" element={<Message />} />
          <Route path="changepassword/:id" element={<ChangePassword />} />
        </Route>

        <Route path="getexam/:id" element={<GetExams />} />
        <Route path="/result-details/:id" element={<ResultDetails />} />

        {/* Admin route */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/adminregister" element={<AdminRegister />} />

        <Route path="/admindashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} >
          <Route index element={<AdminDashboardHome />} />
          <Route path="session" element={<Session />} />
          <Route path="subject" element={<Subject />} />
          <Route path="examinee" element={<Examinee />} />
          <Route path="question" element={<QuestionBank />} />
          <Route path="examination" element={<Examination />} />
          <Route path="reportgeneration" element={<AdvancedReport />} />
          <Route path="adminChangePassword" element={<AdminChangePassword />} />
          <Route path="messagereply" element={<MessageReply />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
