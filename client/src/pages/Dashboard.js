import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- ASSETS ---------------- */
const LOGO_URL =
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/desings/logo.png";

const SLIDER_IMAGES = [
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213592580.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213806379.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213902482.png",
];

const BG_IMAGE =
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768214198230.jpeg";

function Dashboard() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  /* -------- Auto Slide -------- */
  useEffect(() => {
    const timer = setInterval(
      () =>
        setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length),
      3500
    );
    return () => clearInterval(timer);
  }, []);

  /* -------- Header Scroll -------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((p) => (p + 1) % SLIDER_IMAGES.length);
  const prevSlide = () =>
    setCurrentSlide((p) =>
      p === 0 ? SLIDER_IMAGES.length - 1 : p - 1
    );

  return (
    <div className="min-h-screen bg-[#fff8e6] text-[#2e2e2e] overflow-x-hidden relative">
      {/* Fonts */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;800&family=Lato:wght@300;400;700&display=swap');`}
      </style>

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e6]/65 via-[#fff8e6]/55 to-[#fff8e6]/90" />
      </div>

      {/* ---------------- HEADER ---------------- */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Vimaleshwara Logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-[#fae382] shadow-sm"
            />
            <div>
              <h1
                className="text-lg md:text-2xl font-bold text-[#7f1a2b]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                VIMALESHWARA
              </h1>
              <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase">
                Jewellers
              </span>
            </div>
          </div>

          {/* Admin */}
          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-semibold text-[#7f1a2b] hover:bg-[#7f1a2b]/10 px-3 py-1.5 rounded-lg"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main className="pt-[76px] relative z-10">
        {/* HERO SLIDER */}
        <section className="relative group">
          {/* Desktop */}
          <div className="hidden md:block w-full aspect-[16/9] max-h-[520px] overflow-hidden relative">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>
            ))}

            {/* MAIN DESKTOP CTA (ONLY ONE) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20">
              <h2
                className="text-5xl font-extrabold mb-4"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Timeless Elegance
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Handcrafted Jewellery Since 1995
              </p>
              <button
                onClick={() => navigate("/user")}
                className="px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition"
                style={{
                  background:
                    "linear-gradient(135deg,#ffcc00,#e6b800)",
                  color: "#2e2e2e",
                }}
              >
                💎 View Catalogue
              </button>
            </div>

            {/* Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
            >
              ›
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden aspect-[4/3] relative overflow-hidden">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mobile CTA */}
        <div className="md:hidden px-4 -mt-6">
          <button
            onClick={() => navigate("/user")}
            className="w-full py-4 rounded-xl text-white font-bold shadow-xl"
            style={{
              background:
                "linear-gradient(135deg,#7f1a2b,#5e1320)",
            }}
          >
            💎 VIEW CATALOGUE
          </button>
        </div>

        {/* WELCOME */}
        <section className="text-center mt-16 px-6 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1 text-xs rounded-full bg-[#fae382]/30 font-bold text-[#7f1a2b]">
            EST. 1995
          </span>
          <h3
            className="text-4xl md:text-6xl font-black mt-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Timeless Elegance
          </h3>
          <p className="mt-4 text-lg opacity-75 max-w-2xl mx-auto">
            Discover handcrafted gold, silver and precious stone
            jewellery designed to last generations.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 mx-4 md:mx-auto max-w-5xl">
          <div className="bg-white/70 backdrop-blur-xl border rounded-3xl p-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-[#7f1a2b] mb-3">
                  📍 Visit Our Store
                </h3>
                <p>
                  Vimaleshwara Jewellers <br />
                  Main Road, Koppa <br />
                  Chikkamagaluru, Karnataka – 577126
                </p>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-[#7f1a2b] mb-3">
                  📞 Contact
                </h3>
                <p>+91 8265 221143</p>
                <p>+91 94482 03199</p>
                <p className="text-sm opacity-70 mt-2">
                  vimaleshwarajewellers@gmail.com
                </p>
              </div>
            </div>

            <p className="text-center text-xs opacity-50 mt-10">
              © {new Date().getFullYear()} VIMALESHWARA JEWELLERS
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
