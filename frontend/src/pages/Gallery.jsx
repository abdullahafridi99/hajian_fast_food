import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize2, FiX, FiInfo } from 'react-icons/fi';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null); // index of item in currently filtered list

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get('/api/gallery');
        if (response.data.success) {
          setGalleryItems(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching gallery page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const categories = ['all', 'Food', 'Dining', 'Kitchen', 'Events', 'Other'];

  const filteredItems = galleryItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const getBackendUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return url;
  };

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const handlePrevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-primary/10 text-primary text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
          📷 Visual Feast
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-dark">Our Restaurant Gallery</h1>
        <p className="text-gray-500 text-sm">
          A sneak peek into our delicious servings, cozy seating environment, and kitchen hygiene.
        </p>
      </section>

      {/* Categories Tabs */}
      <section className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setLightboxIndex(null);
            }}
            className={`py-2.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-dark/70 border-light-gray/40 hover:bg-gray-50 hover:text-dark'
            }`}
          >
            {cat === 'all' ? 'All Photos' : cat}
          </button>
        ))}
      </section>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-500 font-medium">Loading high quality captures...</span>
        </div>
      ) : (
        <section>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  layout
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-3xl overflow-hidden aspect-square bg-gray-100 shadow-sm border border-light-gray/20 cursor-pointer"
                  onClick={() => handleOpenLightbox(index)}
                >
                  <img
                    src={getBackendUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-dark-darker/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                    <span className="self-end bg-secondary text-dark text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight">{item.title}</h4>
                      {item.description && (
                        <p className="text-gray-300 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <FiMaximize2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium max-w-md mx-auto space-y-3">
              <span className="text-4xl">🖼️</span>
              <h3 className="text-lg font-bold text-dark">No images found</h3>
              <p className="text-gray-500 text-xs">
                There are no photographs uploaded under this category at the moment.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-darker/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-10"
            onClick={handleCloseLightbox}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-6 right-6 text-white hover:text-primary p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all z-55"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Lightbox Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-dark border border-white/10 rounded-[32px] overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row relative z-50 max-h-[85vh] md:max-h-none"
              onClick={(e) => e.stopPropagation()} // stop close on card click
            >
              {/* Image box */}
              <div className="relative md:w-3/5 bg-black flex items-center justify-center max-h-[45vh] md:max-h-[70vh] overflow-hidden">
                <img
                  src={getBackendUrl(filteredItems[lightboxIndex].image)}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Arrow navigation buttons inside lightbox */}
                {filteredItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevLightbox}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white font-bold p-3 rounded-full text-xs transition-colors"
                    >
                      ❮
                    </button>
                    <button
                      onClick={handleNextLightbox}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white font-bold p-3 rounded-full text-xs transition-colors"
                    >
                      ❯
                    </button>
                  </>
                )}
              </div>

              {/* Information box */}
              <div className="md:w-2/5 p-8 flex flex-col justify-between space-y-6 text-white">
                <div className="space-y-4">
                  <span className="inline-block bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <h3 className="text-2xl font-extrabold leading-tight">
                    {filteredItems[lightboxIndex].title}
                  </h3>
                  <hr className="border-white/10" />
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {filteredItems[lightboxIndex].description || 'No description provided for this gallery item.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-bold uppercase">
                  <FiInfo className="w-4 h-4 text-secondary" />
                  <span>Captured & prepared at Hajian Foods</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Gallery;
