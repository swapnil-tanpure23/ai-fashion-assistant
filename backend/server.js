const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/fashion_ai_db';

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// MongoDB Schemas
const userInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  zipCode: String
});

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageData: { type: String, required: true },
  prompt: String
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userInfo: { type: userInfoSchema, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  orderDate: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: String,
  city: String,
  zipCode: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Fashion AI Backend API' });
});

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { userInfo, items, total, orderDate, status = 'pending' } = req.body;
    
    const orderId = `ORD-${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '')}-${uuidv4().slice(0, 8)}`;
    
    const order = new Order({
      orderId,
      userInfo,
      items,
      total,
      orderDate,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: `Error creating order: ${error.message}` });
  }
});

// Get User Orders
app.get('/api/orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ 'userInfo.email': email });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: `Error fetching orders: ${error.message}` });
  }
});

// Get Order Status
app.get('/api/orders/:order_id/status', async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findOne({ orderId: order_id });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ orderId: order_id, status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: `Error fetching order status: ${error.message}` });
  }
});

// Update Order Status
app.put('/api/orders/:order_id/status', async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.findOneAndUpdate(
      { orderId: order_id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: `Error updating order status: ${error.message}` });
  }
});

// User Registration
app.post('/api/users/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: `Error registering user: ${error.message}` });
  }
});

// User Login
app.post('/api/users/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: `Error logging in: ${error.message}` });
  }
});

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: `Error fetching user profile: ${error.message}` });
  }
});

// Get User
app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: `Error fetching user: ${error.message}` });
  }
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    // Test MongoDB connection
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 