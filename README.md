# Fashion AI Project

A full-stack application with React frontend and Node.js backend with MongoDB database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (see MONGODB_SETUP.md for installation)
- npm or yarn
- Docker and Docker Compose (optional - for automatic MongoDB setup)

### One-Command Setup

#### With Docker (if installed):
```bash
npm run dev
```

#### Without Docker:
```bash
npm run dev:no-docker
```

This command will:
1. Install backend dependencies
2. Guide you through MongoDB setup
3. Start the Node.js backend
4. Start the React frontend

### Manual Setup

#### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Start MongoDB and Backend
```bash
# Option A: With Docker (if installed)
docker-compose up -d

# Option B: Manual MongoDB setup
# 1. Install MongoDB (see MONGODB_SETUP.md)
# 2. Start MongoDB service
# 3. Start backend
cd backend
npm start
```

#### 3. Start Frontend
```bash
npm start
```

## 📁 Project Structure

```
my-app/
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── Dockerfile          # Backend Docker configuration
├── src/                    # React frontend
├── docker-compose.yml      # Docker services configuration
├── start-project.js        # Project startup script
└── package.json           # Frontend dependencies
```

## 🔧 Available Scripts

### Frontend
- `npm start` - Start React development server
- `npm build` - Build for production
- `npm test` - Run tests

### Backend
- `npm run backend` - Start backend server
- `npm run backend:dev` - Start backend with nodemon

### Docker
- `npm run docker:up` - Start MongoDB and backend containers
- `npm run docker:down` - Stop all containers
- `npm run docker:logs` - View container logs

### Full Project
- `npm run dev` - Start entire project (frontend + backend + MongoDB)

## 🌐 API Endpoints

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:email` - Get user orders
- `GET /api/orders/:order_id/status` - Get order status
- `PUT /api/orders/:order_id/status` - Update order status

### Users
- `POST /api/users` - Create/update user
- `GET /api/users/:email` - Get user by email

### Health
- `GET /health` - Health check endpoint

## 🗄️ Database

MongoDB is automatically started with Docker and includes:
- Database: `fashion_ai_db`
- Collections: `orders`, `users`
- Authentication: admin/password123

## 🔍 Troubleshooting

### MongoDB Connection Issues
1. Ensure Docker is running
2. Check if MongoDB container is up: `docker ps`
3. Verify connection string in `backend/env.example`

### Port Conflicts
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MongoDB: localhost:27017

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

## 🛠️ Development

### Environment Variables
Copy `backend/env.example` to `backend/.env` and adjust as needed:

```env
NODE_ENV=development
PORT=8000
MONGODB_URL=mongodb://admin:password123@localhost:27017/fashion_ai_db?authSource=admin
```

### Adding New Features
1. Backend: Add routes in `backend/server.js`
2. Frontend: Add components in `src/components/`
3. Database: Add schemas in `backend/server.js`

## 📦 Production Deployment

1. Build frontend: `npm run build`
2. Set production environment variables
3. Use production MongoDB instance
4. Deploy backend to your preferred hosting service
