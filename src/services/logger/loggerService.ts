import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config()

const logger = winston.createLogger({
    level: process.env.LOGGER_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ],
});

export default logger;
