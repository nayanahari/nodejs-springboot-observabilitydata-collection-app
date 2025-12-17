import fs from 'fs';
import path from 'path';
import log4js from 'log4js';

const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

log4js.configure({
  appenders: {
    console: { type: 'stdout' },
    file: {
      type: 'dateFile',
      filename: path.join(logDir, 'delivery-service.log'),
      pattern: 'yyyy-MM-dd',
      keepFileExt: true,
      daysToKeep: 14,
      compress: false,
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'info',
    },
  },
});

const logger = log4js.getLogger('delivery-service');

type Meta = Record<string, unknown> | undefined;

const formatMeta = (meta?: Meta) =>
  meta && Object.keys(meta).length ? ` | meta=${JSON.stringify(meta)}` : '';

export const logInfo = (event: string, meta?: Meta) =>
  logger.info(`evt=${event}${formatMeta(meta)}`);

export const logWarn = (event: string, meta?: Meta) =>
  logger.warn(`evt=${event}${formatMeta(meta)}`);

export const logError = (event: string, meta?: Meta, error?: Error) => {
  const enriched = { ...meta, errMsg: error?.message, errStack: error?.stack };
  logger.error(`evt=${event}${formatMeta(enriched)}`);
};

export default logger;
