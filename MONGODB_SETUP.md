# MongoDB Compass (Local) Setup Guide

## Quick Setup for Local MongoDB

### 1. Install MongoDB Locally

If you don't have MongoDB installed:
- **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Or use MongoDB via Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### 2. Start MongoDB Service

**Windows:**
```bash
# MongoDB should start automatically as a service
# Or start manually:
net start MongoDB
```

**Check if MongoDB is running:**
```bash
# Should show MongoDB process
tasklist | findstr mongod
```

### 3. Set Connection String in .env

Create or update your `.env` file in the project root:

```env
# Local MongoDB Compass (Simple - No password)
MONGODB_URI=mongodb://localhost:27017/

# Or with database name
MONGODB_URI=mongodb://localhost:27017/ai_dungeon_master

# Or with specific IP
MONGODB_URI=mongodb://127.0.0.1:27017/ai_dungeon_master
```

### 4. Connect with MongoDB Compass

1. Open MongoDB Compass
2. Paste connection string: `mongodb://localhost:27017/`
3. Click "Connect"
4. You should see your databases

### 5. Verify Connection

The backend will automatically:
- Connect to `mongodb://localhost:27017/`
- Create database `ai_dungeon_master` automatically
- Create collections as needed (players, saves, quests)

## Connection String Formats

### Local MongoDB (No Authentication)
```
mongodb://localhost:27017/
mongodb://127.0.0.1:27017/
mongodb://localhost:27017/ai_dungeon_master
```

### Local MongoDB with Authentication (if you set it up)
```
mongodb://username:password@localhost:27017/ai_dungeon_master
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/ai_dungeon_master
```

## Troubleshooting

### MongoDB not running
```bash
# Check if MongoDB service is running
net start MongoDB

# Or start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Port 27017 already in use
```bash
# Check what's using port 27017
netstat -ano | findstr :27017

# Change MongoDB port or use different port in connection string
MONGODB_URI=mongodb://localhost:27018/
```

### Connection refused
- Make sure MongoDB service is running
- Check firewall settings
- Verify MongoDB is listening on port 27017

## Default Database Structure

The app will automatically create these collections:
- `players` - Player profiles and stats
- `saves` - Game save states
- `quests` - Active and completed quests

No manual setup needed! 🎉

