import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const AttemptedPassedGraph = ({ attempted, passed, failed }) => {

  const data = [
    {
      name: "Exams",
      Attempted: attempted || 0,
      Passed: passed || 0,
      Failed: failed || 0,
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-8">

      <h3 className="text-xl font-semibold text-gray-700 mb-6">
        Attempted vs Passed Exams
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar dataKey="Attempted" fill="#3b82f6" radius={[6,6,0,0]} />

          <Bar dataKey="Passed" fill="#22c55e" radius={[6,6,0,0]} />

          <Bar dataKey="Failed" fill="#ef4444" radius={[6,6,0,0]} />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};
