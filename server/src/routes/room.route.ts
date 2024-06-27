import { NextFunction, Request, Response, Router } from 'express';
import logger from '../etc/logger';
import roomService from '../services/room.service';
// import redis from '../db/conn_redis';

const router = Router();

// 목록
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    logger.info('room_route_list_call')
    await roomService.list(req, res, next);
});

// 생성
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    logger.info('room_route_create_call')
    await roomService.create(req, res, next);
});

// 참여
router.get('/:roomId', async (req: Request, res: Response, next: NextFunction) => {
    logger.info('room_route_join_call')
    await roomService.join(req, res, next);
});

// 삭제
router.delete('/:roomId', async (req: Request, res: Response, next: NextFunction) => {
    logger.info('room_route_delete_call')
    await roomService.delete(req, res, next);
});

export default router;