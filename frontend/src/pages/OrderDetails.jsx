import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { FiRefreshCw, FiClock, FiShoppingBag, FiMapPin, FiPhone, FiUser, FiCreditCard } from 'react-icons/fi';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Order not found or invalid Order ID.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    
    // Auto refresh every 30 seconds for live tracking
    const interval = setInterval(fetchOrderDetails, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500 font-medium font-sans">Loading receipt details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-xl font-extrabold text-dark">Order Not Found</h2>
        <p className="text-gray-500 text-xs leading-relaxed">{error}</p>
        <Link
          to="/menu"
          className="inline-block py-3 px-8 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary hover:text-dark-darker transition-colors"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  // Helper to draw status stepper
  const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. Stepper & Confirmation Banner */}
      <section className="bg-white rounded-[40px] border border-light-gray/20 p-8 shadow-premium text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
        
        <div className="space-y-3">
          <span className="bg-green-100 text-green-800 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-green-200">
            ✓ Order Successfully Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-dark">Order #{order._id.substring(18)}</h1>
          <p className="text-gray-500 text-xs max-w-lg mx-auto leading-relaxed">
            Thank you for ordering from Hajian Foods! Your order is active. You can bookmark this page or refresh to track your order in real-time.
          </p>
        </div>

        {/* Live Status Tracker Stepper */}
        {order.orderStatus !== 'Cancelled' ? (
          <div className="max-w-3xl mx-auto pt-6">
            <div className="flex items-center justify-between relative">
              {/* Stepper background line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 -z-10 rounded-full"></div>
              {/* Stepper active line */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {/* Steps circles */}
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                        isCurrent
                          ? 'bg-primary text-white scale-115 ring-4 ring-primary/20'
                          : isActive
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-extrabold ${
                        isCurrent ? 'text-primary' : isActive ? 'text-dark/80' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs font-bold max-w-sm mx-auto">
            ❌ This order has been Cancelled by the administration.
          </div>
        )}

        <div className="pt-4 flex items-center justify-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 py-2 px-5 rounded-xl border border-light-gray/40 hover:bg-gray-50 text-xs font-bold text-dark/80 transition-colors shadow-sm disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>
      </section>

      {/* 2. Order Information Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Receipt & Items Summary (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order items */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-6 sm:p-8 shadow-premium space-y-6">
            <h3 className="text-lg font-bold text-dark flex items-center space-x-2 border-b border-light-gray/10 pb-4">
              <FiShoppingBag className="text-primary w-5 h-5" />
              <span>Items Ordered</span>
            </h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs border-b border-light-gray/10 pb-3">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-dark">{item.name}</p>
                    <p className="text-gray-400 font-bold">
                      {item.itemType} | {item.quantity} x Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-extrabold text-dark text-sm">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations block */}
            <div className="space-y-3 pt-2 text-xs font-bold uppercase tracking-wider text-gray-500 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Items Total:</span>
                <span className="text-dark">Rs. {(order.totalAmount - (order.totalAmount >= 1000 || order.totalAmount < 100 ? 0 : 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery charge:</span>
                <span className="text-dark">
                  {order.totalAmount >= 1000 ? <span className="text-green-600 font-black">Free</span> : 'Rs. 100'}
                </span>
              </div>
              <hr className="border-light-gray/20" />
              <div className="flex justify-between text-dark pt-1">
                <span className="text-sm font-black">Paid / Total Amount:</span>
                <span className="text-lg font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customer & Billing details */}
        <div className="space-y-6">
          
          {/* Customer shipment coordinates */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-base font-bold text-dark flex items-center space-x-2 border-b border-light-gray/10 pb-4">
              <FiUser className="text-primary w-5 h-5" />
              <span>Recipient Coordinates</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3 text-gray-600">
                <FiUser className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Name</p>
                  <p className="font-extrabold text-dark mt-0.5">{order.customerName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-gray-600">
                <FiPhone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Phone</p>
                  <p className="font-extrabold text-dark mt-0.5">{order.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-gray-600">
                <FiMapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Address</p>
                  <p className="font-bold text-dark mt-0.5 leading-relaxed">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing / Payment status */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-base font-bold text-dark flex items-center space-x-2 border-b border-light-gray/10 pb-4">
              <FiCreditCard className="text-primary w-5 h-5" />
              <span>Billing Parameters</span>
            </h3>

            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              <div className="flex justify-between items-center">
                <span>Method</span>
                <span className="text-dark font-extrabold text-xs">{order.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Pay Status</span>
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              
              <div className="flex justify-between items-center">
                <span>Order Status</span>
                <OrderStatusBadge status={order.orderStatus} type="order" />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span>Order Date</span>
                <span className="text-gray-400 font-medium">
                  {new Date(order.orderDate).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};

export default OrderDetails;
