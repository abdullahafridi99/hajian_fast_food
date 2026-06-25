import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { FiTrendingUp, FiShoppingBag, FiLayers, FiDollarSign, FiClock, FiCheckSquare } from 'react-icons/fi';

const DashboardOverview = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    totalOrders: 0,
    activeDeals: 0,
    totalFoods: 0,
    pendingOrdersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const [ordersRes, foodsRes, dealsRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/foods'),
        axios.get('/api/deals'),
      ]);

      if (ordersRes.data.success && foodsRes.data.success && dealsRes.data.success) {
        const orders = ordersRes.data.data;
        const foods = foodsRes.data.data;
        const deals = dealsRes.data.data;

        // Calculate Revenue: Approved or Delivered orders
        const rev = orders
          .filter((o) => o.paymentStatus === 'Approved' || o.paymentStatus === 'Completed' || o.orderStatus === 'Delivered')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        // Pending orders count (either order status is Pending or payment status is Pending Verification)
        const pending = orders.filter(
          (o) => o.orderStatus === 'Pending' || o.paymentStatus === 'Pending Verification'
        ).length;

        // Active deals
        const activeDealsCount = deals.filter(
          (d) => d.isActive && new Date(d.endDate) > new Date()
        ).length;

        setMetrics({
          revenue: rev,
          totalOrders: orders.length,
          activeDeals: activeDealsCount,
          totalFoods: foods.length,
          pendingOrdersCount: pending,
        });

        // Get 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Compiling metrics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sales Revenue',
      value: `Rs. ${metrics.revenue.toLocaleString()}`,
      desc: 'Approved & completed sales',
      icon: <FiDollarSign className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      desc: 'All placed orders',
      icon: <FiShoppingBag className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrdersCount,
      desc: 'Needs approval / delivery',
      icon: <FiClock className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse',
    },
    {
      title: 'Active Food Menu',
      value: metrics.totalFoods,
      desc: 'Available items in inventory',
      icon: <FiLayers className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Dashboard Overview</h1>
          <p className="text-gray-500 text-xs">Real-time summaries and tracking controls for Hajian Foods.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center space-x-2 py-2 px-4 rounded-xl border border-light-gray hover:bg-gray-50 text-xs font-bold text-dark/80 transition-colors shadow-sm"
        >
          <span>Refresh stats</span>
        </button>
      </section>

      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`border rounded-3xl p-6 flex items-start justify-between shadow-premium bg-white`}
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
              <h3 className="text-2xl font-black text-dark leading-none">{card.value}</h3>
              <p className="text-[10px] text-gray-400 leading-none">{card.desc}</p>
            </div>
            
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Recent Orders Table */}
      <section className="bg-white rounded-3xl border border-light-gray/20 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-light-gray/10 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-dark uppercase tracking-wider">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-primary hover:underline uppercase tracking-wide"
          >
            Manage All Orders
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-light text-gray-400 font-bold uppercase tracking-wider border-b border-light-gray/20">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Pay Method</th>
                  <th className="py-4 px-6">Pay Status</th>
                  <th className="py-4 px-6">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/10">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-light/30 transition-colors font-medium">
                    <td className="py-4 px-6 text-primary font-bold">
                      <Link to={`/admin/orders?highlight=${order._id}`} className="hover:underline">
                        #{order._id.substring(18)}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-dark font-extrabold">{order.customerName}</td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-dark font-bold">Rs. {order.totalAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-500">{order.paymentMethod}</td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.paymentStatus} type="payment" />
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.orderStatus} type="order" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No orders placed yet.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default DashboardOverview;
