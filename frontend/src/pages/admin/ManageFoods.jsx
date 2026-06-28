import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertCircle, FiX, FiCheck, FiUpload } from 'react-icons/fi';

const ManageFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      console.error('Error fetching foods inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Toggle Availability
  const handleToggleAvailability = async (food) => {
    try {
      const response = await axios.put(`/api/foods/${food._id}`, {
        isAvailable: !food.isAvailable,
      });
      if (response.data.success) {
        setFoods((prev) =>
          prev.map((f) => (f._id === food._id ? response.data.data : f))
        );
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error updating availability. Please try again.');
    }
  };

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedId('');
    setName('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setDescription('');
    setImage('');
    setIsAvailable(true);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditMode(true);
    setSelectedId(food._id);
    setName(food.name);
    setCategory(food.category?._id || food.category || '');
    setPrice(food.price);
    setDescription(food.description || '');
    setImage(food.image);
    setIsAvailable(food.isAvailable);
    setFormError('');
    setUploadError('');
    setModalOpen(true);
  };

  // Upload food photo
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image exceeds the 5MB size limit.');
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
      console.error('Error uploading food photo:', error);
      const errMsg = error.response?.data?.message || 'Failed to upload image. Try again.';
      setUploadError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category || !price || !image.trim()) {
      setFormError('Please fill in all required fields (Name, Category, Price, Image).');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const foodData = {
      name,
      category,
      price: Number(price),
      description,
      image,
      isAvailable,
    };

    try {
      if (editMode) {
        const response = await axios.put(`/api/foods/${selectedId}`, foodData);
        if (response.data.success) {
          setFoods((prev) =>
            prev.map((f) => (f._id === selectedId ? response.data.data : f))
          );
          setModalOpen(false);
        }
      } else {
        const response = await axios.post('/api/foods', foodData);
        if (response.data.success) {
          setFoods((prev) => [...prev, response.data.data]);
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving food item:', error);
      setFormError(error.response?.data?.message || 'Error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/foods/${id}`);
      if (response.data.success) {
        setFoods((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      alert('Failed to delete food. Please try again.');
    }
  };

  // Filter Foods
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.description &&
        food.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' ||
      food.category?._id === categoryFilter ||
      food.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Foods Management</h1>
          <p className="text-gray-500 text-xs">Create, edit, and delete food items. Toggle availability instantly.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 py-3 px-5 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Food Item</span>
        </button>
      </section>

      {/* Search and Filters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by food name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs focus:border-primary transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-3 px-4 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs focus:border-primary transition-all font-bold text-dark/70"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </section>

      {/* Inventory listing */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section className="bg-white rounded-3xl border border-light-gray/20 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            {filteredFoods.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light text-gray-400 font-bold uppercase tracking-wider border-b border-light-gray/20">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Food Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Available</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/10">
                  {filteredFoods.map((food) => (
                    <tr key={food._id} className="hover:bg-light/10 transition-colors font-medium">
                      <td className="py-3 px-6">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 object-cover rounded-xl border border-light-gray"
                        />
                      </td>
                      <td className="py-3 px-6 text-dark font-extrabold">{food.name}</td>
                      <td className="py-3 px-6 text-gray-500 font-bold">
                        {food.category?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-6 text-dark font-bold">Rs. {food.price.toLocaleString()}</td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleToggleAvailability(food)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            food.isAvailable ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              food.isAvailable ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-6 text-center flex items-center justify-center space-x-2 h-20">
                        <button
                          onClick={() => handleOpenEditModal(food)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Edit Food"
                        >
                          <FiEdit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(food._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Food"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <FiAlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No food items found.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOD FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-darker/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-lg w-full shadow-2xl border border-light-gray/20 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-light-gray/10 flex justify-between items-center bg-light">
              <h3 className="font-extrabold text-base text-dark">
                {editMode ? 'Edit Food Item' : 'Add Food Item'}
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

              {/* Food Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Food Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Crown Crust Pizza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all font-bold text-dark/70"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Price (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 950"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Description</label>
                <textarea
                  rows="3"
                  placeholder="Add ingredients, sizing, and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                ></textarea>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Food Image URL / Upload *</label>
                
                {/* File picker */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 py-2.5 px-4 bg-light border border-light-gray rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-bold text-dark/85 shadow-sm">
                    <FiUpload className="text-primary w-4 h-4" />
                    <span>Upload Image</span>
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

                {/* Text Input fallback */}
                <input
                  type="text"
                  placeholder="Or paste external image URL..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />

                {/* Preview */}
                {image && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-light-gray mt-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="availability"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-light-gray rounded"
                />
                <label htmlFor="availability" className="text-xs font-bold text-dark/80 cursor-pointer">
                  Available for ordering (shows in menu)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
              >
                {submitting ? 'Saving item...' : 'Save Food Item'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageFoods;
