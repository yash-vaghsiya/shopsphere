import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SLIDES = [
  {
    id: 1,
    name: "Zenith Carbon-V X-1 Watch",
    brand: "Zenith",
    price: "₹14,999",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    category: "Wearables",
    description: "Exquisite carbon fiber chassis with custom biometric tracking sensors and 7-day technical energy reserve.",
    rating: "4.8",
    reviews: 218,
    badge: "Top Seller",
    link: "/product/1",
  },
  {
    id: 2,
    name: "Aerial Nova Soundbuds",
    brand: "AuraTone",
    price: "₹7,499",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    category: "Audio",
    description: "True-audio hi-res spatial acoustics wireless earbuds with hybrid ANC 45dB and 36hr high-res streaming.",
    rating: "4.9",
    reviews: 164,
    badge: "Best Value",
    link: "/product/2",
  },
  {
    id: 3,
    name: "Vortex Apex Mechanical Keyboard",
    brand: "Crescent Labs",
    price: "₹6,200",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    category: "Accessories",
    description: "Modular mechanical switches with dynamic lighting profiles and premium alloy chassis.",
    rating: "4.7",
    reviews: 138,
    badge: "Fan Favorite",
    link: "/product/3",
  }
];

export const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-55 via-white to-gray-55/40 dark:from-gray-955 dark:via-gray-950 dark:to-gray-955/65 transition-colors py-16 md:py-28">
      {/* Visual Ambient Blur Accents */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full filter blur-[120px] opacity-70"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full filter blur-[120px] opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Headings & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest select-none">
              <Sparkles size={11} className="animate-pulse" />
              Elite Curated Collections
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.05]">
              Experience Ultimate 
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500">
                Premium Shopping
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              Step inside ShopSphere—your personalized shopping suite. Explore a handpicked catalog of designer wearables, masterwork electronics, and premium lifestyle goods built for elite tastes.
            </p>

            {/* Direct Routing Action Triggers */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 duration-200"
              >
                Explore Luxury Catalog
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#offer-banner-section"
                className="inline-flex items-center justify-center px-5.5 py-3.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs uppercase tracking-wider rounded-xl bg-white/40 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm active:scale-95 duration-200"
              >
                <span>Promo Vouchers</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-150 dark:border-gray-850/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 justify-center lg:justify-start text-left">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">100% Genuine</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Authorized Brands Only</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 justify-center lg:justify-start text-left">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                  <Truck size={16} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">Free Delivery</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Priority Order Dispatch</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 justify-center lg:justify-start text-left">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">Easy Return</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">No-Hassle 30-Day Policy</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Prominent Highlight Product Visual Card with Auto-Slideshow (Images Only) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl transition-shadow duration-300 hover:shadow-2xl group/card aspect-square"
            >
              {/* Carousel Content Transition Wrapper */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full"
                >
                  <Link 
                    to={currentSlide.link} 
                    className="block w-full h-full relative bg-gray-50/50 dark:bg-gray-955/30"
                    title={`View ${currentSlide.name}`}
                  >
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover/card:scale-103"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Hover Navigation Chevrons */}
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover/card:opacity-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer border border-neutral-100 dark:border-neutral-800 z-10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover/card:opacity-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer border border-neutral-100 dark:border-neutral-800 z-10"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Quick-select Navigation Dots Indicator */}
            <div className="flex items-center gap-2 mt-4">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
