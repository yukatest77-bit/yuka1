import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import pharmaciesRouter from './routes/pharmacies';
import schedulerService from './services/scheduler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/pharmacies', pharmaciesRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Tangier Pharmacy Guard API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      pharmacies: {
        getOpen: 'GET /api/pharmacies',
        getAll: 'GET /api/pharmacies/all',
        getById: 'GET /api/pharmacies/:id',
        nearest: 'POST /api/pharmacies/nearest',
        scrape: 'POST /api/pharmacies/scrape',
      },
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Validate environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_DATABASE_URL',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingEnvVars.forEach((varName) => console.error(`   - ${varName}`));
      console.error('\n💡 Please create a .env file based on .env.example');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log('🚀 Tangier Pharmacy Guard API');
      console.log('=================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🏥 API Endpoint: http://localhost:${PORT}/api/pharmacies`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
      console.log('=================================\n');

      // Start the scheduler
      schedulerService.start();

      // Run initial scrape if no data exists
      console.log('🔄 Checking for initial data...');
      setTimeout(async () => {
        try {
          const firebaseService = (await import('./services/firebase')).default;
          const pharmacies = await firebaseService.getAllPharmacies();

          if (pharmacies.length === 0) {
            console.log('📥 No data found, running initial scrape...');
            await schedulerService.runNow();
          } else {
            console.log(`✅ Found ${pharmacies.length} pharmacies in database`);
          }
        } catch (error) {
          console.error('❌ Error checking initial data:', error);
        }
      }, 2000);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⏹️ SIGTERM received, shutting down gracefully...');
      schedulerService.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('\n⏹️ SIGINT received, shutting down gracefully...');
      schedulerService.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
