import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const { settings } = useSettings();
  
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-primary/10 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          📞 Get In Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-dark">Contact Us</h1>
        <p className="text-gray-500 text-sm">
          Have any questions, feedbacks, or large catering orders? Reach out to us anytime!
        </p>
      </section>

      {/* Contact Grid Info & Form */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Info Column */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
            <h3 className="text-xl font-bold text-dark border-b border-light-gray/20 pb-4">
              Contact Details
            </h3>

            <div className="space-y-6 text-sm text-gray-600">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-xs uppercase tracking-wide">Restaurant Address</h4>
                  <p className="mt-1 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              {/* Phone */}
              {settings.phone && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-xs uppercase tracking-wide">Phone Number</h4>
                    <a href={`tel:${settings.phone}`} className="mt-1 block hover:underline hover:text-primary transition-all">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {settings.whatsapp && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                    <FaWhatsapp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-xs uppercase tracking-wide">WhatsApp Channels</h4>
                    <a
                      href={`https://wa.me/${settings.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block hover:underline hover:text-green-600 transition-all font-semibold"
                    >
                      +{settings.whatsapp} (Live chat / Direct order)
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {settings.email && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary-dark flex-shrink-0">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-xs uppercase tracking-wide">Email Address</h4>
                    <a href={`mailto:${settings.email}`} className="mt-1 block hover:underline hover:text-primary transition-all">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Channels */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-4">
            <h4 className="font-bold text-dark text-sm">Follow Us Online</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Stay updated with our latest dishes, deals, and restaurant activities by checking our social media.
            </p>
            <div className="flex space-x-3 pt-2">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-light-gray/40 rounded-xl hover:bg-primary hover:text-white transition-colors text-xs font-bold text-dark/70"
                >
                  Facebook
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-light-gray/40 rounded-xl hover:bg-primary hover:text-white transition-colors text-xs font-bold text-dark/70"
                >
                  Instagram
                </a>
              )}
              {settings.socialLinks.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-light-gray/40 rounded-xl hover:bg-primary hover:text-white transition-colors text-xs font-bold text-dark/70"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Contact Form Column */}
        <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium">
          <div className="flex items-center space-x-2 text-primary mb-6">
            <FiMessageSquare className="w-5 h-5" />
            <h3 className="text-lg font-bold text-dark">Send Us a Message</h3>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center space-y-4">
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h4 className="font-black text-lg">Message Sent!</h4>
              <p className="text-xs text-green-600 leading-relaxed max-w-sm mx-auto">
                Thank you for contacting Hajian Foods. Your message has been successfully received. We will get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="py-2.5 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-xs uppercase"
              >
                Send New Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</label>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone</label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Message</label>
                <textarea
                  rows="5"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

      </section>

      {/* Google Maps Embed Section */}
      <section className="bg-white rounded-[40px] overflow-hidden shadow-premium border border-light-gray/20">
        <div className="p-6 border-b border-light-gray/10">
          <h4 className="font-extrabold text-lg text-dark flex items-center space-x-2">
            <FiMapPin className="text-primary w-5 h-5" />
            <span>Interactive Location Map</span>
          </h4>
        </div>
        <div className="h-96 w-full">
          <iframe
            src="https://maps.google.com/maps?q=Hajian+Hotel+Kohat+Road+Sra+Khawra&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            title="Google Map of Hajian Foods"
          ></iframe>
        </div>
      </section>

    </div>
  );
};

export default Contact;
