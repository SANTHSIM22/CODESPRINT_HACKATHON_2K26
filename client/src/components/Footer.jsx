import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-6 gap-12 pb-16 border-b border-gray-800">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#16A34A"/>
              </svg>
              <span className="text-2xl font-bold">AuraFarm</span>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">Empowering Indian farmers with technology, market access, and fair prices for a sustainable agricultural future.</p>
            <div className="flex gap-4">
              {['twitter', 'facebook', 'instagram', 'youtube', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 bg-gray-800 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Mobile App", "API", "Integrations"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Blog", "Partners"] },
            { title: "Resources", links: ["Help Center", "Community", "Webinars", "Guides", "Events"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] }
          ].map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-lg mb-6">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500">2024 AuraFarm. All rights reserved. Made with love for Indian Farmers.</p>
          <div className="flex items-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-6 opacity-50 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display='none'} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6 opacity-50 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display='none'} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
