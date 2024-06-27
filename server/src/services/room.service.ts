import { NextFunction, Request, Response } from 'express';
import logger from '../etc/logger';
import ResponseMessage from '../helpers/helperResponse';
import Room from '../models/room.model';
import _ from 'lodash';
import { say, sayAll } from '../ws';

const findMyRooms = async (rooms: any, userId: string) => {
    rooms.forEach((e: any) => {
        if (e.owner === userId && !e.participants)
            e.status = 'waiting';
    });
    _.remove(rooms, (e: any) => {
        // 내 방 X, 내가 참여 중 X 
        return e.status === 'chatting' && e.owner != userId && e.participants != userId;
    })
}
const broadcast = async () => {
    let list = await Room.find().select(['-updatedAt', '-createdAt', '-chat']);
    const wsMessage = { type: 'update', items: list };
    sayAll(JSON.stringify(wsMessage));
}

export default {

    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('room_service_list_call');
            let myRooms = await Room.find().select(['-updatedAt', '-createdAt', '-chat']);
            // await findMyRooms(myRooms, req.userId || '');
            ResponseMessage.Ok_items(res, myRooms);
        } catch (error) {
            logger.error(`room_service_list_error: ${error}`);
            return ResponseMessage.BadRequest(res);
        }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('room_service_create_call');

            // const newOne = new Room({ owner: req.userId, name: req.body.name, status: 'waiting' });
            const newOne = new Room({ owner: req.userId, name: req.body.name, status: 'waiting' });
            await newOne.save();
            const room = { roomId: newOne.id.toString(), name: newOne.name };
            ResponseMessage.Ok_item(res, room);
            broadcast();
        } catch (error) {
            logger.error(`room_service_create_error: ${error}`);
            return ResponseMessage.BadRequest(res);
        }
    },

    join: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('room_service_join_call');
            const targetRoomId: string = req.params.roomId;
            const userId: string = req.userId || '';
            const targetRoom = await Room.findOne({
                _id: targetRoomId,
                $or: [
                    // 조건 #1: 내 방 아님, 참여자는 요청자 또는 없음
                    { owner: { $ne: userId }, $or: [{ participants: null }, { participants: userId }] },
                    // 조건 #1: 내 방임
                    { owner: userId },
                ]
            });
            if (!targetRoom)
                return ResponseMessage.BadRequest(res);
            else {
                const isMine: boolean = targetRoom.owner.toString() === userId;
                const alreadyJoin: boolean = targetRoom.participants ? true : false;
                let joinRoom;

                // 내 방 인 경우
                if (isMine)
                    joinRoom = await Room.findOne({ _id: targetRoomId })
                        .populate('owner', '-password -createdAt -updatedAt')
                        .populate('participants', '-password -createdAt -updatedAt')
                        .select(['-updatedAt', '-createdAt'])

                // 내 방 아님 & 이미 참가
                if (!joinRoom && alreadyJoin)
                    joinRoom = await Room.findOne({ _id: targetRoomId })
                        .populate('owner', '-password -createdAt -updatedAt')
                        .populate('participants', '-password -createdAt -updatedAt')
                        .select(['-updatedAt', '-createdAt']);

                // 내 방 아님 & 신규 참여
                else if ((!joinRoom && !alreadyJoin))
                    joinRoom = await Room.findOneAndUpdate({ _id: targetRoomId }, { status: 'chatting', participants: userId }, { new: true })
                        .populate('owner', '-password -createdAt -updatedAt')
                        .populate('participants', '-password -createdAt -updatedAt')
                        .select(['-updatedAt', '-createdAt']);

                // 신규 참여자가 발생했으면
                if (!isMine && !alreadyJoin)
                    broadcast();

                return ResponseMessage.Ok_item(res, joinRoom);
            }

        } catch (error) {
            logger.error(`room_service_join_error: ${error}`);
            return ResponseMessage.BadRequest(res);
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('room_service_delete_call');
            const targetRoomId: string = req.params.roomId;
            const userId: string = req.userId || '';
            const result = await Room.findOneAndDelete({ _id: targetRoomId, owner: userId });
            if (result) {
                broadcast();
                return ResponseMessage.Ok(res);
            } else
                return ResponseMessage.BadRequest(res);
        } catch (error) {
            logger.error(`room_service_delete_error: ${error}`);
            return ResponseMessage.BadRequest(res);
        }
    },

}