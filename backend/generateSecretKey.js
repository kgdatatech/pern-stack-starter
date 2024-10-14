import { randomBytes } from 'crypto';

// Function to generate a random secret key
const generateSecretKey = () => randomBytes(32).toString('hex'); // Generates a 32-byte random key in hexadecimal format

const secretKey = generateSecretKey();
console.log(`Generated Secret Key: ${secretKey}`);
