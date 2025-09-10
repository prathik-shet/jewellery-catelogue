import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        }}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-200 to-orange-200/90 backdrop-blur-sm fixed top-0 left-0 w-full z-40 shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between border-b-4 border-yellow-400">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full border-4 border-yellow-500 shadow-md"
          />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-yellow-900 tracking-wide drop-shadow">
            VIMALESHWARA JEWELLERS
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
        >
          Admin Login
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 px-4 sm:px-6 pb-20">
        {/* Welcome Section */}
        <section className="max-w-3xl mx-auto text-center mb-16 px-2 sm:px-6">
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-3xl font-extrabold text-yellow-900 mb-4 tracking-wide">
            Welcome to Vimaleshwara Jewellers
          </h2>
          <p className="text-base sm:text-lg text-yellow-800 font-medium leading-relaxed">
            Fine Gold, Silver & Stone Jewellery since 1995. Trust, quality, and elegance in every piece.
          </p>
        </section>

        {/* User Catalogue */}
        <section className="max-w-2xl mx-auto mb-16">
          <div
            className="bg-white/70 backdrop-blur-lg border border-yellow-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate("/user")}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-3">
                Jewellery Catalogue
              </h3>
              <p className="text-yellow-700 mb-6 font-medium text-base leading-relaxed">
                Explore elegant designs made for every occasion.
              </p>
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl">
                View Catalogue
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-yellow-900 mb-5">
            📍 Contact Us
          </h3>
          <p className="text-yellow-800 font-medium leading-relaxed mb-3">
            Vimaleshwara Jewellers<br />
            Main Road, Koppa<br />
            Chickmaglore District, Karnataka – 577126
          </p>
          <p className="text-yellow-800 font-medium mb-2">
            📧{" "}
            <a href="mailto:vimaleshwarajewellers@gmail.com" className="underline hover:text-yellow-600">
              vimaleshwarajewellers@gmail.com
            </a>
          </p>
          <p className="text-yellow-800 font-medium mb-1">
            📞{" "}
            <a href="tel:+918265221143" className="underline hover:text-yellow-600">
              +91 8265-221143
            </a>
          </p>
          <p className="text-yellow-800 font-medium">
            📱{" "}
            <a href="tel:+919448203199" className="underline hover:text-yellow-600">
              +91 94482-03199
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
