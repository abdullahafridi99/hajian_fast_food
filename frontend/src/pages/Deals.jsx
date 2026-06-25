import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DealCard from '../components/DealCard';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('/api/deals');
        if (response.data.success) {
          // Filter to show active deals where expiry date is in the future
          const activeDeals = response.data.data.filter(
            (d) => d.isActive && new Date(d.endDate) > new Date()
          );
          setDeals(activeDeals);
        }
      } catch (error) {
        console.error('Error fetching deals page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-accent/15 text-accent text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          🎁 Discount Combos
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-dark">Special Deals & Offers</h1>
        <p className="text-gray-500 text-sm">
          Save big on your favorite combinations. Perfect for families, students, and group dining.
        </p>
      </section>

      {/* Deals Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-500 font-medium">Checking active offers...</span>
        </div>
      ) : (
        <section>
          {deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal, i) => (
                <motion.div
                  key={deal._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <DealCard deal={deal} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium max-w-md mx-auto space-y-3">
              <span className="text-4xl">🎁</span>
              <h3 className="text-lg font-bold text-dark">No active deals found</h3>
              <p className="text-gray-500 text-xs">
                We don't have any promotional deals active at the moment. Keep checking back or explore our daily menu!
              </p>
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default Deals;
