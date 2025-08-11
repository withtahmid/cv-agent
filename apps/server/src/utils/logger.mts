import winston from "winston";
const { combine, timestamp, printf, colorize, align } = winston.format;
const isDev = process.env.NODE_ENV !== "production";
export const logger = winston.createLogger({
    level: isDev ? "silly" : "info",
    format: combine(
        timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        colorize({ all: true }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: "home-mono" },
    transports: [new winston.transports.Console()],
});
