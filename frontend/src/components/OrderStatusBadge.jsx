import React from 'react';

const OrderStatusBadge = ({ status, type = 'order' }) => {
  const getBadgeStyles = () => {
    if (type === 'order') {
      switch (status) {
        case 'Pending':
          return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Preparing':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Out for Delivery':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Delivered':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      // Payment status
      switch (status) {
        case 'Pending':
          return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Pending Verification':
          return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
        case 'Approved':
          return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'Rejected':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'Completed':
          return 'bg-green-100 text-green-800 border-green-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getBadgeStyles()}`}
    >
      {status}
    </span>
  );
};

export default OrderStatusBadge;
