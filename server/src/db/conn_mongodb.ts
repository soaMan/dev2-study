import mongoose from 'mongoose';
import logger from '../etc/logger'
import env from '../config/env';

const connect_mongo = async () => {
    try {
        await mongoose.connect(env.mongodb.url);
        logger.info('CONNECTED::MONGODB');
    } catch (error) {
        logger.error('DISCONNECTED::MONGODB', error);
        throw error;
    }
};

export default connect_mongo;