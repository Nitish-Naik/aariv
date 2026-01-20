/**
 * Lightweight structured logger
 * Uses console in development, can be extended for production services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor(level: LogLevel = 'info') {
    this.level = level;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    
    if (this.isDevelopment) {
      // Colored output for development
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      
      let output = `${colors[level]}[${levelUpper}]${reset} ${timestamp} - ${message}`;
      
      if (context && Object.keys(context).length > 0) {
        output += `\n  ${JSON.stringify(context, null, 2)}`;
      }
      
      return output;
    } else {
      // JSON output for production (easier to parse by log aggregators)
      return JSON.stringify({
        timestamp,
        level: levelUpper,
        message,
        ...context,
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (this.shouldLog('error')) {
      let finalContext = context || {};
      
      if (error instanceof Error) {
        finalContext = {
          ...finalContext,
          error: error.message,
          stack: error.stack,
        };
      } else if (error) {
        finalContext = { ...finalContext, ...error };
      }
      
      console.error(this.formatMessage('error', message, finalContext));
    }
  }

  // Convenience methods for common patterns
  http(method: string, path: string, statusCode: number, duration: number): void {
    this.info(`${method} ${path} ${statusCode}`, { duration: `${duration}ms` });
  }

  apiError(endpoint: string, error: Error): void {
    this.error(`API Error: ${endpoint}`, error);
  }

  userAction(userId: string, action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, { userId, ...context });
  }
}

// Export singleton instance
export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);

// For testing or custom instances
export { Logger };
