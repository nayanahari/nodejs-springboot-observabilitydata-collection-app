import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { logInfo } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  const requestId = randomUUID();
  req.requestId = requestId;

  logInfo('http.request.received', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logInfo('http.request.completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userAgent: req.get('user-agent'),
    });
  });

  next();
};
