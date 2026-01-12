import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- CONFIG ---------------- */
const LOGO_URL =
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/desings/logo.png";

const SLIDER_IMAGES = [
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213592580.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213806379.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213902482.png",
];

const BG_IMAGE =
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768214198230.jpeg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  /* -------- Auto Slide -------- */
  useEffect(() => {
    const timer = setInterval(
      () =>
        setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  /* -------- Header Scroll -------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fff8e6] text-[#2e2e2e] relative overflow-x-hidden">
      {/* Fonts */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=Lato:wght@300;400;700&display=swap');`}
      </style>

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e6]/70 via-[#fff8e6]/60 to-[#fff8e6]/95" />
      </div>

      {/* ---------------- HEADER ---------------- */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-2">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border border-[#fae382] shadow-sm"
            />
            <div>
              <h1
                className="text-xl md:text-2xl font-bold text-[#7f1a2b]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                VIMALESHWARA
              </h1>
              <p className="text-[11px] tracking-[0.3em] uppercase">
                Jewellers
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/user")}
              className="hidden md:flex px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:scale-[1.03] transition"
              style={{
                background:
                  "linear-gradient(135deg,#7f1a2b,#5e1320)",
              }}
            >
              View Catalogue
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-semibold text-[#7f1a2b]"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SLIDER ---------------- */}
      <main className="pt-[76px]">
        {/* Desktop Slider */}
        <section className="relative hidden md:block">
          <div className="w-full aspect-[16/9] max-h-[520px] overflow-hidden relative">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-1000 ${
                  i === currentSlide
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 z-0"
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

            {/* MAIN CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20">
              <h2
                className="text-5xl font-extrabold mb-4"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                Timeless Elegance
              </h2>
              <p className="mb-6 text-lg opacity-90">
                Handcrafted Gold Jewellery Since 1995
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
                💎 View Full Catalogue
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Slider */}
        <section className="md:hidden relative">
          <div className="aspect-[4/3] relative overflow-hidden">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === currentSlide
                    ? "opacity-100"
                    : "opacity-0"
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

          {/* Sticky Mobile CTA */}
          <div className="px-4 -mt-6 relative z-20">
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
        </section>

        {/* ---------------- WELCOME ---------------- */}
        <section className="text-center mt-16 px-6 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 text-xs rounded-full bg-[#fae382]/30 font-bold text-[#7f1a2b]">
            EST. 1995
          </span>
          <h3
            className="text-4xl md:text-5xl font-extrabold mt-4"
            style={{
              fontFamily: "Playfair Display, serif",
            }}
          >
            Crafted With Love
          </h3>
          <p className="mt-4 text-lg opacity-75">
            Discover premium gold, silver & gemstone jewellery —
            where tradition meets modern elegance.
          </p>
        </section>

        {/* Footer spacing */}
        <div className="h-24" />
      </main>
    </div>
  );
}
