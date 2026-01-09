# Tangier Pharmacy Guard API

Backend API for managing pharmacy guard data in Tangier, Morocco. Built with Node.js, Express, TypeScript, and Firebase.

## Features

- 🏥 Web scraping pharmacy data from official sources
- 🔥 Firebase Realtime Database integration
- 📍 Location-based nearest pharmacy finder
- ⏰ Automated daily data updates using cron jobs
- 🌐 RESTful API with CORS support
- 📱 Android app friendly

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project with Realtime Database enabled

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your Firebase credentials in the `.env` file:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Copy the credentials to your `.env` file

## Configuration

Edit the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

SCRAPER_URL=https://dimapermanence.site/pharmacies-de-garde-tanger/
SCRAPER_CRON_SCHEDULE=0 0 * * *

ALLOWED_ORIGINS=*
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Get Open Pharmacies
```
GET /api/pharmacies
```
Returns all pharmacies open today.

**Response:**
```json
{
  "success": true,
  "data": {
    "pharmacies": [...],
    "count": 10,
    "updatedAt": 1234567890
  }
}
```

### Get All Pharmacies
```
GET /api/pharmacies/all
```
Returns all pharmacies (including closed ones).

### Get Pharmacy by ID
```
GET /api/pharmacies/:id
```
Returns details of a specific pharmacy.

### Find Nearest Pharmacy
```
POST /api/pharmacies/nearest
Content-Type: application/json

{
  "latitude": 35.7595,
  "longitude": -5.8340
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pharmacy": {...},
    "distance": 1.234
  }
}
```

### Manual Scrape Trigger
```
POST /api/pharmacies/scrape
```
Manually trigger web scraping to update pharmacy data.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "message": "Successfully scraped and saved 15 pharmacies"
  }
}
```

## Database Structure

```
pharmacies/
├── {pharmacyId}
│   ├── id: string
│   ├── name: string
│   ├── address: string
│   ├── phone: string
│   ├── latitude: number
│   ├── longitude: number
│   ├── isOpen: boolean
│   ├── dayOfWeek: number (0-6, where 0 is Sunday)
│   └── updatedAt: timestamp
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Cron Schedule

The scraper runs automatically based on the `SCRAPER_CRON_SCHEDULE` environment variable.

Default: `0 0 * * *` (Every day at midnight)

Cron format:
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6, Sunday to Saturday)
│ │ │ │ │
* * * * *
```

Examples:
- `0 0 * * *` - Every day at midnight
- `0 */6 * * *` - Every 6 hours
- `30 2 * * *` - Every day at 2:30 AM

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (missing or invalid parameters)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (server-side errors)

All errors return JSON:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (development only)"
}
```

## CORS Configuration

CORS is enabled for all origins by default in development. Configure `ALLOWED_ORIGINS` in `.env` for production:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://anotherdomain.com
```

## Logging

The server logs all requests and important events:
- ✅ Success messages
- ❌ Error messages
- 🔍 Scraping operations
- ⏰ Scheduled tasks
- 📡 Server status

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Get open pharmacies
curl http://localhost:3000/api/pharmacies

# Find nearest pharmacy
curl -X POST http://localhost:3000/api/pharmacies/nearest \
  -H "Content-Type: application/json" \
  -d '{"latitude": 35.7595, "longitude": -5.8340}'

# Trigger manual scrape
curl -X POST http://localhost:3000/api/pharmacies/scrape
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_DATABASE_URL
- ALLOWED_ORIGINS (set to your frontend domain)

### Build

```bash
npm run build
npm start
```

### Docker (Optional)

A Dockerfile can be created for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## License

ISC

## Support

For issues and questions, please open an issue on the repository.
