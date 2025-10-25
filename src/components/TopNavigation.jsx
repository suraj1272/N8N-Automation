import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, LogOut, Search, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";

function TopNavigation({ onLogout }) {
  const { logout } = useAuth();
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              Learning App
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:backdrop-blur-sm">
                <Home size={18} />
                Dashboard
              </Link>
              <Link to="/search" className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:backdrop-blur-sm">
                <Search size={18} />
                Search
              </Link>
              <Link to="/my-topics" className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:backdrop-blur-sm">
                <BookOpen size={18} />
                My Topics
              </Link>
            </nav>
          </div>
          <Button size="sm" onClick={logout} className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:shadow-md">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TopNavigation;
