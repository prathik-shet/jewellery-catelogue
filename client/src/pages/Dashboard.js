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

const MAP_URL =
  "https://www.google.com/maps/place/Vimaleshwara+Jewellers/@13.5364782,75.3646316,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbb14e87902c949:0x9909b22e6458feda!8m2!3d13.5364782!4d75.3672065!16s%2Fg%2F11dy7dxygr?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoASAFQAw%3D%3D";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  /* -------- Auto Slide -------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % SLIDER_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  /* -------- Header Scroll -------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------- Lock scroll when popup open -------- */
  useEffect(() => {
    document.body.style.overflow = popupImage ? "hidden" : "auto";
  }, [popupImage]);

  return (
    <div className="min-h-screen bg-[#fff8e6] text-[#2e2e2e] overflow-x-hidden">
      {/* Fonts */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;800&family=Lato:wght@300;400;700&display=swap');`}
      </style>

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e6]/45 via-[#fff8e6]/55 to-[#fff8e6]/90" />
      </div>

      {/* ---------------- HEADER ---------------- */}
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-white/85"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border border-[#fae382]"
            />
            <div>
              <h1
                className="text-lg md:text-2xl font-bold text-[#7f1a2b]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                VIMALESHWARA JEWELLERS
              </h1>
              <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase">
                Premium Jewellery Collection
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-semibold text-[#7f1a2b]"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main className="pt-[90px] relative z-10">
        {/* HERO */}
        <section className="text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1 text-xs rounded-full bg-[#fae382]/30 font-bold text-[#7f1a2b]">
            EST. 1995
          </span>

          <h2
            className="text-4xl md:text-6xl font-black mt-6"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Timeless Elegance
          </h2>

          <p className="mt-4 text-lg md:text-xl opacity-75">
            Discover handcrafted gold, silver and precious stone jewellery
            designed to last generations.
          </p>

          <div className="mt-8">
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
        </section>

        {/* ================= SLIDER ================= */}
        <section className="mt-16">
          <div className="hidden md:block max-w-6xl mx-auto aspect-[16/9] relative overflow-hidden rounded-3xl shadow-lg cursor-pointer">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setPopupImage(img)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="md:hidden mx-4 aspect-[4/3] relative overflow-hidden rounded-2xl shadow-lg cursor-pointer">
            {SLIDER_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setPopupImage(img)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-24 mx-4 md:mx-auto max-w-5xl">
          <div className="bg-white/70 backdrop-blur-xl border rounded-3xl p-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-[#7f1a2b] mb-3">
                  📍 Visit Our Store
                </h3>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7f1a2b] transition-colors"
                >
                  Vimaleshwara Jewellers <br />
                  Main Road, Koppa <br />
                  Chikkamagaluru, Karnataka – 577126
                </a>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-[#7f1a2b] mb-3">
                  📞 Contact
                </h3>
                <a
                  href="tel:+918265221143"
                  className="block hover:text-[#7f1a2b]"
                >
                  +91 8265 221143
                </a>
                <a
                  href="tel:+919448203199"
                  className="block hover:text-[#7f1a2b]"
                >
                  +91 94482 03199
                </a>
                <a
                  href="mailto:vimaleshwarajewellers@gmail.com"
                  className="block text-sm opacity-70 hover:text-[#7f1a2b] mt-2"
                >
                  vimaleshwarajewellers@gmail.com
                </a>
              </div>
            </div>

            <p className="text-center text-xs opacity-50 mt-10">
              © {new Date().getFullYear()} VIMALESHWARA JEWELLERS
            </p>
          </div>
        </footer>
      </main>

      {/* ================= IMAGE POPUP ================= */}
      {popupImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setPopupImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopupImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold"
            >
              ×
            </button>
            <img
              src={popupImage}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-xl bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
