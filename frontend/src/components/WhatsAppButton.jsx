import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const phoneNumber = '923486903708';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20Hajian%20Foods!%20I%20would%20like%20to%20inquire%20about%20your%20menu.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
      
      {/* Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-300 origin-right bg-gray-900 text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl shadow-lg border border-white/5 whitespace-nowrap">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
