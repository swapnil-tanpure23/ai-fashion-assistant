import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CheckCircle, Clock, User, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fashionToken');
      
      const response = await fetch(`http://localhost:8000/api/orders/${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'confirmed':
        return <Package size={16} className="status-icon confirmed" />;
      case 'shipped':
        return <Truck size={16} className="status-icon shipped" />;
      case 'delivered':
        return <CheckCircle size={16} className="status-icon delivered" />;
      case 'cancelled':
        return <X size={16} className="status-icon cancelled" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="order-history-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="order-history-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="order-history-header">
          <div className="order-history-title">
            <ShoppingBag size={24} />
            <h2>Order History</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="order-history-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchOrders} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>No orders yet</h3>
              <p>Start shopping to see your order history here!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <motion.div
                  key={order.orderId}
                  className="order-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.orderId}</h3>
                      <div className="order-meta">
                        <span className="order-date">
                          <Calendar size={14} />
                          {formatDate(order.orderDate)}
                        </span>
                        <span className="order-total">
                          <DollarSign size={14} />
                          ${order.total}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img src={`data:image/png;base64,${item.imageData}`} alt={item.name} />
                        </div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p className="item-price">${item.price} x {item.quantity}</p>
                          <p className="item-total">${calculateItemTotal(item)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="shipping-info">
                      <User size={14} />
                      <span>{order.userInfo.name}</span>
                    </div>
                    <div className="order-actions">
                      <button className="track-btn">
                        Track Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderHistory; 