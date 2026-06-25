import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { FiSearch, FiEye, FiCheck, FiX, FiClock, FiTruck, FiSmile, FiAlertCircle } from 'react-icons/fi';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [zoomReceipt, setZoomReceipt] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const location = useLocation();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Check if we need to highlight a specific order from dashboard navigation
    const queryParams = new URLSearchParams(location.search);
    const highlightId = queryParams.get('highlight');
    if (highlightId) {
      // Find order and open detailed modal
      const fetchHighlight = async () => {
        try {
          const res = await axios.get(`/api/orders/${highlightId}`);
          if (res.data.success) {
            setSelectedOrder(res.data.data);
            setViewModalOpen(true);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchHighlight();
    }
  }, [location.search]);

  // Update order status/payment status
  const handleUpdateStatus = async (orderId, updates) => {
    setActionLoading(true);
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, updates);
      if (response.data.success) {
        // Refresh local orders list
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? response.data.data : o))
        );
        // If modal is open for this order, update it too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || order.orderStatus === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Order Management</h1>
          <p className="text-gray-500 text-xs">Verify payments, change cooking status, and manage deliveries.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="py-2 px-4 rounded-xl border border-light-gray hover:bg-gray-55 text-xs font-bold text-dark/80 transition-colors shadow-sm"
        >
          Refresh Orders
        </button>
      </section>

      {/* Filter and Search controls */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs focus:border-primary transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Order status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-3 px-4 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs focus:border-primary transition-all font-bold text-dark/70"
        >
          <option value="all">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Payment status filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="py-3 px-4 bg-white border border-light-gray/40 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs focus:border-primary transition-all font-bold text-dark/70"
        >
          <option value="all">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
      </section>

      {/* Orders Grid/Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <section className="bg-white rounded-3xl border border-light-gray/20 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            {filteredOrders.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light text-gray-400 font-bold uppercase tracking-wider border-b border-light-gray/20">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6">Order Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/10">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-light/20 transition-colors font-medium">
                      <td className="py-4 px-6 text-primary font-bold">
                        #{order._id.substring(18)}
                      </td>
                      <td className="py-4 px-6 text-dark font-extrabold">{order.customerName}</td>
                      <td className="py-4 px-6 text-gray-500">{order.phoneNumber}</td>
                      <td className="py-4 px-6 text-dark font-bold">Rs. {order.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-gray-500 font-bold">{order.paymentMethod}</td>
                      <td className="py-4 px-6">
                        <OrderStatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                      <td className="py-4 px-6">
                        <OrderStatusBadge status={order.orderStatus} type="order" />
                      </td>
                      <td className="py-4 px-6 text-center flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setViewModalOpen(true);
                          }}
                          className="p-2 bg-light hover:bg-primary/10 hover:text-primary rounded-xl text-dark transition-all"
                          title="View order details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <FiAlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No orders found matching filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* DETAILED VIEW MODAL */}
      {viewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-dark-darker/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-3xl w-full shadow-2xl border border-light-gray/20 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-light-gray/10 flex justify-between items-center bg-light">
              <div>
                <h3 className="font-extrabold text-base text-dark">
                  Order Details - #{selectedOrder._id}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">
                  Placed on: {new Date(selectedOrder.orderDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-400 hover:text-dark p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-grow">
              
              {/* Stepper info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Info */}
                <div className="space-y-3 bg-light/50 p-5 rounded-2xl border border-light-gray/20">
                  <h4 className="font-bold text-dark text-xs border-b border-light-gray/10 pb-1 uppercase tracking-wider">
                    Delivery Address
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p><b>Recipient:</b> {selectedOrder.customerName}</p>
                    <p><b>Phone:</b> {selectedOrder.phoneNumber}</p>
                    <p className="leading-relaxed"><b>Address:</b> {selectedOrder.address}</p>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="space-y-3 bg-light/50 p-5 rounded-2xl border border-light-gray/20">
                  <h4 className="font-bold text-dark text-xs border-b border-light-gray/10 pb-1 uppercase tracking-wider">
                    Billing Parameters
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <p><b>Method:</b> {selectedOrder.paymentMethod}</p>
                    <p className="flex items-center space-x-2">
                      <b>Payment Status:</b> 
                      <OrderStatusBadge status={selectedOrder.paymentStatus} type="payment" />
                    </p>
                    <p className="flex items-center space-x-2">
                      <b>Order Status:</b> 
                      <OrderStatusBadge status={selectedOrder.orderStatus} type="order" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-light-gray/20 rounded-2xl overflow-hidden bg-white">
                <div className="bg-light p-3 font-bold border-b border-light-gray/20 uppercase tracking-wider text-dark/70 text-[10px]">
                  Ordered Items
                </div>
                <div className="divide-y divide-light-gray/10 px-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="py-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-dark">{item.name}</p>
                        <p className="text-gray-400 font-bold">Qty: {item.quantity} x Rs. {item.price}</p>
                      </div>
                      <span className="font-extrabold text-dark text-sm">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  {/* Total row */}
                  <div className="py-4 flex justify-between font-black text-dark text-sm">
                    <span>Grand Total:</span>
                    <span className="text-primary font-black text-base">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Receipt screenshot uploader preview for digital transfers */}
              {selectedOrder.receiptImage && (
                <div className="space-y-2 border border-light-gray/20 p-5 rounded-2xl bg-white">
                  <h4 className="font-bold text-dark uppercase tracking-wider text-[10px]">
                    📄 Uploaded Payment Receipt Screenshot
                  </h4>
                  
                  <div className="relative w-fit group">
                    <img
                      src={selectedOrder.receiptImage}
                      alt="Uploaded Receipt Proof"
                      className="w-40 h-40 object-cover rounded-xl border border-light-gray shadow-sm cursor-zoom-in hover:opacity-90"
                      onClick={() => setZoomReceipt(true)}
                    />
                    <div className="absolute inset-0 bg-dark/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl">
                      <span className="text-[10px] bg-dark text-white font-bold py-1 px-2.5 rounded-full shadow">
                        Click to zoom
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-light-gray/10 bg-light flex flex-wrap gap-3 justify-between items-center">
              
              {/* Payment Verification Buttons */}
              <div className="flex space-x-2">
                {selectedOrder.paymentMethod !== 'Cash on Delivery' && selectedOrder.paymentStatus === 'Pending Verification' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, { paymentStatus: 'Approved', orderStatus: 'Preparing' })}
                      disabled={actionLoading}
                      className="flex items-center space-x-1.5 py-2 px-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold text-[10px] uppercase shadow-sm"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Approve Pay</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, { paymentStatus: 'Rejected' })}
                      disabled={actionLoading}
                      className="flex items-center space-x-1.5 py-2 px-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold text-[10px] uppercase shadow-sm"
                    >
                      <FiX className="w-3.5 h-3.5" />
                      <span>Reject Pay</span>
                    </button>
                  </>
                )}
              </div>

              {/* Order Status Progress pipeline */}
              <div className="flex flex-wrap gap-2">
                {selectedOrder.orderStatus === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, { orderStatus: 'Preparing' })}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 py-2 px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-[10px] uppercase shadow-sm"
                  >
                    <FiClock className="w-3.5 h-3.5" />
                    <span>Accept & Cook</span>
                  </button>
                )}

                {selectedOrder.orderStatus === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, { orderStatus: 'Out for Delivery' })}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 py-2 px-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-bold text-[10px] uppercase shadow-sm"
                  >
                    <FiTruck className="w-3.5 h-3.5" />
                    <span>Out for Delivery</span>
                  </button>
                )}

                {selectedOrder.orderStatus === 'Out for Delivery' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, { orderStatus: 'Delivered', paymentStatus: 'Completed' })}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 py-2 px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-[10px] uppercase shadow-sm"
                  >
                    <FiSmile className="w-3.5 h-3.5" />
                    <span>Mark Delivered</span>
                  </button>
                )}

                {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, { orderStatus: 'Cancelled', paymentStatus: selectedOrder.paymentStatus === 'Pending Verification' ? 'Rejected' : selectedOrder.paymentStatus })}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 py-2 px-3 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-[10px] uppercase"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ZOOM RECEIPT IMAGE MODAL */}
      {zoomReceipt && selectedOrder && (
        <div
          className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomReceipt(false)}
        >
          <button
            onClick={() => setZoomReceipt(false)}
            className="absolute top-6 right-6 text-white hover:text-primary p-2 bg-white/10 rounded-full"
          >
            <FiX className="w-6 h-6" />
          </button>
          <img
            src={selectedOrder.receiptImage}
            alt="Zoomed Payment Receipt"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};

export default ManageOrders;
