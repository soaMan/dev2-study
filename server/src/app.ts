import { Server } from 'http';
import env from './config/env';
import connect_mongo from './db/conn_mongodb';
import redis_cli from './db/conn_redis';
import logger from './etc/logger';
import mqtt_default_subscribe from './mqtt/default.subscribe';
import expressapp from './routes';
import WebSocket from './ws';

async function start() {
    try {
        // HTTP 오픈
        const server: Server = expressapp.listen(env.app.port, () => {
            logger.info(`OPEND::SERVER - http://localhost:${env.app.port}`);
        });
        // WS 대기
        WebSocket(server);
        // 레디스 연결
        redis_cli.connect();
        // 몽고디비 연결
        connect_mongo();
        // MQTT 연결
        mqtt_default_subscribe.listen;

    } catch (error) {
        logger.error(error);
        throw error;
    }
}
start();