const { format, createLogger, transports } = require("winston");

const { combine, timestamp, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  name: "console.info",
  colorize: true,
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(format.colorize(), timestamp(), customFormat),
  transports: [new transports.Console()],
});

module.exports = logger;