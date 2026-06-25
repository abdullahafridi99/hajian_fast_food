import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiX } from 'react-icons/fi';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setSelectedId('');
    setName('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditMode(true);
    setSelectedId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editMode) {
        // Edit category
        const response = await axios.put(`/api/categories/${selectedId}`, {
          name,
          description,
        });
        if (response.data.success) {
          setCategories((prev) =>
            prev.map((c) => (c._id === selectedId ? response.data.data : c))
          );
          setModalOpen(false);
        }
      } else {
        // Add category
        const response = await axios.post('/api/categories', {
          name,
          description,
        });
        if (response.data.success) {
          setCategories((prev) => [...prev, response.data.data]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All food items in this category will lose their reference.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/categories/${id}`);
      if (response.data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Category Management</h1>
          <p className="text-gray-500 text-xs">Create and manage categories for foods like Burgers, Pizzas, and Broasts.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 py-3 px-5 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </section>

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white rounded-3xl border border-light-gray/20 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Slug: /{cat.slug}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-2 line-clamp-2">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-light-gray/10">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Edit Category"
                    >
                      <FiEdit className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Category"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 max-w-md mx-auto p-8 shadow-premium space-y-3">
              <FiAlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-dark">No Categories Found</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Start by creating your first food category to begin building your restaurant menu.
              </p>
            </div>
          )}
        </section>
      )}

      {/* FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-dark-darker/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-md w-full shadow-2xl border border-light-gray/20">
            
            <div className="p-6 border-b border-light-gray/10 flex justify-between items-center bg-light">
              <h3 className="font-extrabold text-base text-dark">
                {editMode ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-dark p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 font-bold">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Burgers, Pizza, Broast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description about what is included in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
              >
                {submitting ? 'Saving...' : 'Save Category'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageCategories;
