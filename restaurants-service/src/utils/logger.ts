import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';

const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = format.printf(({ timestamp, level, message, ...meta }) => {
    const service = 'restaurants-service';
    const metaKeys = Object.keys(meta || {});
    const metaString = metaKeys.length ? ` | data=${JSON.stringify(meta)}` : '';
    // Distinct order vs users-service: service first, then level, then timestamp
    return `svc=${service} | level=${level.toUpperCase()} | ts=${timestamp} | event=${message}${metaString}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        format.errors({ stack: true }),
        format.splat(),
        baseFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, 'restaurants-service.log') })
    ],
});

export const logInfo = (event: string, meta?: Record<string, unknown>) =>
    logger.info(event, meta);

export const logWarn = (event: string, meta?: Record<string, unknown>) =>
    logger.warn(event, meta);

export const logError = (event: string, meta?: Record<string, unknown>, error?: Error) => {
    if (error) {
        return logger.error(event, { ...meta, error: error.message, stack: error.stack });
    }
    return logger.error(event, meta);
};

export default logger;
