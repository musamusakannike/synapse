import React from "react";
import { Home, Plus, Book, Settings } from "lucide-react";
import Link from "next/link";
const Sidebar = () => {
  return (
    <div className="w-80 transition-all duration-300 ease-in-out flex flex-col h-screen pt-2 lg:pt-4 px-4">
      <div className="flex items-center justify-between mb-8">
        <h6 className="font-medium text-lg">Hi, Musa</h6>
        <button className="bg-blue-200 opacity-80 hover:opacity-50 transition-all duration-300 ease-in-out text-blue-600 rounded-lg px-3 py-1 flex items-center gap-x-1 font-semibold text-base">
          Create
          <Plus className=" text-blue-600" size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-y-2">
        <Link href="/dashboard" className="flex items-center gap-x-2">
          <Home size={18} className="text-gray-800" />
          <span className="">Home</span>
        </Link>
        <Link href="/topics" className="flex items-center gap-x-2">
          <Book size={18} className="text-gray-800" />
          <span className="">Topics</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-x-2">
          <Settings size={18} className="text-gray-800" />
          <span className="">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
