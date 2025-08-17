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
          backgroundImage: `url('https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      />
      
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-yellow-200 to-orange-200 fixed top-0 left-0 w-full z-40 shadow-lg p-4 flex items-center gap-4 border-b-4 border-yellow-400">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-14 h-14 object-cover rounded-full border-4 border-yellow-500 shadow-md"
        />
        <h1 className="text-3xl font-bold text-yellow-900 tracking-wide">
          VIMALESHWARA JEWELLERS
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-28 px-6">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-gradient-to-r from-white to-yellow-50 rounded-3xl shadow-2xl border-4 border-yellow-300 mb-8">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-4xl font-bold text-yellow-900 mb-4 tracking-wide">
              Welcome to Dashboard
            </h2>
            <p className="text-xl text-yellow-700 font-medium">
              Manage your precious jewellery collection with elegance
            </p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="max-w-2xl mx-auto mb-12">
          {/* Catalogue Card */}
          <div className="group w-full">
            <div className="bg-gradient-to-br from-white to-yellow-50 border-4 border-yellow-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                 onClick={() => navigate("/catalogue")}>
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:animate-bounce">📿</div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-4">
                  Jewellery Catalogue
                </h3>
                <p className="text-yellow-700 mb-6 font-medium">
                  Browse, manage and organize your complete jewellery collection
                </p>
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg group-hover:from-yellow-700 group-hover:to-orange-700 transition-all duration-200 inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Catalogue
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;