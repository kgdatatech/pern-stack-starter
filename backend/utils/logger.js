import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the log file path
const logFilePath = path.join(__dirname, '../audit.log');

// Function to log actions
export function logAction(userId, action, ipAddress, message) {
  const logEntry = `${new Date().toISOString()} - UserID: ${userId}, Action: ${action}, IP: ${ipAddress}, Message: ${message}\n`;

  // Append the log entry to the audit log file
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to audit log:', err);
    }
  });
}
