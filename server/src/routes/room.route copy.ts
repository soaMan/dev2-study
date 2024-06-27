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
    // db 조회
    // chat 반환
    logger.info('room_route_join_call')
    await roomService.join(req, res, next);
});

// 삭제
router.delete('/:roomId', async (req: Request, res: Response, next: NextFunction) => {
    // db 조회
    // db 삭제
    logger.info('room_route_delete_call')
    await roomService.delete(req, res, next);
});
/*
router.put('/:id', (req: Request, res: Response) => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id));

    if (!task) {
        res.status(404).send('Task not found');
    } else {
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.completed = req.body.completed || task.completed;

        res.json(task);
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) {
        res.status(404).send('Task not found');
    } else {
        tasks.splice(index, 1);
        res.status(204).send();
    }
});
*/
export default router;