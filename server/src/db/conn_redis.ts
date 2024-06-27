import { createClient, RedisClientType } from 'redis';
import env from '../config/env';
import logger from '../etc/logger';


let client: RedisClientType;

export default {
    connect: () => {
        try {
            client = createClient({
                url: env.redis.url,
                database: env.redis.database,
                password: env.redis.password,
                socket: {
                    reconnectStrategy: function (retries) {
                        logger.error(`RECONNECT TRY:: REDIS - retry: ${retries}`);
                        if (retries > 10) {
                            // return new Error("Too many retries.");
                            return 10000;
                        } else {
                            return retries * 1000;
                        }
                    }
                },
            });
            client.on('error', error => {
                logger.error(`ERROR::REDIS - ${error}`);
            });
            client.connect();
            logger.info(`CONNECTED::REDIS`);
        } catch (error) {
            logger.error(`ERROR2::REDIS - ${error}`);
        }
    },

    setAccessToken: (userId: string, accessToken: string) => {
        try{
            if(!client.isOpen || !client.isReady)
                return;
            const key = `token:access:${userId}`;
            client.set(key, accessToken);
            client.expire(key, env.jwt.accessToken.expire_time);
        }catch(error){
            logger.error(error);
        }
    },

    getAccessToken: async (userId: string) => {
        try{
            if(!client.isOpen || !client.isReady)
                return;
            const key = `token:access:${userId}`;
            const val = await client.get(key);
            console.log(val);
            return val;
        }catch(error){
            logger.error(error);
        }
    },

    setRefreshToken: (userId: string, accessToken: string) => {
        try{
            if(!client.isOpen || !client.isReady)
                return;
            const key = `token:refresh:${userId}`;
            client.set(key, accessToken);
            client.expire(key, env.jwt.refreshToken.expire_time);
        }catch(error){
            logger.error(error);
        }
    }
}