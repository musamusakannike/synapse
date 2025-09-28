import Sidebar from "@/components/Sidebar";
import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex overflow-x-hidden w-full py-2 lg:py-4">
      <Sidebar />

      <main className="w-full mx-auto overflow-y-auto bg-white border border-gray-200 lg:rounded-lg p-4"></main>
    </div>
  );
};

export default Dashboard;
