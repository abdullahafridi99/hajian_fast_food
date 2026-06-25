import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiTrash2, FiAlertCircle, FiX, FiMessageSquare } from 'react-icons/fi';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('/api/testimonials/admin');
      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleToggleApprove = async (id, currentStatus) => {
    setActionLoading(true);
    try {
      const response = await axios.put(`/api/testimonials/${id}/approve`, {
        isApproved: !currentStatus,
      });
      if (response.data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === id ? response.data.data : t))
        );
      }
    } catch (error) {
      console.error('Error toggling testimonial approval:', error);
      alert('Error changing approval status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/testimonials/${id}`);
      if (response.data.success) {
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete review.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Reviews & Testimonials</h1>
          <p className="text-gray-500 text-xs">Moderates user-submitted ratings. Approve reviews to display them on the homepage.</p>
        </div>
        
        <button
          onClick={fetchTestimonials}
          className="py-2 px-4 rounded-xl border border-light-gray hover:bg-gray-50 text-xs font-bold text-dark/80 transition-colors shadow-sm"
        >
          Refresh Reviews
        </button>
      </section>

      {/* Testimonials List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section className="bg-white rounded-3xl border border-light-gray/20 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            {testimonials.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light text-gray-400 font-bold uppercase tracking-wider border-b border-light-gray/20">
                    <th className="py-4 px-6">Customer Name</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Review Content</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/10">
                  {testimonials.map((t) => (
                    <tr key={t._id} className="hover:bg-light/10 transition-colors font-medium">
                      <td className="py-4 px-6 text-dark font-extrabold">{t.name}</td>
                      <td className="py-4 px-6 text-secondary text-base">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        {Array.from({ length: 5 - t.rating }).map((_, i) => (
                          <span key={i} className="text-gray-200">★</span>
                        ))}
                      </td>
                      <td className="py-4 px-6 text-gray-600 max-w-sm font-sans truncate" title={t.review}>
                        {t.review}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            t.isApproved
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {t.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center flex items-center justify-center space-x-2">
                        {t.isApproved ? (
                          <button
                            onClick={() => handleToggleApprove(t._id, t.isApproved)}
                            disabled={actionLoading}
                            className="flex items-center space-x-1 py-1.5 px-3 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-bold text-[9px] uppercase transition-colors"
                            title="Unapprove review"
                          >
                            <FiX className="w-3 h-3" />
                            <span>Unapprove</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleApprove(t._id, t.isApproved)}
                            disabled={actionLoading}
                            className="flex items-center space-x-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[9px] uppercase transition-colors shadow-sm"
                            title="Approve review"
                          >
                            <FiCheck className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Review"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <FiMessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No customer reviews submitted yet.</p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};

export default ManageTestimonials;
