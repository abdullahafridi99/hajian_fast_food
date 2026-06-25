import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from '../components/FoodCard';
import { FiSearch, FiLayers } from 'react-icons/fi';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, catsRes] = await Promise.all([
          axios.get('/api/foods'),
          axios.get('/api/categories'),
        ]);

        if (foodsRes.data.success) {
          setFoods(foodsRes.data.data);
        }
        if (catsRes.data.success) {
          setCategories(catsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching menu page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredFoods = foods.filter((food) => {
    // 1. Availability and active status
    const matchesCategory =
      selectedCategory === 'all' ||
      food.category?._id === selectedCategory ||
      food.category?.slug === selectedCategory;

    // 2. Search query match
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description &&
        food.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Title & Search Bar */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-light-gray/20">
        <div>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            🍽️ Taste the Best
          </span>
          <h1 className="text-4xl font-black text-dark mt-3">Our Food Menu</h1>
          <p className="text-gray-500 text-sm mt-1">Explore our range of fresh, hot, and delicious meals.</p>
        </div>

        {/* Premium Search Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </section>

      {/* Category Navigation Tabs */}
      <section className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
        <div className="flex space-x-3 w-max">
          {/* "All" tab */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center space-x-2 py-3 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
              selectedCategory === 'all'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-dark/70 border-light-gray/40 hover:bg-gray-50 hover:text-dark'
            }`}
          >
            <FiLayers className="w-4 h-4" />
            <span>All Items</span>
          </button>

          {/* Dynamic Category tabs */}
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`py-3 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                selectedCategory === cat._id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-dark/70 border-light-gray/40 hover:bg-gray-50 hover:text-dark'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Food Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-500 font-medium">Loading delicious options...</span>
        </div>
      ) : (
        <section>
          <AnimatePresence mode="popLayout">
            {filteredFoods.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredFoods.map((food) => (
                  <motion.div
                    layout
                    key={food._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FoodCard food={food} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium max-w-md mx-auto space-y-3"
              >
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-bold text-dark">No food items found</h3>
                <p className="text-gray-500 text-xs">
                  We couldn't find any items matching your current filters or search terms. Try modifying your query!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

    </div>
  );
};

export default Menu;
