import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiX, FiUpload } from 'react-icons/fi';

const ManageGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = async () => {
    try {
      const response = await axios.get('/api/gallery');
      if (response.data.success) {
        setGallery(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedId('');
    setTitle('');
    setCategory('Food');
    setDescription('');
    setImage('');
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || '');
    setImage(item.image);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

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
      console.error('Error uploading gallery image:', error);
      setUploadError('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !image.trim()) {
      setFormError('Please fill in all required fields (Title, Category, Image).');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const galleryData = {
      title,
      category,
      description,
      image,
    };

    try {
      if (editMode) {
        const response = await axios.put(`/api/gallery/${selectedId}`, galleryData);
        if (response.data.success) {
          setGallery((prev) =>
            prev.map((g) => (g._id === selectedId ? response.data.data : g))
          );
          setModalOpen(false);
        }
      } else {
        const response = await axios.post('/api/gallery', galleryData);
        if (response.data.success) {
          setGallery((prev) => [...prev, response.data.data]);
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving gallery item:', error);
      setFormError(error.response?.data?.message || 'Error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/gallery/${id}`);
      if (response.data.success) {
        setGallery((prev) => prev.filter((g) => g._id !== id));
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Gallery Management</h1>
          <p className="text-gray-500 text-xs">Upload food items or restaurant dining pictures to display in the website gallery grid.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 py-3 px-5 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md"
        >
          <FiPlus className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </section>

      {/* Gallery list grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-light-gray/20 overflow-hidden shadow-premium group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-secondary text-dark text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5 text-xs">
                      <h4 className="font-extrabold text-dark line-clamp-1">{item.title}</h4>
                      <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">
                        {item.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-light-gray/10 flex justify-end space-x-1 bg-light/20">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Edit photo details"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete photo"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 max-w-md mx-auto p-8 shadow-premium space-y-3">
              <FiAlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-dark">No Photos Found</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Add beautiful high-quality pictures of your food and dining lounge to build a stunning gallery.
              </p>
            </div>
          )}
        </section>
      )}

      {/* GALLERY FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-darker/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-md w-full shadow-2xl border border-light-gray/20">
            
            <div className="p-6 border-b border-light-gray/10 flex justify-between items-center bg-light">
              <h3 className="font-extrabold text-base text-dark">
                {editMode ? 'Edit Image Info' : 'Upload Gallery Photo'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-dark p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 font-bold">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Image Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Double Stack Zinger Burger"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all font-bold text-dark/70"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Dining">Dining</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Brief Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Prepared under strict hygiene guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                ></textarea>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Photo URL / Upload *</label>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 py-2.5 px-4 bg-light border border-light-gray rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-bold text-dark/85 shadow-sm">
                    <FiUpload className="text-primary w-4 h-4" />
                    <span>Upload File</span>
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
                  placeholder="Or paste external image URL..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />

                {image && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-light-gray mt-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
              >
                {submitting ? 'Uploading image...' : 'Save Gallery Image'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageGallery;
