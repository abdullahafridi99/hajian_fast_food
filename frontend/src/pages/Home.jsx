import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';
import DealCard from '../components/DealCard';
import { FiAward, FiTruck, FiSmile, FiHeart, FiPhone, FiArrowRight } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [activeDeals, setActiveDeals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, dealsRes, testimonialsRes] = await Promise.all([
          axios.get('/api/foods'),
          axios.get('/api/deals'),
          axios.get('/api/testimonials')
        ]);
        
        if (foodsRes.data.success) {
          // Take first 3 available items as featured
          const avail = foodsRes.data.data.filter(f => f.isAvailable);
          setFeaturedFoods(avail.slice(0, 3));
        }
        if (dealsRes.data.success) {
          // Take active deals
          const active = dealsRes.data.data.filter(d => d.isActive && new Date(d.endDate) > new Date());
          setActiveDeals(active.slice(0, 3));
        }
        if (testimonialsRes.data.success) {
          setTestimonials(testimonialsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    { icon: <FiAward className="w-8 h-8 text-secondary" />, title: 'Premium Quality', desc: 'We use 100% fresh meat, handpicked vegetables, and premium signature sauces.' },
    { icon: <FiTruck className="w-8 h-8 text-secondary" />, title: 'Super Fast Delivery', desc: 'Hot and fresh meals delivered straight to your doorstep in record time.' },
    { icon: <FiSmile className="w-8 h-8 text-secondary" />, title: 'Hygiene First', desc: 'Cleanliness is our top priority. Prepared under strict hygienic standards.' },
    { icon: <FiHeart className="w-8 h-8 text-secondary" />, title: 'Made with Love', desc: 'Every burger, pizza, and broast is crafted with precision and passion.' }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center bg-gradient-to-br from-light to-secondary/10 py-16">
        {/* Floating food icons for premium graphics */}
        <div className="absolute top-1/4 left-10 w-12 h-12 bg-accent/20 rounded-full blur-md animate-bounce hidden md:block"></div>
        <div className="absolute bottom-1/4 right-20 w-16 h-16 bg-primary/10 rounded-full blur-lg animate-float-slow hidden md:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <span className="inline-flex items-center space-x-1 bg-primary/15 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
                <span>🔥 Welcome to Hajian Foods</span>
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-dark leading-none">
                {settings.heroSection.heading}
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gradient">
                {settings.heroSection.slogan}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {settings.heroSection.description}
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/menu"
                  className="py-4 px-8 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold shadow-lg hover:shadow-premium-hover transition-all duration-300 transform active:scale-95 text-sm uppercase tracking-wider"
                >
                  Order Now
                </Link>
                <Link
                  to="/menu"
                  className="py-4 px-8 rounded-2xl bg-white text-dark hover:bg-gray-50 border border-light-gray font-extrabold shadow-sm transition-all duration-300 transform active:scale-95 text-sm uppercase tracking-wider"
                >
                  View Menu
                </Link>
              </div>
            </motion.div>

            {/* Hero Graphics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative flex justify-center items-center"
            >
              {/* Rotating glowing background ring */}
              <div className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full border-4 border-dashed border-primary/20 animate-[spin_60s_linear_infinite] -z-10"></div>
              <div className="absolute w-[250px] h-[250px] sm:w-[380px] sm:h-[380px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-2xl -z-20"></div>

              {/* Main Premium Food Image */}
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
                alt="Premium Burger"
                className="w-80 sm:w-[450px] h-auto object-contain drop-shadow-2xl floating-item"
              />

              {/* Floating Side Elements */}
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 floating-item-delayed">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                  alt="Floating Pizza Slice"
                  className="w-24 sm:w-36 h-auto rounded-2xl shadow-xl border border-white/20 object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 floating-item">
                <img
                  src="https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80"
                  alt="Floating Crispy Broast"
                  className="w-24 sm:w-36 h-auto rounded-2xl shadow-xl border border-white/20 object-cover"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Popular Deals Section */}
      {activeDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-accent/15 text-accent text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              🎁 Exclusive Savings
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mt-3">Popular Deals & Offers</h2>
            <p className="text-gray-500 text-sm mt-3">Check out our special combo meals and discounts prepared to light up your mood!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeDeals.map((deal) => (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Foods Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="max-w-xl text-center md:text-left">
            <span className="bg-primary/15 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              🌟 Chef Recommended
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mt-3">Featured Food Items</h2>
            <p className="text-gray-500 text-sm mt-3">Our customer favorites made fresh with premium quality meat and original sauces.</p>
          </div>
          <Link
            to="/menu"
            className="flex items-center space-x-2 text-primary hover:text-secondary-dark font-extrabold text-sm uppercase tracking-wider self-center md:self-end border-b-2 border-primary pb-1"
          >
            <span>View Full Menu</span>
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFoods.map((food) => (
              <motion.div
                key={food._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Why Choose Us Section */}
      <section className="bg-dark text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="bg-primary text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">The Hajian Foods Experience</h2>
            <p className="text-gray-400 text-sm mt-3">Discover what makes our kitchen stand out from the rest.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-dark-light/50 border border-white/5 p-8 rounded-3xl text-center space-y-4 hover:bg-dark-light/80 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-primary/15 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              💬 Feedbacks
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mt-3">What Our Customers Say</h2>
            <p className="text-gray-500 text-sm mt-3">Read reviews from our lovely family of food lovers.</p>
          </div>

          <div className="px-4 py-8 bg-gradient-to-br from-light to-secondary/5 rounded-[40px] border border-light-gray/20">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              className="px-6 pb-12"
            >
              {testimonials.map((t) => (
                <SwiperSlide key={t._id} className="h-auto">
                  <div className="bg-white rounded-3xl p-8 border border-light-gray/10 shadow-premium h-full flex flex-col justify-between">
                    <p className="text-gray-600 text-sm italic leading-relaxed mb-6">
                      "{t.review}"
                    </p>
                    <div className="flex items-center space-x-4">
                      <img
                        src={t.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                      />
                      <div>
                        <h4 className="font-bold text-dark text-sm">{t.name}</h4>
                        <div className="flex text-secondary mt-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <span key={i} className="text-xs">★</span>
                          ))}
                          {Array.from({ length: 5 - t.rating }).map((_, i) => (
                            <span key={i} className="text-xs text-gray-300">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* 6. Quick Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-white rounded-[40px] p-8 md:p-16 shadow-premium relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-4 text-center md:text-left relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold">Hungry? Order Hot Food Now!</h2>
            <p className="text-white/80 text-sm">
              We deliver hot and delicious meals straight to you. You can also place orders via Call or WhatsApp!
            </p>
            {settings.phone && (
              <div className="flex items-center justify-center md:justify-start space-x-3 text-lg font-bold pt-2">
                <FiPhone className="w-5 h-5 text-secondary animate-pulse" />
                <a href={`tel:${settings.phone}`} className="hover:underline">
                  {settings.phone}
                </a>
              </div>
            )}
          </div>
          
          <div className="relative z-10 flex-shrink-0 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="py-4 px-8 rounded-2xl bg-secondary text-dark font-extrabold hover:bg-white hover:text-primary transition-all duration-300 uppercase text-xs tracking-wider"
            >
              Order Online
            </Link>
            <Link
              to="/contact"
              className="py-4 px-8 rounded-2xl bg-dark text-white font-extrabold hover:bg-dark-light transition-all duration-300 uppercase text-xs tracking-wider border border-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
