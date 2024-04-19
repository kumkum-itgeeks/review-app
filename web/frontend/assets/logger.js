import winston from 'winston';

const logger = winston.createLogger({
    level: 'error', // Set the log level to 'error' to only log error messages
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to 'error.log'
    ],
  });

  export default logger;