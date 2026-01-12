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
    }, 3000);
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
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;800&family=Lato:wght@300;400;700&display=swap');`}
      </style>

      {/* 2. Fixed Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 grayscale-[30%]"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff8e6]/80 via-[#fff8e6]/60 to-[#fff8e6]/90" />
      </div>

      {/* 3. Modern Header */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 md:px-8 py-2 
          ${scrolled ? 'bg-white/90 shadow-md backdrop-blur-md border-b border-[#fae382]' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src={LOGO_URL} 
              alt="Vimaleshwara Logo" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm" 
            />
            <div className="flex flex-col">
              <h1 
                className="text-lg md:text-2xl font-bold tracking-tight text-[#7f1a2b] leading-tight" 
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                VIMALEHSWARA
              </h1>
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#2e2e2e] font-medium">
                Jewellers
              </span>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/user")}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #7f1a2b 0%, #5e1320 100%)', 
                color: '#fff' 
              }}
            >
              <span>View Catalogue</span>
              <svg className="w-4 h-4 text-[#ffcc00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="text-[#7f1a2b] font-semibold text-xs md:text-sm hover:bg-[#7f1a2b]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>
      </header>

      {/* 4. Main Content */}
      <main className="relative z-10 pt-[70px] md:pt-[80px] pb-12 flex flex-col min-h-screen">
        
        {/* --- HERO CAROUSEL --- */}
        <section className="w-full relative group">
           {/* Desktop View (Cinematic Ratio) */}
           <div className="hidden md:block w-full h-[500px] relative overflow-hidden bg-gray-50 shadow-inner">
              {SLIDER_IMAGES.map((img, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                   <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover object-center" />
                   {/* Dark Gradient Overlay for text readability if needed */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ))}
           </div>

           {/* Mobile View (Aspect Ratio Optimised) */}
           <div className="block md:hidden w-full aspect-[4/3] relative overflow-hidden bg-gray-50 shadow-sm">
              {SLIDER_IMAGES.map((img, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                   <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
           </div>

           {/* Navigation Arrows */}
           <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 duration-300">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
           </button>
           <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 duration-300">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
           </button>
           
           {/* Modern Dots */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
             {SLIDER_IMAGES.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => setCurrentSlide(idx)}
                 className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-[#ffcc00] w-8' : 'bg-white/60 w-2 hover:bg-white'}`}
               />
             ))}
           </div>
        </section>

        {/* --- MOBILE CATALOGUE CTA (Sticky Look) --- */}
        <div className="md:hidden relative -mt-6 z-20 px-4">
            <button
              onClick={() => navigate("/user")}
              className="w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transform active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #7f1a2b 0%, #5e1320 100%)' }}
            >
              <span className="text-xl">💎</span>
              <span className="tracking-wide">VIEW CATALOGUE</span>
            </button>
        </div>

        {/* --- WELCOME CONTENT --- */}
        <div className="text-center px-6 mt-12 md:mt-16 max-w-4xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#fae382]/20 text-[#7f1a2b] text-xs font-bold tracking-widest uppercase mb-2 border border-[#fae382]/50">
              Est. 1995
            </div>
            <h2 
              className="text-4xl md:text-6xl font-black text-[#2e2e2e]" 
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="text-[#7f1a2b]">Timeless</span> Elegance
            </h2>
            <div className="w-24 h-1 bg-[#ffcc00] mx-auto rounded-full my-4"></div>
            <p className="text-lg md:text-xl text-[#2e2e2e]/70 font-light leading-relaxed max-w-2xl mx-auto">
              Discover our exquisite collection of handcrafted Gold, Silver, and Precious Stone jewellery. 
              Designed to make every moment unforgettable.
            </p>
        </div>

        {/* --- SPACER --- */}
        <div className="flex-grow min-h-[100px]"></div>

        {/* --- MODERN FOOTER --- */}
        <footer className="mt-12 mx-4 md:mx-auto max-w-5xl w-full">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              
              {/* Address Column */}
              <div className="text-center md:text-left flex-1">
                 <h3 className="text-lg font-bold text-[#7f1a2b] mb-4 flex items-center justify-center md:justify-start gap-2">
                   <span>📍</span> Visit Our Store
                 </h3>
                 <p className="text-[#2e2e2e] leading-relaxed opacity-80">
                   Vimaleshwara Jewellers<br/>
                   Main Road, Koppa<br/>
                   Chickmaglore Dist, Karnataka – 577126
                 </p>
                 <a
                  href="https://www.google.com/maps/place/Vimaleshwara+Jewellers/@13.5364704,75.3646234,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbb14e87902c949:0x9909b22e6458feda!8m2!3d13.5364704!4d75.3671983!16s%2Fg%2F11dy7dxygr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs font-bold text-[#7f1a2b] border-b border-[#7f1a2b] hover:opacity-70 transition-opacity uppercase tracking-wider"
                 >
                   Get Directions →
                 </a>
              </div>

              {/* Divider for Desktop */}
              <div className="hidden md:block w-px bg-gray-200 h-32"></div>

              {/* Contact Column */}
              <div className="text-center md:text-left flex-1">
                 <h3 className="text-lg font-bold text-[#7f1a2b] mb-4 flex items-center justify-center md:justify-start gap-2">
                   <span>📞</span> Contact Us
                 </h3>
                 <div className="space-y-3">
                   <a href="tel:+918265221143" className="block text-[#2e2e2e] hover:text-[#7f1a2b] transition-colors font-medium">
                     +91 8265-221143
                   </a>
                   <a href="tel:+919448203199" className="block text-[#2e2e2e] hover:text-[#7f1a2b] transition-colors font-medium">
                     +91 94482-03199
                   </a>
                   <a href="mailto:vimaleshwarajewellers@gmail.com" className="block text-sm text-[#2e2e2e]/60 hover:text-[#7f1a2b] transition-colors mt-2">
                     vimaleshwarajewellers@gmail.com
                   </a>
                 </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                © {new Date().getFullYear()} VIMALEHSWARA JEWELLERS. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default Dashboard;