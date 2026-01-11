import cors, { CorsOptions } from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow all origins if '*' is in the list
    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
