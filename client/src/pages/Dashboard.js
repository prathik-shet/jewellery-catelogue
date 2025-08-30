import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        }}
      />

      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-yellow-200 to-orange-200 fixed top-0 left-0 w-full z-40 shadow-lg p-4 flex items-center justify-between border-b-4 border-yellow-400">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-14 h-14 object-cover rounded-full border-4 border-yellow-500 shadow-md"
          />
          <h1 className="text-3xl font-bold text-yellow-900 tracking-wide">
            VIMALESHWARA JEWELLERS
          </h1>
        </div>

        {/* Simple Admin Button */}
        <button
          onClick={() => navigate("/admin")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md transition-all"
        >
          Admin Login
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-28 px-6">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-gradient-to-r from-white to-yellow-50 rounded-3xl shadow-2xl border-4 border-yellow-300 mb-8 max-w-3xl mx-auto">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-4xl font-bold text-yellow-900 mb-4 tracking-wide">
              Welcome to Vimaleshwara Jewellers
            </h2>
            <p className="text-lg text-yellow-800 font-medium leading-relaxed">
              At Vimaleshwara Jewellers, every ornament is crafted with
              precision, elegance, and trust. Explore our wide range of
              timeless jewellery collections that blend tradition with
              modern style. Whether it’s a special occasion or everyday
              elegance, we are here to add sparkle to your moments.  
            </p>
          </div>
        </div>

        {/* User Catalogue Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div
            className="bg-gradient-to-br from-white to-yellow-50 border-4 border-yellow-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/user")}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-4">
                User Catalogue
              </h3>
              <p className="text-yellow-700 mb-6 font-medium">
                Browse our jewellery designs with ease and discover pieces
                that reflect your elegance.
              </p>
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
                Enter User Catalogue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
