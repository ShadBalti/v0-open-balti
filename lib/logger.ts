type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ""
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const formattedMessage = this.formatMessage(level, message, context)

    // In development, use console methods for better debugging
    if (this.isDevelopment) {
      switch (level) {
        case "error":
          console.error(formattedMessage)
          break
        case "warn":
          console.warn(formattedMessage)
          break
        case "debug":
          console.debug(formattedMessage)
          break
        default:
          console.log(formattedMessage)
      }
    } else {
      // In production, you could send to external logging service
      // For now, only log errors and warnings to console
      if (level === "error" || level === "warn") {
        console[level](formattedMessage)
      }
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log("error", message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context)
  }
}

export const logger = new Logger()
