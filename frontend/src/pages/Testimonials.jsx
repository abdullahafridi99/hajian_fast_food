import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiStar, FiEdit, FiUser } from 'react-icons/fi';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('/api/testimonials');
      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) {
      setErrorMessage('Please fill in all fields before submitting.');
      return;
    }
    
    setSubmitLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post('/api/testimonials', {
        name,
        rating,
        review,
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setName('');
        setReview('');
        setRating(5);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error submitting review. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Stats calculation
  const totalReviews = testimonials.length;
  const avgRating = totalReviews > 0 
    ? (testimonials.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-primary/10 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          💬 Reviews & Opinions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-dark">Customer Testimonials</h1>
        <p className="text-gray-500 text-sm">
          Hear directly from the food lovers who visit us and order online.
        </p>
      </section>

      {/* Ratings Dashboard & Submission Form */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Statistics Column */}
        <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium text-center space-y-6 lg:sticky lg:top-24">
          <h3 className="text-xl font-bold text-dark">Overall Rating</h3>
          
          <div className="space-y-2">
            <span className="text-6xl font-black text-primary">{avgRating}</span>
            <div className="flex justify-center text-secondary text-2xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="px-0.5">
                  {i < Math.round(Number(avgRating)) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Based on {totalReviews} Approved Reviews
            </p>
          </div>

          <hr className="border-light-gray/20" />

          {/* Quick Stats Bars */}
          <div className="space-y-2.5 text-xs text-left">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = testimonials.filter((t) => t.rating === stars).length;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center space-x-3">
                  <span className="w-3 font-semibold text-gray-500">{stars}</span>
                  <FiStar className="text-secondary w-3.5 h-3.5 fill-current" />
                  <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-6 text-right font-medium text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List Grid (Col span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Submit a review Form */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
            <div className="flex items-center space-x-2 text-primary">
              <FiEdit className="w-5 h-5" />
              <h3 className="text-lg font-bold text-dark">Share Your Experience</h3>
            </div>

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 text-center space-y-3"
                >
                  <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Review Submitted!</h4>
                  <p className="text-xs text-green-600 leading-relaxed max-w-sm mx-auto">
                    Thank you! Your testimonial has been saved and will appear publicly once verified and approved by the restaurant administration.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-2 text-xs font-bold text-primary underline hover:text-primary-dark"
                  >
                    Submit another review
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {errorMessage && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name field */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Saad Khan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Star Rating Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500 block">Rating</label>
                    <div className="flex items-center space-x-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-2xl transition-colors duration-200 focus:outline-none"
                        >
                          <span
                            className={
                              star <= (hoverRating || rating)
                                ? 'text-secondary'
                                : 'text-gray-200'
                            }
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Your Review</label>
                    <textarea
                      rows="4"
                      placeholder="Write your honest review here..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Testimonial Cards List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white rounded-3xl p-6 border border-light-gray/20 shadow-premium flex flex-col justify-between"
                  >
                    <p className="text-gray-600 text-xs italic leading-relaxed mb-4">
                      "{t.review}"
                    </p>
                    <div className="flex items-center space-x-3 mt-4 border-t border-light-gray/10 pt-4">
                      {t.image ? (
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover border border-primary"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-light border border-light-gray flex items-center justify-center text-gray-400">
                          <FiUser className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-dark text-xs">{t.name}</h4>
                        <div className="flex text-secondary text-xs">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          {Array.from({ length: 5 - t.rating }).map((_, i) => (
                            <span key={i} className="text-gray-200">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12 bg-white rounded-3xl border border-light-gray/20">
                  <p className="text-gray-400 text-xs font-semibold">No reviews approved yet.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </section>

    </div>
  );
};

export default Testimonials;
