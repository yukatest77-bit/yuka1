# Tangier Pharmacy Guard Application

A comprehensive application for tracking pharmacy guard schedules in Tangier, Morocco. The project consists of a Next.js frontend and a Node.js + Express + Firebase backend.

## Project Structure

```
.
├── app/                    # Next.js frontend
├── backend/               # Node.js + Express + Firebase backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (Firebase, Scraper, Scheduler)
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript type definitions
│   │   └── server.ts     # Main server file
│   ├── .env.example      # Environment variables template
│   ├── README.md         # Backend documentation
│   └── FIREBASE_SETUP.md # Firebase setup guide
└── README.md             # This file
```

## Features

### Backend
- 🏥 **Web Scraping**: Automatically scrapes pharmacy data from official sources
- 🔥 **Firebase Integration**: Real-time database for pharmacy data
- 📍 **Geolocation**: Find nearest pharmacy based on user location
- ⏰ **Scheduled Updates**: Daily automatic data updates using cron jobs
- 🌐 **RESTful API**: Clean and documented API endpoints
- 📱 **CORS Enabled**: Ready for mobile app integration
- 🐳 **Docker Support**: Containerized deployment

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/pharmacies` - Get open pharmacies today
- `GET /api/pharmacies/all` - Get all pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy by ID
- `POST /api/pharmacies/nearest` - Find nearest pharmacy
- `POST /api/pharmacies/scrape` - Manual scrape trigger

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (see [FIREBASE_SETUP.md](backend/FIREBASE_SETUP.md)):
   - Create a Firebase project
   - Enable Realtime Database
   - Download service account credentials

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Documentation

- **Backend API Documentation**: [backend/README.md](backend/README.md)
- **Firebase Setup Guide**: [backend/FIREBASE_SETUP.md](backend/FIREBASE_SETUP.md)
- **Postman Collection**: [backend/postman_collection.json](backend/postman_collection.json)

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Frontend Development

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Backend Deployment

#### Using Docker

```bash
cd backend
docker build -t tangier-pharmacy-api .
docker run -p 3000:3000 --env-file .env tangier-pharmacy-api
```

Or using Docker Compose:

```bash
docker-compose up -d
```

#### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables on your server

3. Start the server:
```bash
npm start
```

### Frontend Deployment

The easiest way to deploy the Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Firebase Admin SDK** - Database and authentication
- **Axios** - HTTP client for scraping
- **Cheerio** - HTML parsing
- **node-cron** - Task scheduling

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

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
│   ├── dayOfWeek: number (0-6)
│   └── updatedAt: timestamp
```

## Environment Variables

See [backend/.env.example](backend/.env.example) for required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on the repository.
