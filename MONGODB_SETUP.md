# MongoDB Setup Guide

Since Docker is not available, you'll need to install MongoDB manually. Here are your options:

## Option 1: Local MongoDB Installation (Recommended)

### Windows Installation:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and "msi" package
   - Download and run the installer

2. **Install MongoDB**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install MongoDB Compass (GUI tool) when prompted
   - Complete the installation

3. **Start MongoDB Service**
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`
   - Or start from Services (services.msc)

4. **Verify Installation**
   - Open Command Prompt
   - Run: `mongosh`
   - You should see the MongoDB shell

### macOS Installation:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux Installation:

```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Option 2: MongoDB Atlas (Cloud - Free)

1. **Create Atlas Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select provider and region
   - Click "Create"

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update Environment**
   - Copy `backend/env.example` to `backend/.env`
   - Replace the MONGODB_URL with your Atlas connection string

## Option 3: Use MongoDB Memory Server (Development Only)

For development, you can use an in-memory MongoDB:

```bash
# Install mongodb-memory-server
cd backend
npm install mongodb-memory-server
```

Then update `backend/server.js` to use in-memory MongoDB:

```javascript
// Add this at the top of server.js
const { MongoMemoryServer } = require('mongodb-memory-server');

// Replace the mongoose.connect with:
let mongoServer;
if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URL) {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
} else {
  await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/fashion_ai_db');
}
```

## Testing Your Setup

After installing MongoDB:

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Test the connection:**
   ```bash
   npm run test:backend
   ```

3. **Start the frontend:**
   ```bash
   npm start
   ```

## Troubleshooting

### MongoDB Connection Issues:
- Make sure MongoDB service is running
- Check if port 27017 is available
- Verify connection string in `backend/.env`

### Windows Specific:
- Run Command Prompt as Administrator
- Check Windows Services for MongoDB
- Use MongoDB Compass for GUI management

### Port Conflicts:
- MongoDB: 27017
- Backend: 8000
- Frontend: 3000

## Quick Start (After MongoDB Setup)

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend
cd backend && npm start

# In another terminal, start frontend
npm start
```

Or use the no-Docker script:
```bash
npm run dev:no-docker
``` 