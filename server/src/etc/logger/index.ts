import winston, {createLogger} from 'winston';

const { combine, timestamp, label, printf } = winston.format;
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} ${message}`;
});

// logger 생성
const logger = createLogger({
    format: combine(label({ label: "CHAT-APP" }), timestamp(), logFormat),
});

// 콘솔용
logger.add(
    new winston.transports.Console({
        format: logFormat
    })
);

export default logger;