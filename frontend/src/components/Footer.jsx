import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const { settings } = useSettings();

  const socialIcons = {
    facebook: <FaFacebook className="w-5 h-5" />,
    instagram: <FaInstagram className="w-5 h-5" />,
    tiktok: <FaTiktok className="w-5 h-5" />,
    whatsapp: <FaWhatsapp className="w-5 h-5" />
  };

  return (
    <footer className="bg-dark text-white pt-16 pb-8 border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                {settings.restaurantName}
              </span>
              <span className="text-xs tracking-widest text-secondary font-semibold -mt-1 uppercase">
                {settings.slogan}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serving delicious fast food made with fresh ingredients, premium quality, and unforgettable taste.
            </p>
            {/* Social handles */}
            <div className="flex space-x-4 pt-2">
              {Object.keys(settings.socialLinks).map((key) => {
                const link = settings.socialLinks[key];
                if (!link) return null;
                return (
                  <a
                    key={key}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-light flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-all duration-300 shadow-md"
                  >
                    {socialIcons[key] || <FaMapMarkerAlt />}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-primary/30 pb-2 w-fit">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary transition-colors">Food Menu</Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-primary transition-colors">Deals & Offers</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-primary transition-colors">Photo Gallery</Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-primary transition-colors">Reviews</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-primary/30 pb-2 w-fit">Contact Info</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-2.5">
                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
              {settings.phone && (
                <li className="flex items-center space-x-2.5">
                  <FaPhoneAlt className="text-primary flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-primary transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center space-x-2.5">
                  <FaWhatsapp className="text-green-500 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    +{settings.whatsapp}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center space-x-2.5">
                  <FaEnvelope className="text-primary flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-primary/30 pb-2 w-fit">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Monday - Thursday:</span>
                <span className="text-secondary font-semibold">12:00 PM - 12:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday:</span>
                <span className="text-secondary font-semibold">03:00 PM - 01:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday - Sunday:</span>
                <span className="text-secondary font-semibold">12:00 PM - 02:00 AM</span>
              </li>
              <li className="pt-2 text-xs text-gray-500 italic">
                * Home delivery available during all business hours.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} {settings.restaurantName}. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0 text-xs">
            Designed & Developed with Passion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
