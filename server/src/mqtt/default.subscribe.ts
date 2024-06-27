import mqtt, { MqttClient } from 'mqtt';
import env from '../config/env';
import logger from '../etc/logger';
import chatService from '../services/chat.service';

const client: MqttClient = mqtt.connect(env.mqtt.url);

client.on('close', () => logger.error('DISCONNECTED::MQTT', new Date()));
client.on('error', err => logger.error('error', err));
export default {
    listen: client.on('connect', () => {
        logger.info(`CONNECTED::MQTT - ${client.connected}`);
        client.subscribe(env.mqtt.topic.default);
        client.on("message", (topic, message) => {
            try {
                const chat = JSON.parse(message.toString());
                chatService.update(chat.roomId, chat.talker, chat.message);
            } catch (error) {
                logger.error(error);
            }
        });
    })
}