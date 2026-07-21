const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[LOG_LEVEL as keyof typeof levels] || levels.info;

export const logger = {
  debug: (msg: string, data?: any) => {
    if (currentLevel <= levels.debug) {
      console.debug(`[DEBUG] ${msg}`, data || '');
    }
  },
  info: (msg: string, data?: any) => {
    if (currentLevel <= levels.info) {
      console.log(`[INFO] ${msg}`, data || '');
    }
  },
  warn: (msg: string, data?: any) => {
    if (currentLevel <= levels.warn) {
      console.warn(`[WARN] ${msg}`, data || '');
    }
  },
  error: (msg: string, data?: any) => {
    if (currentLevel <= levels.error) {
      console.error(`[ERROR] ${msg}`, data || '');
    }
  },
};
