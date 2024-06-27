import _ from 'lodash';
import logger from '../etc/logger';
import Room from '../models/room.model';

export default {
    update: async (roomId: string, talker: string, message: string) => {
        try{
            logger.info(`chat 수집 - roomId: ${roomId}`);
            const newChat: object = [{ talker, message }];
            const targetRoom = await Room.findById({ _id: roomId });
            let oldChat = targetRoom?.chat;
            let last = _.concat(oldChat, newChat);
            await Room.findOneAndUpdate({ _id: roomId }, { chat: last });
        }catch(error){
        }
    },
}