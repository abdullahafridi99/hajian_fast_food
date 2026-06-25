import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiX, FiUpload, FiCalendar } from 'react-icons/fi';

const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [image, setImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals');
      if (response.data.success) {
        setDeals(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Quick Toggle Active
  const handleToggleActive = async (deal) => {
    try {
      const response = await axios.put(`/api/deals/${deal._id}`, {
        isActive: !deal.isActive,
      });
      if (response.data.success) {
        setDeals((prev) =>
          prev.map((d) => (d._id === deal._id ? response.data.data : d))
        );
      }
    } catch (error) {
      console.error('Error toggling deal active status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedId('');
    setTitle('');
    setDescription('');
    setOriginalPrice('');
    setDiscountPrice('');
    setImage('');
    
    // Default dates: today and next month
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    setStartDate(today);
    setEndDate(nextMonthStr);
    setIsActive(true);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (deal) => {
    setEditMode(true);
    setSelectedId(deal._id);
    setTitle(deal.title);
    setDescription(deal.description || '');
    setOriginalPrice(deal.originalPrice);
    setDiscountPrice(deal.discountPrice);
    setImage(deal.image);
    setStartDate(new Date(deal.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(deal.endDate).toISOString().split('T')[0]);
    setIsActive(deal.isActive);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

  // Upload deal banner
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setImage(response.data.url);
      }
    } catch (error) {
      console.error('Error uploading deal photo:', error);
      setUploadError('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || originalPrice === '' || discountPrice === '' || !image.trim() || !startDate || !endDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const dealData = {
      title,
      description,
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      image,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
    };

    try {
      if (editMode) {
        const response = await axios.put(`/api/deals/${selectedId}`, dealData);
        if (response.data.success) {
          setDeals((prev) =>
            prev.map((d) => (d._id === selectedId ? response.data.data : d))
          );
          setModalOpen(false);
        }
      } else {
        const response = await axios.post('/api/deals', dealData);
        if (response.data.success) {
          setDeals((prev) => [...prev, response.data.data]);
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving deal item:', error);
      setFormError(error.response?.data?.message || 'Error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional deal?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/deals/${id}`);
      if (response.data.success) {
        setDeals((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Promotions & Deals</h1>
          <p className="text-gray-500 text-xs">Create discount combinations, set start and end dates, and manage deal availability.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 py-3 px-5 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Deal Combo</span>
        </button>
      </section>

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section>
          {deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => {
                const isExpired = new Date(deal.endDate) < new Date();
                return (
                  <div
                    key={deal._id}
                    className="bg-white rounded-3xl border border-light-gray/20 overflow-hidden shadow-premium flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner preview */}
                      <div className="h-40 bg-gray-150 relative">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                        {isExpired && (
                          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                            <span className="text-[10px] bg-red-600 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                              Expired Campaign
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info details */}
                      <div className="p-6 space-y-2 text-xs">
                        <h3 className="text-base font-extrabold text-dark line-clamp-1">{deal.title}</h3>
                        <p className="text-gray-500 line-clamp-2 leading-relaxed">{deal.description}</p>
                        
                        <div className="flex items-center space-x-1.5 text-gray-400 font-bold uppercase tracking-wider text-[9px] pt-1">
                          <FiCalendar className="w-3.5 h-3.5 text-primary" />
                          <span>Ends: {new Date(deal.endDate).toLocaleDateString()}</span>
                        </div>

                        {/* Prices */}
                        <div className="flex items-baseline space-x-2 pt-2">
                          <span className="text-base font-black text-primary">Rs. {deal.discountPrice}</span>
                          <span className="text-xs text-gray-400 line-through">Rs. {deal.originalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 border-t border-light-gray/10 flex justify-between items-center bg-light/30">
                      {/* Active Toggle Switch */}
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Campaign:</span>
                        <button
                          onClick={() => handleToggleActive(deal)}
                          disabled={isExpired}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            deal.isActive && !isExpired ? 'bg-primary' : 'bg-gray-200'
                          } ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              deal.isActive && !isExpired ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* CRUD Buttons */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(deal)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Edit Deal"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-55 rounded-xl transition-all"
                          title="Delete Deal"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 max-w-md mx-auto p-8 shadow-premium space-y-3">
              <FiAlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-dark">No Deals Configured</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Add discount combos or promotional deals to display on the deals page of your restaurant website.
              </p>
            </div>
          )}
        </section>
      )}

      {/* DEAL FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-darker/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-lg w-full shadow-2xl border border-light-gray/20 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-light-gray/10 flex justify-between items-center bg-light">
              <h3 className="font-extrabold text-base text-dark">
                {editMode ? 'Edit Combo Deal' : 'Add Promo Deal'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-dark p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 font-bold">
                  {formError}
                </div>
              )}

              {/* Deal Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Deal Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Student Deal 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Inclusions Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Inclusions / Description *</label>
                <textarea
                  rows="3"
                  placeholder="List down details e.g. 1 Zinger Burger + 1 Regular Fries + Soft Drink..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Pricing comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Original Price (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 600"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Discounted Price (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 450"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all font-bold text-dark/70"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Expiry Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all font-bold text-dark/70"
                    required
                  />
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Deal Banner URL / Upload *</label>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 py-2.5 px-4 bg-light border border-light-gray rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-bold text-dark/85 shadow-sm">
                    <FiUpload className="text-primary w-4 h-4" />
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploading && <span className="text-[10px] text-gray-400 animate-pulse">Uploading...</span>}
                  {uploadError && <span className="text-[10px] text-red-600 font-bold">{uploadError}</span>}
                </div>

                <input
                  type="text"
                  placeholder="Or paste external banner link..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />

                {image && (
                  <div className="relative w-36 h-20 rounded-xl overflow-hidden border border-light-gray mt-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Campaign status */}
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-light-gray rounded"
                />
                <label htmlFor="active" className="text-xs font-bold text-dark/80 cursor-pointer">
                  Activate this deal campaign (shows in Deals page)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
              >
                {submitting ? 'Saving deal...' : 'Save Combo Deal'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDeals;
