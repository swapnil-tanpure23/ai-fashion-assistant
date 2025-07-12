import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ShoppingCart, RefreshCw, Heart, X, User, Mail, Phone, LogIn, LogOut, History } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import Cart from './components/Cart';
import Auth from './components/Auth';
import OrderHistory from './components/OrderHistory';
import './App.css';

const API_URL = 'https://5dc35b5df080.ngrok-free.app/generate';

function AppContent() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI Fashion Assistant! 👗✨ To get started, please sign in or create an account using the button in the header. Once you're signed in, you can ask me to suggest fashion items and I'll generate beautiful images for you!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart, getCartCount } = useCart();

  // Check for existing user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fashionUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Update welcome message for returning users
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Welcome back, ${userData.name}! 👋✨ You're signed in and ready to explore fashion. Ask me to suggest some fashion items and I'll generate beautiful images for you. Try saying something like 'suggest me a summer dress' or 'show me casual jeans'`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if user is authenticated
    if (!user) {
      const authMessage = {
        id: Date.now(),
        type: 'bot',
        content: "🔐 Please sign in or create an account to use the AI Fashion Assistant! Click the sign in button in the header to get started.",
        timestamp: new Date(),
        requiresAuth: true
      };
      setMessages(prev => [...prev, authMessage]);
      setInputValue('');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputValue,
          count: 4
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      setCurrentImages(data.images);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Here are some fashion suggestions based on your request! I've generated ${data.images.length} different options for you. Do you like any of these? If not, just ask for more suggestions!`,
        timestamp: new Date(),
        images: data.images
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating images:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Sorry! I'm having trouble generating images right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddToCart = (imageData, imageIndex, prompt) => {
    // Check if user is authenticated
    if (!user) {
      const authMessage = {
        id: Date.now(),
        type: 'bot',
        content: "🔐 Please sign in or create an account to add items to your cart! Click the sign in button in the header to get started.",
        timestamp: new Date(),
        requiresAuth: true
      };
      setMessages(prev => [...prev, authMessage]);
      return;
    }

    const item = {
      id: `${Date.now()}-${imageIndex}`,
      name: `${prompt} - Option ${imageIndex + 1}`,
      price: Math.floor(Math.random() * 50) + 29, // Random price between $29-$79
      imageData: imageData,
      prompt: prompt,
      addedAt: new Date().toISOString()
    };

    addToCart(item);

    const orderMessage = {
      id: Date.now(),
      type: 'user',
      content: `I'd like to add option ${imageIndex + 1} to my cart!`,
      timestamp: new Date()
    };

    const botResponse = {
      id: Date.now() + 1,
      type: 'bot',
      content: `Great choice! 🎉 I've added option ${imageIndex + 1} to your cart for $${item.price}. You can view your cart anytime by clicking the cart icon!`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, orderMessage, botResponse]);
  };

  const handleMoreOptions = () => {
    // Check if user is authenticated
    if (!user) {
      const authMessage = {
        id: Date.now(),
        type: 'bot',
        content: "🔐 Please sign in or create an account to use the AI Fashion Assistant! Click the sign in button in the header to get started.",
        timestamp: new Date(),
        requiresAuth: true
      };
      setMessages(prev => [...prev, authMessage]);
      return;
    }

    const moreMessage = {
      id: Date.now(),
      type: 'user',
      content: "Show me more options",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, moreMessage]);
    setInputValue('suggest me more fashion options');
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleImageClick = (imageData) => {
    setSelectedImage(imageData);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    
    // Update the welcome message for authenticated users
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Welcome back, ${userData.name}! 👋✨ You're now signed in and ready to explore fashion. Ask me to suggest some fashion items and I'll generate beautiful images for you. Try saying something like 'suggest me a summer dress' or 'show me casual jeans'`,
      timestamp: new Date()
    };
    
    // Replace the initial message with the authenticated welcome message
    setMessages([welcomeMessage]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fashionUser');
    localStorage.removeItem('fashionToken');
    
    // Reset messages to initial state for non-authenticated users
    const initialMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hi! I'm your AI Fashion Assistant! 👗✨ To get started, please sign in or create an account using the button in the header. Once you're signed in, you can ask me to suggest fashion items and I'll generate beautiful images for you!",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  };

  return (
    <div className="app">
      <div className="chat-container">
        {/* Header */}
        <motion.div 
          className="chat-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="bot-avatar">
              <Sparkles size={24} />
            </div>
            <div className="header-text">
              <h1>AI Fashion Assistant</h1>
              <p>Your personal style companion</p>
            </div>
            <div className="header-actions">
              {user && (
                <button 
                  className="header-btn history-btn"
                  onClick={() => setIsOrderHistoryOpen(true)}
                  title="Order History"
                >
                  <History size={20} />
                </button>
              )}
                          <button 
              className={`cart-button ${user ? 'authenticated' : ''}`}
              onClick={() => user ? setIsCartOpen(true) : setIsAuthOpen(true)}
              title={user ? "View Cart" : "Sign in to view cart"}
            >
              <ShoppingCart size={20} />
              {getCartCount() > 0 && user && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>
              {user ? (
                <div className="user-menu">
                  <button 
                    className="header-btn user-btn"
                    onClick={() => setIsAuthOpen(true)}
                    title={user.name}
                  >
                    <User size={20} />
                    <span className="user-name">{user.name}</span>
                  </button>
                  <button 
                    className="header-btn logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  className="header-btn auth-btn"
                  onClick={() => setIsAuthOpen(true)}
                  title="Sign In / Sign Up"
                >
                  <LogIn size={20} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="messages-container">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`message ${message.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`message-content ${message.requiresAuth ? 'requires-auth' : ''}`}>
                  {message.content}
                  {message.isError && (
                    <div className="error-indicator">⚠️</div>
                  )}
                </div>
                
                {message.images && (
                  <div className="image-grid">
                    {message.images.map((imageData, imgIndex) => (
                      <motion.div
                        key={imgIndex}
                        className="image-item"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: imgIndex * 0.1 }}
                      >
                        <img
                          src={`data:image/png;base64,${imageData}`}
                          alt={`Fashion option ${imgIndex + 1}`}
                          onClick={() => handleImageClick(imageData)}
                        />
                        <div className="image-actions">
                          <button
                            className="action-btn cart-btn"
                            onClick={() => handleAddToCart(imageData, imgIndex, inputValue)}
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                          <button
                            className="action-btn like-btn"
                            onClick={() => handleAddToCart(imageData, imgIndex, inputValue)}
                          >
                            <Heart size={16} />
                            Like
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="message bot loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="message-content">
                <div className="loading-dots">Generating fashion suggestions</div>
              </div>
            </motion.div>
          )}

          {currentImages.length > 0 && (
            <motion.div
              className="quick-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button className="quick-action-btn" onClick={handleMoreOptions}>
                <RefreshCw size={16} />
                Show More Options
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div 
          className="input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!user && (
            <div className="auth-required-banner">
              <LogIn size={16} />
              <span>Sign in to use the AI Fashion Assistant</span>
            </div>
          )}
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Ask me for fashion suggestions... (e.g., 'suggest me a summer dress')" : "Sign in to start chatting..."}
              disabled={isLoading || !user}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !user}
            >
              <Send size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <Auth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Order History Modal */}
      <OrderHistory 
        isOpen={isOrderHistoryOpen} 
        onClose={() => setIsOrderHistoryOpen(false)} 
        user={user}
      />

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </button>
              <img
                src={`data:image/png;base64,${selectedImage}`}
                alt="Fashion item"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App; 