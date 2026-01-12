import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- ASSETS & CONFIG ---
const LOGO_URL = "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/desings/logo.png";

const SLIDER_IMAGES = [
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213592580.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213806379.png",
  "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768213902482.png"
];

const BG_IMAGE = "https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/custom/1768214198230.jpeg";

function Dashboard() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Auto-slide logic (3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 4000); // Increased slightly to 4s for better UX
    return () => clearInterval(timer);
  }, []);

  // Header scroll effect logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? SLIDER_IMAGES.length - 1 : prev - 1));

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans bg-[#fff8e6] text-[#2e2e2e]">
      
      {/* 1. Google Font Import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Lato:wght@300;400;700&display=swap');`}
      </style>

      {/* 2. Fixed Background with Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.15] grayscale-[20%]"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />
        {/* Soft gradient to blend background into the page color */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e6]/80 via-[#fff8e6]/50 to-[#fff8e6]/90" />
      </div>

      {/* 3. Modern Header */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 md:px-8 py-3 
          ${scrolled ? 'bg-white/80 shadow-md backdrop-blur-lg border-b border-[#fae382]/50' : 'bg-gradient-to-b from-black/40 to-transparent'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src={LOGO_URL} 
              alt="Vimaleshwara Logo" 
              className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-md" 
            />
            <div className="flex flex-col">
              <h1 
                className={`text-lg md:text-2xl font-bold tracking-tight leading-tight transition-colors duration-300
                  ${scrolled ? 'text-[#7f1a2b]' : 'text-white'}`}
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                VIMALESHWARA
              </h1>
              <span className={`text-[10px] md:text-xs tracking-[0.25em] uppercase font-medium transition-colors duration-300
                 ${scrolled ? 'text-[#2e2e2e]' : 'text-white/90'}`}>
                Jewellers
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
             {/* Admin Login (Always Visible) */}
            <button
              onClick={() => navigate("/admin")}
              className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-lg transition-colors
                ${scrolled ? 'text-[#7f1a2b] hover:bg-[#7f1a2b]/5' : 'text-white hover:bg-white/20'}`}
            >
              Admin Login
            </button>
          </div>
        </div>
      </header>

      {/* 4. Main Content */}
      <main className="relative z-10 flex flex-col min-h-screen">
        
        {/* --- HERO CAROUSEL (UNIFIED & IMPROVED) --- */}
        {/* Height Logic:
           - Mobile: h-[65vh] (Taller than before, shows more image)
           - Desktop: h-[85vh] (Cinematic widescreen look)
        */}
        <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden group">
            
            {/* Slider Images */}
            {SLIDER_IMAGES.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={img} 
                  alt={`Slide ${index}`} 
                  className="w-full h-full object-cover" // Ensures proper ratio on all devices
                />
                
                {/* Gradient Overlay:
                   - Essential for text visibility.
                   - Dark at bottom, transparent at top.
                */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
              </div>
            ))}

            {/* --- HERO CONTENT & CATALOGUE BUTTON --- */}
            {/* Positioned absolute bottom-left to avoid blocking the center image */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 pb-12 md:pb-20">
               <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                  
                  {/* Hero Text */}
                  <div className="max-w-2xl animate-fade-in-up">
                    <p className="text-[#ffcc00] tracking-[0.2em] text-xs md:text-sm font-bold uppercase mb-2 md:mb-4 drop-shadow-md">
                      Est. 1995
                    </p>
                    <h2 className="text-4xl md:text-7xl font-serif text-white leading-tight drop-shadow-lg">
                      Timeless <span className="italic font-light text-[#ffcc00]">Elegance</span>
                    </h2>
                    <p className="text-white/80 text-sm md:text-lg mt-4 max-w-md font-light leading-relaxed">
                       Handcrafted perfection in Gold, Silver, and Precious Stones.
                    </p>
                  </div>

                  {/* VIEW CATALOGUE BUTTON (Integrated here instead of middle of screen) */}
                  <button
                    onClick={() => navigate("/user")}
                    className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white overflow-hidden transition-all duration-300 hover:bg-[#7f1a2b] hover:border-[#7f1a2b] rounded-none md:rounded-lg w-full md:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 font-bold tracking-widest text-sm">
                      VIEW CATALOGUE
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#ffcc00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </button>
               </div>
            </div>

            {/* Slider Navigation Arrows (Hidden on mobile for cleaner look) */}
            <div className="hidden md:block">
              <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>

             {/* Dots */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
               {SLIDER_IMAGES.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentSlide(idx)}
                   className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-[#ffcc00] w-8' : 'bg-white/40 w-2 hover:bg-white'}`}
                 />
               ))}
             </div>
        </section>

        {/* --- WELCOME SECTION --- */}
        <div className="text-center px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-6">
            <h2 
              className="text-3xl md:text-5xl font-black text-[#2e2e2e]" 
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Crafting <span className="text-[#7f1a2b]">Memories</span>
            </h2>
            <div className="w-16 h-1 bg-[#ffcc00] mx-auto rounded-full"></div>
            <p className="text-lg md:text-xl text-[#2e2e2e]/70 font-light leading-relaxed">
              Discover our exquisite collection of handcrafted Gold, Silver, and Precious Stone jewellery. 
              Designed to make every moment unforgettable.
            </p>
        </div>

        {/* --- SPACER --- */}
        <div className="flex-grow"></div>

        {/* --- MODERN FOOTER --- */}
        <footer className="mt-auto mx-4 md:mx-auto max-w-6xl w-full mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
             {/* Decorative shine */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#fae382]/20 rounded-full blur-3xl"></div>

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 relative z-10">
              
              {/* Address Column */}
              <div className="text-center md:text-left flex-1">
                 <h3 className="text-lg font-bold text-[#7f1a2b] mb-4 flex items-center justify-center md:justify-start gap-2 font-serif">
                   <span>📍</span> Visit Our Store
                 </h3>
                 <p className="text-[#2e2e2e] leading-relaxed opacity-80 text-sm md:text-base">
                   Vimaleshwara Jewellers<br/>
                   Main Road, Koppa<br/>
                   Chickmaglore Dist, Karnataka – 577126
                 </p>
                 <a
                  href="https://www.google.com/maps/place/Vimaleshwara+Jewellers/@13.5364704,75.3646234,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbb14e87902c949:0x9909b22e6458feda!8m2!3d13.5364704!4d75.3671983!16s%2Fg%2F11dy7dxygr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs font-bold text-[#7f1a2b] border-b border-[#7f1a2b] hover:text-[#5e1320] hover:border-[#5e1320] transition-colors uppercase tracking-wider"
                 >
                   Get Directions →
                 </a>
              </div>

              {/* Divider for Desktop */}
              <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent h-32"></div>

              {/* Contact Column */}
              <div className="text-center md:text-left flex-1">
                 <h3 className="text-lg font-bold text-[#7f1a2b] mb-4 flex items-center justify-center md:justify-start gap-2 font-serif">
                   <span>📞</span> Contact Us
                 </h3>
                 <div className="space-y-3 text-sm md:text-base">
                   <a href="tel:+918265221143" className="block text-[#2e2e2e] hover:text-[#7f1a2b] transition-colors font-medium">
                     +91 8265-221143
                   </a>
                   <a href="tel:+919448203199" className="block text-[#2e2e2e] hover:text-[#7f1a2b] transition-colors font-medium">
                     +91 94482-03199
                   </a>
                   <a href="mailto:vimaleshwarajewellers@gmail.com" className="block text-[#2e2e2e]/60 hover:text-[#7f1a2b] transition-colors mt-2">
                     vimaleshwarajewellers@gmail.com
                   </a>
                 </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200/50 text-center">
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} VIMALEHSWARA JEWELLERS. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default Dashboard;