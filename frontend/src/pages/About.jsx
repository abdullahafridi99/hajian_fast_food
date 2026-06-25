import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { FiUsers, FiShoppingBag, FiLayers, FiCalendar } from 'react-icons/fi';

const About = () => {
  const { settings } = useSettings();

  const stats = [
    { icon: <FiUsers className="w-6 h-6 text-primary" />, value: '15,000+', label: 'Happy Customers' },
    { icon: <FiShoppingBag className="w-6 h-6 text-accent" />, value: '50,000+', label: 'Orders Served' },
    { icon: <FiLayers className="w-6 h-6 text-secondary-dark" />, value: '45+', label: 'Menu Items' },
    { icon: <FiCalendar className="w-6 h-6 text-green-500" />, value: '8+', label: 'Years of Service' }
  ];

  return (
    <div className="py-16 space-y-20">
      
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <span className="bg-primary/10 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          Who We Are
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-dark mt-3">About Hajian Foods</h1>
        <p className="text-gray-500 text-sm mt-3">
          The story behind Sra Khawra's favorite premium fast food destination.
        </p>
      </section>

      {/* Main Story & Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-extrabold text-dark">Our Restaurant Story</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Established with the goal of introducing premium, hygienic, and incredibly delicious fast food to the local community, **{settings.restaurantName}** has become a landmark of culinary joy. Located at **{settings.address}**, we have been serving food lovers of all ages with commitment and passion.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              What started as a small kitchen project has now expanded into a premium restaurant brand offering the crispiest Zinger burgers, gourmet Italian pizzas (including our signature Crown Crust and Calzone variations), and crunchy fried broasts. Our slogan **"{settings.slogan}"** reflects our commitment: we believe that a great meal has the power to uplift your spirit and brighten your day.
            </p>
            <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-2xl">
              <p className="text-dark font-semibold text-sm italic">
                "We do not compromise on quality. Every bun, breast, and sauce is prepared fresh on order under strict sanitary conditions."
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-[30px] transform rotate-3"></div>
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80"
              alt="Hajian Foods Interior"
              className="w-full h-96 object-cover rounded-[30px] shadow-lg relative z-10 border border-white/20"
            />
          </motion.div>

        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-white">
                  {stat.icon}
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-secondary">{stat.value}</h3>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision & Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-4 hover:border-primary/20 transition-all duration-300">
            <span className="text-4xl">🎯</span>
            <h3 className="text-xl font-bold text-dark">Our Mission</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              To consistently serve high-quality, delicious, and hygienic fast food that brings happiness and satisfaction to our customers, while maintaining excellent, friendly service.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-4 hover:border-primary/20 transition-all duration-300">
            <span className="text-4xl">👁️</span>
            <h3 className="text-xl font-bold text-dark">Our Vision</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              To be recognized as the leading premium fast food chain in the region, known for innovation, taste, hygienic kitchen protocols, and building a loyal community of food lovers.
            </p>
          </div>

          {/* Quality commitment */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-4 hover:border-primary/20 transition-all duration-300">
            <span className="text-4xl">👑</span>
            <h3 className="text-xl font-bold text-dark">Quality Commitment</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              We pledge to use clean, raw materials, fresh halal meats, and sanitize our food preparation areas daily. Your safety, health, and appetite are safe in our hands.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default About;
