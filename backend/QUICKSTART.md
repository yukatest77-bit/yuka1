# Quick Start Guide

Get the Tangier Pharmacy Guard API up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier is fine)
- Basic command line knowledge

## Step 1: Install Dependencies (30 seconds)

```bash
cd backend
npm install
```

## Step 2: Firebase Setup (2 minutes)

1. Go to https://console.firebase.google.com/
2. Create a new project (name it anything you like)
3. Enable **Realtime Database** (not Firestore):
   - Click "Realtime Database" in the sidebar
   - Click "Create Database"
   - Choose "test mode" for now
4. Get your credentials:
   - Click the gear icon → Project Settings
   - Go to "Service Accounts" tab
   - Click "Generate new private key"
   - Download the JSON file

## Step 3: Configure Environment (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials from the downloaded JSON:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## Step 4: Start the Server (10 seconds)

```bash
npm run dev
```

You should see:
```
✅ Firebase initialized successfully
🚀 Tangier Pharmacy Guard API
📡 Server running on port 3000
⏰ Starting scheduler...
```

## Step 5: Test It! (1 minute)

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-09T12:00:00.000Z",
  "uptime": 5.123
}
```

### Test 2: Trigger Initial Data Load
```bash
curl -X POST http://localhost:3000/api/pharmacies/scrape
```

This will scrape pharmacy data and save it to Firebase.

### Test 3: Get Open Pharmacies
```bash
curl http://localhost:3000/api/pharmacies
```

You should see a list of pharmacies!

### Test 4: Find Nearest Pharmacy
```bash
curl -X POST http://localhost:3000/api/pharmacies/nearest \
  -H "Content-Type: application/json" \
  -d '{"latitude": 35.7595, "longitude": -5.8340}'
```

## Step 6: Verify in Firebase

1. Go back to Firebase Console
2. Click "Realtime Database"
3. You should see a `pharmacies` node with data!

## Troubleshooting

### Error: "PERMISSION_DENIED"
- Your Firebase credentials are wrong
- Double-check your `.env` file
- Make sure Realtime Database is enabled (not Firestore)

### Error: "Cannot find module"
- Run `npm install` again
- Make sure you're in the `backend` directory

### Error: "Port 3000 is already in use"
- Change the PORT in `.env` to 3001 or another free port
- Or stop the process using port 3000

### No data after scraping
- Check the logs for scraping errors
- The target website might be down or changed
- Check your internet connection

## Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **Import Postman collection**: [postman_collection.json](postman_collection.json)
3. **Set up production Firebase rules**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
4. **Deploy using Docker**: See main [README.md](README.md)

## Development Tips

### Auto-reload on changes
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Check for errors
```bash
npm run lint
npm run type-check
```

### Manual scrape (update data)
```bash
curl -X POST http://localhost:3000/api/pharmacies/scrape
```

## Common Commands

```bash
# Development
npm run dev           # Start with hot reload

# Production
npm run build         # Compile TypeScript
npm start            # Start production server

# Testing
npm run lint         # Check code quality
npm run type-check   # Check TypeScript types

# Docker
docker-compose up    # Start with Docker
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/pharmacies` | Get open pharmacies today |
| GET | `/api/pharmacies/all` | Get all pharmacies |
| GET | `/api/pharmacies/:id` | Get specific pharmacy |
| POST | `/api/pharmacies/nearest` | Find nearest pharmacy |
| POST | `/api/pharmacies/scrape` | Update pharmacy data |

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for Firebase issues
- Open an issue on GitHub

## Success! 🎉

If you can see pharmacy data in your API responses and Firebase console, you're all set!

The scraper will automatically run daily at midnight to update the data.
