import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Import cookie-parser for handling cookies
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import inventoryRoutes from './routes/inventory.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csrf'; // Correct module for CSRF token management

dotenv.config();

const app = express();
const csrfTokens = new csrf(); // Initialize CSRF tokens

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS with credentials support
app.use(cors({
    origin: 'https://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies) to be sent with requests
}));

// Use Helmet for securing HTTP headers, including CSP
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://apis.example.com"], // Example of trusted external sources
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'", "https://apis.example.com"],
    upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS
  }
}));

// HSTS (HTTP Strict Transport Security) middleware for HTTPS enforcement
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true, 
  preload: true
}));

// Rate Limiting - Apply to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// CSRF Protection - Generate and validate tokens manually
app.use((req, res, next) => {
    const token = csrfTokens.create(process.env.CSRF_SECRET || 'defaultSecret');
    res.cookie('XSRF-TOKEN', token); // Send CSRF token as a cookie
    req.csrfToken = token;
    next();
});

// Validate CSRF token for all POST, PUT, DELETE requests
app.use((req, res, next) => {
    const clientCsrfToken = req.cookies['XSRF-TOKEN'];
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && !csrfTokens.verify(process.env.CSRF_SECRET || 'defaultSecret', clientCsrfToken)) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next();
});

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

// Read HTTPS certificates
const key = fs.readFileSync(path.join('certs', 'localhost-key.pem'));
const cert = fs.readFileSync(path.join('certs', 'localhost.pem'));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Start the HTTPS server
const PORT = process.env.PORT || 5000;
https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`HTTPS server is running on port ${PORT}`);
});
