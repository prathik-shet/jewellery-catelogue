import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const sliderImages = [
  {
    img: "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213592580.png",
    title: "Timeless Gold Jewellery",
    subtitle: "Crafted with purity & tradition",
  },
  {
    img: "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213806379.png",
    title: "Wedding & Bridal Collections",
    subtitle: "Designed for your special moments",
  },
  {
    img: "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213902482.png",
    title: "Elegant Daily Wear",
    subtitle: "Luxury that feels effortless",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  /* Auto Fade */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Swipe Handlers */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIndex((i) => (i + 1) % sliderImages.length);
    if (diff < -50)
      setIndex((i) => (i - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage:
          "url('https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768214198230.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#fff8e6]/90"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-yellow-200 to-orange-200 shadow-md px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-11 h-11 rounded-full" />
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2e2e2e",
            }}
          >
            VIMALESHWARA JEWELLERS
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="bg-[#7f1a2b] text-white px-4 py-1.5 rounded-md text-sm"
        >
          Admin
        </button>
      </header>

      <main className="relative z-10 pt-20 px-4 pb-20">
        {/* Catalogue Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate("/user")}
            className="bg-[#7f1a2b] text-white px-6 py-2 rounded-full text-sm shadow hover:shadow-lg transition"
          >
            View Catalogue
          </button>
        </div>

        {/* Slider */}
        <section
          className="max-w-6xl mx-auto relative rounded-2xl overflow-hidden shadow-xl"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {sliderImages.map((item, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === index ? "opacity-100 z-20" : "opacity-0 z-10"
              }`}
            >
              <img
                src={item.img}
                className="w-full h-[230px] sm:h-[420px] object-cover"
              />

              {/* Text Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                <div className="p-6 sm:p-10 text-white">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-1">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-lg opacity-90">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2 z-30">
            {sliderImages.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === index ? "bg-[#ffcc00]" : "bg-white/60"
                }`}
              ></span>
            ))}
          </div>
        </section>
      </main>

      {/* WhatsApp Banner – Mobile */}
      <a
        href="https://wa.me/919448203199"
        className="fixed bottom-0 left-0 w-full sm:hidden bg-[#25D366] text-white flex items-center justify-center gap-2 py-3 font-semibold z-50"
      >
        <span>💬</span> Chat on WhatsApp
      </a>

      {/* WhatsApp Floating – Desktop */}
      <a
        href="https://wa.me/919448203199"
        className="hidden sm:flex fixed bottom-6 right-6 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-xl items-center gap-2 z-50"
      >
        💬 WhatsApp
      </a>
    </div>
  );
}

export default Dashboard;
