import * as winston from 'winston';
import * as path from 'path';

// NODE_ENV check
const isDev = process.env.NODE_ENV !== 'production';

export const winstonLogger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
  ),
  transports: [
    // 1. File Transport: Error Logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.json(),
    }),

    // 2. File Transport: Combined Logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: winston.format.json(),
    }),

    // 3. Console Transport (Only active in Dev / Non-Production)
    ...(isDev
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.printf(({ level, message, timestamp, stack }) => {
                if (stack) {
                  return `[${timestamp}] ${level}: ${message}\nDETAILS / STACK TRACE:\n${stack}`;
                }
                return `[${timestamp}] ${level}: ${message}`;
              }),
            ),
          }),
        ]
      : [
          // Production Console: Simple JSON without full local file stack traces
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ]),
  ],
});