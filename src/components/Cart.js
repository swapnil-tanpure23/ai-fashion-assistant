import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Plus, Minus, User, Mail, Phone, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = ({ isOpen, onClose }) => {
  const { items, userInfo, removeFromCart, updateQuantity, clearCart, setUserInfo, getCartTotal, getCartCount } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    address: userInfo?.address || '',
    city: userInfo?.city || '',
    zipCode: userInfo?.zipCode || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && formData.name && formData.email && formData.phone) {
      setUserInfo(formData);
      setStep(2);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        userInfo: formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageData: item.imageData,
          prompt: item.prompt
        })),
        total: getCartTotal(),
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      // Use real API call
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      const result = await response.json();
      console.log('Order saved successfully:', result);
      
      setOrderSuccess(true);
      clearCart();
      setUserInfo(null);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setStep(1);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          zipCode: ''
        });
        setOrderSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="cart-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="cart-container"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCart size={24} />
            <h2>Shopping Cart ({getCartCount()} items)</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {orderSuccess ? (
            <motion.div
              className="success-message"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle size={64} className="success-icon" />
              <h3>Order Placed Successfully!</h3>
              <p>Thank you for your order. You will receive a confirmation email shortly.</p>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Cart Items */}
              {step === 1 && (
                <motion.div
                  className="cart-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {items.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingCart size={48} />
                      <h3>Your cart is empty</h3>
                      <p>Add some fashion items to get started!</p>
                    </div>
                  ) : (
                    <>
                      <div className="cart-items">
                        {items.map((item) => (
                          <motion.div
                            key={item.id}
                            className="cart-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="item-image">
                              <img src={`data:image/png;base64,${item.imageData}`} alt={item.name} />
                            </div>
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <p className="item-price">${item.price}</p>
                              <div className="quantity-controls">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="quantity-btn"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="quantity-btn"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="item-actions">
                              <p className="item-total">${calculateItemTotal(item)}</p>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="remove-btn"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Quick Checkout Form */}
                      <div className="quick-checkout">
                        <h3>Quick Checkout</h3>
                        <p className="checkout-hint">Fill in the required fields below to proceed to checkout</p>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>
                              <User size={16} />
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <Mail size={16} />
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <Phone size={16} />
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 2: User Information */}
              {step === 2 && (
                <motion.div
                  className="cart-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="form-section">
                    <h3>Shipping Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          <User size={16} />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <Mail size={16} />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <Phone size={16} />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter your city"
                        />
                      </div>
                      <div className="form-group">
                        <label>ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Order Summary */}
              {items.length > 0 && (
                <div className="order-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-items">
                    {items.map(item => (
                      <div key={item.id} className="summary-item">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${calculateItemTotal(item)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>${getCartTotal()}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!orderSuccess && items.length > 0 && (
          <div className="cart-footer">
            {step === 1 ? (
              <button
                className="next-btn"
                onClick={handleNextStep}
                disabled={!formData.name || !formData.email || !formData.phone}
              >
                {!formData.name || !formData.email || !formData.phone 
                  ? 'Fill required fields to checkout' 
                  : 'Proceed to Checkout'
                }
              </button>
            ) : (
              <div className="checkout-actions">
                <button className="back-btn" onClick={() => setStep(1)}>
                  Back to Cart
                </button>
                <button
                  className="order-btn"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Cart; 