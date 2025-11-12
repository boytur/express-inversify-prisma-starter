import pino from 'pino';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { getConfig } from '../config';

const cfg = getConfig();
const level = cfg.LOG_LEVEL as pino.Level;
const LOG_ENDPOINT = cfg.LOG_ENDPOINT; // optional

const baseLogger = pino({ level, timestamp: pino.stdTimeFunctions.isoTime });

type LogMeta = Record<string, unknown> | undefined;

function postToEndpoint(payload: unknown): void {
  if (!LOG_ENDPOINT) return;
  try {
    const url = new URL(LOG_ENDPOINT);
    const body = JSON.stringify(payload);
    const opts: https.RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = (url.protocol === 'https:' ? https : http).request(url, opts, (res) => {
      res.on('data', () => {});
    });
    req.on('error', () => {});
    req.write(body);
    req.end();
  } catch {
    // noop
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    baseLogger.info(meta ?? {}, message);
    postToEndpoint({ level: 'info', message, meta, time: new Date().toISOString() });
  },
  warn: (message: string, meta?: LogMeta) => {
    baseLogger.warn(meta ?? {}, message);
    postToEndpoint({ level: 'warn', message, meta, time: new Date().toISOString() });
  },
  error: (message: string, meta?: LogMeta) => {
    baseLogger.error(meta ?? {}, message);
    postToEndpoint({ level: 'error', message, meta, time: new Date().toISOString() });
  },
  child: (bindings: pino.Bindings) => baseLogger.child(bindings),
  pino: baseLogger,
};

