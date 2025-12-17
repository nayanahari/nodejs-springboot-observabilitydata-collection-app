import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { logInfo } from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            logMeta?: Record<string, unknown>;
        }
    }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    const requestId = randomUUID();

    req.logMeta = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    };

    logInfo('http.request.received', req.logMeta);

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        const meta = {
            ...req.logMeta,
            status: res.statusCode,
            durationMs: Number(durationMs.toFixed(2)),
            userId: (req as any).user?.id,
        };
        logInfo('http.request.completed', meta);
    });

    next();
};
