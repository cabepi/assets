import { sql } from "@vercel/postgres";

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
    message: string;
    level?: LogLevel;
    service?: string;
    code?: string;
    error?: unknown;
    metadata?: Record<string, any>;
    req?: {
        url?: string;
        method?: string;
    };
}

export class Logger {
    private static DEFAULT_SERVICE = 'asset-track-web';

    /**
     * Main method to persis log to DB
     */
    private static async log(entry: LogEntry) {
        const {
            message,
            level = 'INFO',
            service = this.DEFAULT_SERVICE,
            code = null,
            error,
            metadata = {},
            req
        } = entry;

        let stackTrace = null;
        let finalMetadata = { ...metadata };

        // Extract stack trace and useful info from Error object
        if (error instanceof Error) {
            stackTrace = error.stack || null;
            finalMetadata = {
                ...finalMetadata,
                errorName: error.name,
                errorMessage: error.message
            };
        } else if (error) {
            // If error is not an Error instance (e.g. string or object)
            try {
                finalMetadata.rawError = JSON.stringify(error);
            } catch (e) {
                finalMetadata.rawError = 'Could not stringify error';
            }
        }

        // Prepare JSONB safely
        const metadataJson = JSON.stringify(finalMetadata);

        try {
            await sql`
        INSERT INTO asset.app_logs (
          level, 
          service_name, 
          error_code, 
          message, 
          stack_trace, 
          metadata, 
          request_url, 
          http_method
        ) VALUES (
          ${level}, 
          ${service}, 
          ${code}, 
          ${message}, 
          ${stackTrace}, 
          ${metadataJson}::jsonb, 
          ${req?.url || null}, 
          ${req?.method || null}
        )
      `;
        } catch (dbError) {
            // Fallback to console if DB fails, so we don't lose the log
            console.error('🚨 LOGGER FAILED TO WRITE TO DB:', dbError);
            console.error('ORIGINAL LOG:', JSON.stringify(entry, null, 2));
        }
    }

    static async info(message: string, metadata?: Record<string, any>) {
        return this.log({ level: 'INFO', message, metadata });
    }

    static async warning(message: string, metadata?: Record<string, any>) {
        return this.log({ level: 'WARNING', message, metadata });
    }

    static async error(message: string, error?: unknown, metadata?: Record<string, any>, code?: string) {
        return this.log({ level: 'ERROR', message, error, metadata, code });
    }

    static async critical(message: string, error?: unknown, metadata?: Record<string, any>) {
        return this.log({ level: 'CRITICAL', message, error, metadata });
    }
}
