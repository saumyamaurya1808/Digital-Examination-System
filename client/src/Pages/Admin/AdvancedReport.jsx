import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Download, Search, Eye, X, Filter,
  ChevronLeft, ChevronRight, GraduationCap,
  Calendar, BookOpen, User
} from "lucide-react";

export const AdvancedReport = () => {
  // --- States ---
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Detail Modal ke liye
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sessionId: "",
    course: "",
    branch: "",
    year: "",
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1
  });

  const [allSessions, setAllSessions] = useState([]);

  // Master data fetch karne ke liye (Dropdowns ke liye)
  const handlefetchSession = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/session", { withCredentials: true });
      setAllSessions(res.data.result);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  /* ================= CASCADING LOGIC ================= */
  // 1. Unique Sessions
  const availableSessions = [...new Set(allSessions.map(s => s.name))];

  // 2. Filter Courses based on Session
  const availableCourses = [...new Set(allSessions
    .filter(s => s.name === filters.sessionId)
    .map(s => s.course))];

  // 3. Filter Branches based on Session & Course
  const availableBranches = [...new Set(allSessions
    .filter(s => s.name === filters.sessionId && s.course === filters.course)
    .map(s => s.branch))];

  // 4. NEW: Filter Years based on Session, Course, AND Branch
  const availableYears = [...new Set(allSessions
    .filter(s =>
      s.name === filters.sessionId &&
      s.course === filters.course &&
      s.branch === filters.branch
    )
    .map(s => s.year))];


  useEffect(() => {
    handlefetchSession();
  }, []);

  // --- API Call ---
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/exams/report", {
        params: filters
      });
      if (res.data.success) {
        setReports(res.data.data);
        setPagination(res.data.pagination);
        console.log("report data: ", res.data)
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReports();
    }, 500); // 500ms debounce for search
    return () => clearTimeout(delayDebounceFn);
  }, [fetchReports]);

  // --- Handlers ---
  const handleExportExcel = () => {
    const queryParams = new URLSearchParams({ ...filters, exportExcel: "true" }).toString();
    window.location.href = `http://localhost:5000/api/exams/report?${queryParams}`;
  };

  const updateFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">EXAMINEE ANALYTICS</h1>
            <p className="text-slate-500 font-medium">Manage and export detailed performance reports</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Download size={20} /> Export Master Excel
          </button>
        </div>

        {/* --- Filters Grid --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

          {/* SEARCH */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              name="search"
              placeholder="Search name/email/exam title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={updateFilter}
            />
          </div>

          {/* SESSION DROPDOWN */}
          <select
            name="sessionId"
            value={filters.sessionId}
            onChange={(e) => setFilters({ ...filters, sessionId: e.target.value, course: "", branch: "", page: 1 })}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          >
            <option value="">All Sessions</option>
            {availableSessions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* COURSE DROPDOWN */}
          <select
            name="course"
            value={filters.course}
            disabled={!filters.sessionId}
            onChange={(e) => setFilters({ ...filters, course: e.target.value, branch: "", page: 1 })}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Course</option>
            {availableCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          {/* BRANCH DROPDOWN */}
          <select
            name="branch"
            value={filters.branch}
            disabled={!filters.course}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value, page: 1 })}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
          >
            <option value="">Select Branch</option>
            {availableBranches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          {/* NEW: YEAR DROPDOWN (Ye add karna hai) */}
          <select
            name="year"
            value={filters.year}
            disabled={!filters.branch}
            onChange={updateFilter}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
          >
            <option value="">Select Year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* --- Main Table Section --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Examinee Details</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Context</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Subjects</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Final Score</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">Processing records...</td></tr>
                ) : reports.length > 0 ? (
                  reports.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                            {item.examinee?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.examinee?.name}</p>
                            <p className="text-sm text-slate-500">{item.examinee?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <p className="font-semibold text-slate-700">{item.exam?.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{item.examinee?.branch}</span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{item.examinee?.course}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <p className="font-semibold text-slate-700">{item.examinee.session}</p>
                      </td>
                      <td className="p-4 text-center">
                        {
                          item.subjectDetails.map((subject) => (
                            <span
                              key={subject._id}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black tracking-wide uppercase border border-purple-200 m-auto ml-0.5"
                            >
                              {subject?.name}
                            </span>
                          ))
                        }
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-lg font-black text-slate-800">{item.score}/{item.totalMarks}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Obtained Marks</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase ${item.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-20 text-slate-400">No records found matching your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination --- */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{reports.length}</span> of <span className="text-slate-900 font-bold">{pagination.total}</span> records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                    className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${filters.page === i + 1 ? 'bg-purple-600 text-white' : 'bg-white border text-slate-600 hover:border-purple-400'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(0, 5)} {/* Show only first 5 pages for brevity */}
              </div>
              <button
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Detailed Modal --- */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="p-8 bg-gradient-to-r from-purple-700 to-indigo-800 text-white relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-6 top-6 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="h-20 w-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-black border border-white/30">
                  {selectedItem.examinee?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedItem.examinee?.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-purple-100 font-medium">
                    <span className="flex items-center gap-1.5"><GraduationCap size={16} /> {selectedItem.examinee?.course}</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={16} /> {selectedItem.examinee?.branch}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> Session {selectedItem.examinee?.session || '2024'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-slate-50/50">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Result</p>
                  <p className={`text-3xl font-black ${selectedItem.status === 'Passed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedItem.status}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                  <p className="text-3xl font-black text-purple-700">
                    {selectedItem.score} <span className="text-slate-300 font-medium text-xl">/ {selectedItem.totalMarks}</span>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                  <p className="text-3xl font-black text-blue-600">
                    {((selectedItem.score / selectedItem.totalMarks) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Detailed Responses */}
              <div className="flex items-center gap-2 mb-4">
                <Filter className="text-purple-600" size={20} />
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Response Sheet Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItem.submittedAnswers?.map((ans, idx) => {
                  const fullQuestion = selectedItem.questionDetails?.find(
                    (q) => q._id === ans.questionId
                  );
                  return (
                    <div
                      key={idx}
                      className={`p-5 border rounded-2xl flex flex-col gap-3 transition-all ${ans.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                          QUESTION #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${ans.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                          }`}>
                          {ans.isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>
                      {/* QUESTION TEXT ADD KIYA GAYA HAI */}
                      <div className="text-sm font-bold text-slate-700 leading-relaxed">
                        {fullQuestion ? fullQuestion.question : "Question text not found"}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                          <span className="text-xs text-slate-400 font-bold">YOUR CHOICE</span>
                          <span className={`font-bold ${ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{ans.selectedOption}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                          <span className="text-xs text-slate-400 font-bold">CORRECT KEY</span>
                          <span className="font-bold text-indigo-700">{ans.correctOption}</span>
                        </div>
                      </div>
                    </div>)
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
