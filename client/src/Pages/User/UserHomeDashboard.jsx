import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AttemptedPassedGraph } from "../../Components/AttemptedPassedGraph";
import { BookOpen, Trophy, Clock, ArrowRight, XCircle, CheckCircle } from 'lucide-react';
import { server_url } from "../../App";

export const UserHomeDashboard = () => {

  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      console.log("Fetching server url", server_url);
      const res = await axios.get(`${server_url}/api/userdashboard/std-dashboard`, {
        withCredentials: true
      });

      if (res.data.success) {
        setStatsData(res.data.data);
        console.log("statesd data :", res.data.data)
      }

    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Loading UI
  if (loading || !statsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  // Stats Cards
  const stats = [
    {
      label: 'Total Exams',
      value: statsData.totalExams,
      icon: <BookOpen className="text-blue-600" />,
      bg: 'bg-blue-100'
    },
    {
      label: 'Attempted',
      value: statsData.attemptedCount,
      icon: <Trophy className="text-yellow-600" />,
      bg: 'bg-yellow-100'
    },
    {
      label: 'Missed',
      value: statsData.missedCount,
      icon: <Clock className="text-purple-600" />,
      bg: 'bg-purple-100'
    },
    {
      label: 'Passed',
      value: statsData.passedCount,
      icon: <CheckCircle className="text-green-600" />,
      bg: 'bg-green-100'
    },
    {
      label: 'Failed',
      value: statsData.failedCount,
      icon: <XCircle className="text-red-600" />,
      bg: 'bg-red-100'
    }
  ];

  // Performance %
  const performance = statsData.attemptedCount > 0
    ? Math.round((statsData.passedCount / statsData.attemptedCount) * 100)
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome Back, <span className="text-indigo-600">Student!</span>
          </h2>
          <p className="text-gray-500">
            Here's your performance overview and exam activity.
          </p>
        </div>

        {/* 🔥 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
              <div className={`${stat.bg} p-4 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 📊 Graph */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Performance Overview</h3>
              <span className="text-sm text-gray-500">
                Success Rate: <b>{performance}%</b>
              </span>
            </div>

            <div className="h-80">
              <AttemptedPassedGraph
                attempted={statsData.attemptedCount}
                passed={statsData.passedCount}
                failed={statsData.failedCount}
              />
            </div>
          </div>

          {/* ⚡ Right Side */}
          <div className="space-y-6">

            {/* CTA */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2">Ready for next exam?</h3>
              <p className="text-sm mb-4">
                Don't miss your upcoming tests. Stay prepared!
              </p>
              <button
                onClick={() => navigate('/userdashboard/myexams')}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50"
              >
                Go to Exams <ArrowRight size={18} />
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold mb-4">Exam Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Read questions carefully</li>
                <li>Manage time wisely</li>
                <li>Stay calm and focused</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};