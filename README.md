# CSM - Client Service Management System

## Deployment Guide

### Prerequisites
1. Create accounts on the following platforms:
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For database hosting (free tier available)
   - [Render](https://render.com) or [Railway](https://railway.app) - For Node.js hosting (free tier available)

### Step 1: Set Up MongoDB Atlas
1. Create a new cluster (free tier is sufficient)
2. Create a database user with read/write permissions
3. Get your MongoDB connection string
4. Add your IP address to the network access list (or allow access from anywhere for testing)

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory with the following:
```env
PORT=8888
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

### Step 3: Deploy to Render
1. Create a new Web Service
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add all environment variables from `.env`

### Step 4: Update Frontend Configuration
If needed, update API endpoints in your frontend code to point to your new production URL.

## Local Development
1. Install dependencies: `npm install`
2. Create `.env` file using `.env.example` as template
3. Start server: `npm start`
4. Access at: `http://localhost:8888`

## Tech Stack
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Frontend: HTML, CSS, JavaScript

## API Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/current-user` - Get current user info

## Security Notes
- Never commit `.env` file
- Use strong JWT_SECRET in production
- Enable MongoDB Atlas network security
- Keep dependencies updated
