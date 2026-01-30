import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';
import Footer from './Footer';
import Testimonials from './Testimonials';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeCrop, setActiveCrop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const stepsRef = useRef(null);
  const statsRef = useRef(null);
  const marqueeRef = useRef(null);
  const featuresMarqueeRef = useRef(null);
  const cropCarouselRef = useRef(null);

  const testimonials = [
    {
      name: "Rajesh Patel",
      location: "Gujarat",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      quote: "AuraFarm transformed my farming business. I now earn 45% more than before by selling directly to buyers.",
      crop: "Cotton",
      increase: "+45%"
    },
    {
      name: "Suresh Kumar",
      location: "Punjab",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      quote: "The price forecasting feature helped me decide the perfect time to sell my wheat. Incredible technology!",
      crop: "Wheat",
      increase: "+38%"
    },
    {
      name: "Anita Devi",
      location: "Maharashtra",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      quote: "As a woman farmer, AuraFarm gave me the confidence to negotiate better prices. The support team is amazing.",
      crop: "Soybean",
      increase: "+52%"
    },
    {
      name: "Mohammed Ismail",
      location: "Karnataka",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      quote: "Real-time market prices on my phone changed everything. No more relying on middlemen for information.",
      crop: "Rice",
      increase: "+41%"
    }
  ];

  const crops = [
    { name: "Wheat", price: "2,450", change: "+12%", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { name: "Rice", price: "3,200", change: "+8%", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { name: "Cotton", price: "6,800", change: "+15%", image: "https://media.istockphoto.com/id/589121090/photo/branch-of-ripe-cotton.jpg?s=612x612&w=0&k=20&c=eGlf6UISNaZRIKxnoesMIIpOqzevDWtb_OoU_0KVN_M=" },
    { name: "Soybean", price: "4,100", change: "+5%", image: "https://realnatural.in/wp-content/uploads/2024/07/8c8845b2-4e31-49e2-9953-f72c9d517739_1655577596328.jpg" },
    { name: "Sugarcane", price: "350", change: "+3%", image: "https://media.istockphoto.com/id/528316683/photo/close-up-sugarcane.jpg?s=612x612&w=0&k=20&c=lMadBE2UFxjwhTkE4caG664ZXMnStIaISZ0b6csxL8M=" },
  ];

  const partners = [
    "National Bank for Agriculture",
    "State Agricultural Marketing Board",
    "Farmers Cooperative Society",
    "AgriTech Innovation Hub",
    "Rural Development Ministry",
    "Organic Farmers Association"
  ];

  useEffect(() => {
    // Hero animations with stagger
    const heroTimeline = gsap.timeline({ delay: 0.3 });
    heroTimeline
      .fromTo('.hero-badge', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo('.hero-title-line', { y: 100, opacity: 0, rotateX: -45 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.15 }, '-=0.3')
      .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-buttons', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
      .fromTo('.hero-image-main', { scale: 0.8, opacity: 0, rotateY: -15 }, { scale: 1, opacity: 1, rotateY: 0, duration: 1, ease: "back.out(1.7)" }, '-=0.5')
      .fromTo('.floating-element', { y: 50, opacity: 0, scale: 0.5 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(2)" }, '-=0.5');

    // Continuous floating animation
    gsap.to('.floating-element', {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      stagger: 0.3
    });

    // Marquee animation
    const marqueeContent = marqueeRef.current;
    if (marqueeContent) {
      gsap.to(marqueeContent, {
        xPercent: -5,
        duration: 60,
        repeat: -1,
        ease: "none"
      });
    }

    // Features marquee animation
    const featuresMarqueeContent = featuresMarqueeRef.current;
    if (featuresMarqueeContent) {
      gsap.to(featuresMarqueeContent, {
        xPercent: -50,
        duration: 8,
        repeat: -1,
        ease: "none"
      });
    }

    // Stats counter animation with number counting
    const statCards = statsRef.current?.querySelectorAll('.stat-card');
    statCards?.forEach((card, index) => {
      gsap.fromTo(card,
        { y: 100, opacity: 0, rotateX: -30 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          delay: index * 0.1
        }
      );
    });

    // Features with 3D card effect
    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    featureCards?.forEach((card, index) => {
      gsap.fromTo(card,
        { y: 100, opacity: 0, rotateY: index % 2 === 0 ? -20 : 20 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          delay: index * 0.08
        }
      );

      // Hover 3D effect
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, y: -10, duration: 0.3 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, y: 0, duration: 0.3 });
      });
    });

    // Benefits parallax and reveal
    const benefitItems = benefitsRef.current?.querySelectorAll('.benefit-item');
    benefitItems?.forEach((item, index) => {
      gsap.fromTo(item,
        { x: -150, opacity: 0, rotateZ: -5 },
        {
          x: 0,
          opacity: 1,
          rotateZ: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
          delay: index * 0.12
        }
      );
    });

    // Visual card entrance
    const visualCard = benefitsRef.current?.querySelector('.visual-card');
    if (visualCard) {
      gsap.fromTo(visualCard,
        { scale: 0.5, opacity: 0, rotate: -15, y: 100 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          y: 0,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: visualCard,
            start: "top 80%",
          }
        }
      );
    }

    // Steps with connecting line animation
    const steps = stepsRef.current?.querySelectorAll('.step');
    const connectors = stepsRef.current?.querySelectorAll('.step-connector');
    
    steps?.forEach((step, index) => {
      gsap.fromTo(step,
        { y: 80, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: step,
            start: "top 85%",
          },
          delay: index * 0.15
        }
      );
    });

    connectors?.forEach((connector, index) => {
      gsap.fromTo(connector,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: connector,
            start: "top 85%",
          },
          delay: index * 0.15 + 0.2
        }
      );
    });

    // Parallax effect on scroll
    gsap.to('.parallax-bg', {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: '.hero-section',
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    // Testimonial auto-rotate
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    // Crop carousel auto-rotate
    const cropInterval = setInterval(() => {
      setActiveCrop(prev => (prev + 1) % crops.length);
    }, 3000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(cropInterval);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * 0.01;
      const moveY = (clientY - window.innerHeight / 2) * 0.01;

      gsap.to('.parallax-element', {
        x: moveX,
        y: moveY,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Swipe/drag handlers for features carousel
  const handleMouseDown = (e) => {
    const slider = e.currentTarget;
    setIsDragging(true);
    setStartX(e.pageX - slider.offsetLeft);
    setScrollLeftPos(slider.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const slider = e.currentTarget;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeftPos - walk;
  };

  const handleTouchStart = (e) => {
    const slider = e.currentTarget;
    setStartX(e.touches[0].pageX - slider.offsetLeft);
    setScrollLeftPos(slider.scrollLeft);
  };

  const handleTouchMove = (e) => {
    const slider = e.currentTarget;
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden bg-white antialiased">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="parallax-bg absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F0F8A4]/30 via-white to-[#DAD887]/40"></div>
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Farm landscape" 
              className="w-full h-full object-cover opacity-10"
            />
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#75B06F]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#DAD887]/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-lime-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 -z-5 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="hero-badge inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-green-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-green-100 shadow-lg shadow-green-500/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Trusted by 50,000+ Farmers Across India
              </div>
              
              <h1 className="abril-fatface-regular text-5xl lg:text-7xl leading-[1.1] text-gray-900 tracking-tight">
                Empowering Farmers with 
              </h1>
              <h1 className="abril-fatface-regular text-5xl lg:text-7xl leading-[1.1] mb-4 tracking-tight bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent pb-4">
                    Smart Agriculture
                  </h1>
              
              <p className="hero-subtitle text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Connect directly with buyers, access real-time market prices, AI-powered insights, and maximize your profits with data-driven decisions.
              </p>
              
              <div className="hero-buttons flex flex-wrap gap-4 mb-12">
                <button className="group relative flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1">
                  <span className="relative z-10">Start Trading Free</span>
                  <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                {/* <button className="group flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  Watch Demo
                </button> */}
              </div>

              {/* Trust Indicators */}
              {/* <div className="flex items-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <img 
                        key={i}
                        src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000000}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`}
                        alt="User"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=User+${i}&background=16A34A&color=fff`;
                        }}
                      />
                    ))}
                  </div>
                  {/* <div className="text-sm">
                    <span className="font-bold text-gray-900">4.9/5</span>
                    <span className="text-gray-500"> from 10k+ reviews</span>
                  </div> */}
                {/* </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div> */}
                {/* <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-gray-600">Government Verified Platform</span>
                </div> */}
              {/* </div>*/}
            </div>

            {/* Right Content - Interactive Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="parallax-element">
                {/* Main Dashboard Card */}
                <div className="hero-image-main relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Live Market Dashboard</h3>
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </div>
                  
                  {/* Crop Carousel */}
                  <div ref={cropCarouselRef} className="relative h-48 rounded-2xl overflow-hidden mb-6">
                    {crops.map((crop, index) => (
                      <div 
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ${
                          index === activeCrop 
                            ? 'opacity-100 translate-x-0' 
                            : index < activeCrop 
                              ? 'opacity-0 -translate-x-full' 
                              : 'opacity-0 translate-x-full'
                        }`}
                      >
                        <img 
                          src={crop.image}
                          alt={crop.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                          <div>
                            <p className="text-white/80 text-sm">Current Price</p>
                            <p className="text-white font-bold text-2xl">{crop.name}: ₹{crop.price}/q</p>
                          </div>
                          <span className="bg-[#75B06F] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {crop.change}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Carousel Indicators */}
                    <div className="absolute bottom-4 right-4 flex gap-1.5">
                      {crops.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveCrop(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeCrop ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#36656B]">156</p>
                      <p className="text-xs text-gray-500">Active Buyers</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#75B06F]">₹2.4L</p>
                      <p className="text-xs text-gray-500">Avg. Monthly</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#36656B]">24h</p>
                      <p className="text-xs text-gray-500">Quick Payment</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="floating-element absolute -top-4 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Today's Trend</p>
                    <p className="font-bold text-[#36656B]">+18% Wheat</p>
                  </div>
                </div>

                <div className="floating-element absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Received</p>
                    <p className="font-bold text-gray-900">₹45,000</p>
                  </div>
                </div>

                <div className="floating-element absolute top-1/2 -right-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] text-white p-4 rounded-2xl shadow-xl">
                  <div className="text-center">
                    <p className="text-3xl font-bold">+35%</p>
                    <p className="text-sm text-[#F0F8A4]">Profit Increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="py-8 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="flex items-center">
          <div ref={marqueeRef} className="flex items-center gap-16 whitespace-nowrap">
            {[...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-400 font-medium">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z"/>
                </svg>
                <span className="text-lg">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            {/* <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">Our Impact</span> */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Transforming Agriculture Across India</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: "50,000+", label: "Active Farmers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "from-green-500 to-emerald-600" },
              { number: "₹500Cr+", label: "Total Transactions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-500 to-teal-600" },
              { number: "98%", label: "Satisfaction Rate", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-teal-500 to-cyan-600" },
              { number: "500+", label: "Markets Covered", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", color: "from-cyan-500 to-blue-600" }
            ].map((stat, index) => (
              <div key={index} className="stat-card group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            {/* <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">Features</span> */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful tools designed specifically for Indian farmers to maximize profits and minimize risks</p>
          </div>

          <div 
            className="overflow-x-auto scroll-smooth pb-4 scrollbar-hide cursor-grab active:cursor-grabbing" 
            style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div ref={featuresMarqueeRef} className="flex gap-8">
            {[
              {
                title: "Live Market Prices",
                description: "Real-time price updates from 500+ mandis across India. Get instant notifications when prices match your expectations.",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Direct Buyer Access",
                description: "Connect with verified wholesalers, retailers, and exporters directly. No middlemen, better prices guaranteed.",
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              
              },
              {
                title: "AI Price Forecasting",
                description: "Machine learning algorithms predict future prices based on weather, demand, and historical data with 94% accuracy.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Expert Crop Advisory",
                description: "Personalized recommendations from agricultural experts on what to grow, when to harvest, and how to maximize yield.",
                image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Instant Payments",
                description: "Get paid within 24 hours of sale confirmation. Support for UPI, bank transfer, and digital wallets.",
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Offline Support",
                description: "Works even with limited connectivity. Sync data when you're back online. Available in 12 regional languages.",
                image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex-shrink-0 w-[400px]">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className={`absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#36656B] transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  {/* <a href="#" className="inline-flex items-center text-[#36656B] font-semibold group/link">
                    Learn more
                    <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a> */}
                </div>
              </div>
            ))}
            {[
              {
                title: "Live Market Prices",
                description: "Real-time price updates from 500+ mandis across India. Get instant notifications when prices match your expectations.",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",

               
              },
              {
                title: "Direct Buyer Access",
                description: "Connect with verified wholesalers, retailers, and exporters directly. No middlemen, better prices guaranteed.",
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",

              },
              {
                title: "AI Price Forecasting",
                description: "Machine learning algorithms predict future prices based on weather, demand, and historical data with 94% accuracy.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Expert Crop Advisory",
                description: "Personalized recommendations from agricultural experts on what to grow, when to harvest, and how to maximize yield.",
                image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
           
              },
              {
                title: "Instant Payments",
                description: "Get paid within 24 hours of sale confirmation. Support for UPI, bank transfer, and digital wallets.",
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                
              },
              {
                title: "Offline Support",
                description: "Works even with limited connectivity. Sync data when you're back online. Available in 12 regional languages.",
                image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
               
              }
            ].map((feature, index) => (
              <div key={`duplicate-${index}`} className="feature-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex-shrink-0 w-[400px]">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className={`absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#36656B] transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  {/* <a href="#" className="inline-flex items-center text-[#36656B] font-semibold group/link">
                    Learn more
                    <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a> */}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} id="benefits" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F8A4]/20 via-white to-[#DAD887]/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Benefits List */}
            <div>
              {/* <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">Why Choose Us</span> */}
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why 50,000+ Farmers Trust AuraFarm</h2>
              <p className="text-xl text-gray-600 mb-12">Join the revolution in agricultural commerce with tools designed for your success</p>

              <div className="space-y-6">
                {[
                  { number: "01", title: "Increase Your Profits by 35%", description: "Our farmers report an average 35% increase in profits by selling directly to buyers at fair market prices." },
                  { number: "02", title: "Reduce Post-Harvest Losses", description: "Quick connections mean faster sales. Reduce waste by up to 40% with our instant buyer matching system." },
                  { number: "03", title: "Data-Driven Decisions", description: "Make informed choices with AI-powered insights on market trends, weather patterns, and demand forecasts." },
                  { number: "04", title: "24/7 Expert Support", description: "Get help anytime with our dedicated support team available in Hindi, English, and 10 regional languages." }
                ].map((benefit, index) => (
                  <div key={index} className="benefit-item group flex gap-6 p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#75B06F] hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#36656B] to-[#75B06F] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                      {benefit.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#36656B] transition-colors">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              {/* Main Visual Card */}
              <div className="visual-card bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#75B06F]/10 to-[#36656B]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative">
                  {/* <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold mb-6">Success Metrics</span> */}
                  
                  <div className="flex items-end gap-4 mb-8">
                    <span className="text-7xl font-bold bg-gradient-to-r from-[#36656B] to-[#75B06F] bg-clip-text text-transparent">+35%</span>
                    <svg className="w-12 h-12 text-[#75B06F] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-8">Average Profit Increase for Farmers</p>

                  {/* Testimonial Carousel */}
                  <div className="relative h-32 overflow-hidden rounded-2xl bg-gray-50 p-4">
                    {testimonials.map((testimonial, index) => (
                      <div 
                        key={index}
                        className={`absolute inset-4 flex gap-4 transition-all duration-500 ${
                          index === activeTestimonial 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                        }`}
                      >
                        <img 
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#75B06F]"
                        />
                        <div className="flex-1">
                          <p className="text-gray-700 italic text-sm leading-relaxed mb-2">"{testimonial.quote}"</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{testimonial.name}, {testimonial.location}</p>
                            <span className="text-green-600 font-bold text-sm">{testimonial.increase}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Carousel Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTestimonial(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeTestimonial ? 'bg-green-600 w-6' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 rounded-3xl overflow-hidden shadow-xl -z-10">
                <img 
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Happy farmer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      
      <section ref={stepsRef} id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
       
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            {/* <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">Simple Process</span> */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Start Selling in 4 Easy Steps</h2>
            <p className="text-xl text-gray-600">From signup to payment, we've made everything simple and fast</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-[#F0F8A4] via-[#DAD887] to-[#75B06F] rounded-full"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Create Account", description: "Sign up with your phone number. Verify with OTP. Takes less than 2 minutes.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", image: "https://media.istockphoto.com/id/1330214199/photo/indian-farmer-busy-using-mobile-phone-while-sitting-in-between-the-crop-seedlings-inside.jpg?s=612x612&w=0&k=20&c=PmGOwjZlQdOhETmjVwBoT4thL3mJn3VfEm5q9doj4aU=" },
                { step: "02", title: "List Your Crops", description: "Add your produce details with photos, quantity, and expected price range.", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", image: "https://img.freepik.com/free-photo/african-man-harvesting-vegetables_23-2151441245.jpg" },
                { step: "03", title: "Get Best Offers", description: "Receive multiple bids from verified buyers. Compare and negotiate.", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", image: "https://t4.ftcdn.net/jpg/05/68/84/87/360_F_568848790_9B5VucFYGcQt2BgwaGmdwmcfraWrjMJY.jpg" },
                { step: "04", title: "Get Paid Fast", description: "Accept the best offer and receive payment within 24 hours guaranteed.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", image: "https://www.shutterstock.com/shutterstock/videos/1105805017/thumb/12.jpg?ip=x480" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="step relative h-[400px]" 
                  style={{ perspective: '1000px' }}
                  onMouseEnter={() => setFlippedCards(prev => {
                    const newFlipped = [...prev];
                    newFlipped[index] = true;
                    return newFlipped;
                  })}
                  onMouseLeave={() => setFlippedCards(prev => {
                    const newFlipped = [...prev];
                    newFlipped[index] = false;
                    return newFlipped;
                  })}
                >
                  {/* Connector for mobile */}
                  {index < 3 && (
                    <div className="step-connector hidden md:block lg:hidden absolute -bottom-4 left-1/2 w-1 h-8 bg-gradient-to-b from-[#75B06F] to-[#36656B] rounded-full origin-top"></div>
                  )}
                  
                  {/* Step Number Badge - Outside flip container */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-20">
                    {item.step}
                  </div>

                  {/* Flip Card Container */}
                  <div 
                    className="relative w-full h-full transition-transform duration-700 cursor-pointer"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front Side - Image */}
                    <div 
                      className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      </div>
                    </div>

                    {/* Back Side - Description */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-[#36656B] to-[#75B06F] rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center text-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-white/90 leading-relaxed text-lg">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#36656B] via-[#75B06F] to-[#36656B]"></div>
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Animated Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="max-w-4xl mx-auto relative text-center">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">Ready to Transform Your Farming Business?</h2>
          <p className="text-xl text-[#F0F8A4] mb-10 max-w-2xl mx-auto">Join 50,000+ farmers who are already earning more with AuraFarm. Start your free trial today.</p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button className="group flex items-center gap-3 bg-[#F0F8A4] text-[#36656B] px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1">
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="flex items-center gap-3 bg-transparent text-white px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Talk to Sales
            </button>
          </div>
          
          <p className="text-[#DAD887] flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            No credit card required. Free for 30 days. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;