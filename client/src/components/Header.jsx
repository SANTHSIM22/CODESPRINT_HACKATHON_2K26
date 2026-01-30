import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'backdrop-blur-2xl shadow-lg shadow-gray-900/5 py-3' 
            : 'backdrop-blur-md py-5'
        }`}
        style={{ backgroundColor: scrolled ? 'rgba(218, 216, 135, 0.8)' : 'rgba(218, 216, 135, 0.6)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <svg className="w-10 h-10 relative transform group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#16A34A"/>
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AuraFarm</span>
          </Link>
          
          <ul className="hidden lg:flex items-center gap-8">
            {['Features', 'Benefits', 'How It Works', 'Testimonial'].map((item, index) => (
              <li key={index}>
                <a 
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                  className="relative text-black hover:text-[#36656B] font-medium transition-colors group py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    const id = item.toLowerCase().replace(/ /g, '-');
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#36656B] group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-black hover:text-[#36656B] font-semibold transition-colors px-4 py-2">
              Log In
            </Link>
            <Link to="/signup" className="relative group bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white px-6 py-3 rounded-xl font-semibold overflow-hidden transition-all hover:shadow-xl hover:shadow-[#36656B]/30 hover:-translate-y-0.5">
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#75B06F] to-[#36656B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t">
            <ul className="py-4">
              {['Features', 'Benefits', 'How It Works', 'Testimonial'].map((item, index) => (
                <li key={index}>
                  <a 
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                    className="block px-6 py-3 text-gray-600 hover:text-[#36656B] hover:bg-[#F0F8A4]/20 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const id = item.toLowerCase().replace(/ /g, '-');
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setIsMenuOpen(false);
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="px-6 py-3 space-y-2">
                <Link to="/login" className="block w-full text-center text-gray-700 hover:text-[#36656B] font-semibold transition-colors px-4 py-2 border border-gray-300 rounded-lg">
                  Log In
                </Link>
                <Link to="/signup" className="block w-full text-center bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white px-6 py-3 rounded-xl font-semibold">
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;
