import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Task } from '../models/task.model';

const router = Router();
let tasks: Task[] = [];

const userValidationRules = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('name').isBoolean().withMessage('Name is required'),
];

// 가입
router.post('/register', userValidationRules, (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // 회원 체크
    // 회원 가입



    // tasks.push(task);
    // res.status(201).json(task);
});

router.get('/', (req: Request, res: Response) => {
    res.status(201).json(tasks);
});

router.get('/:id', (req: Request, res: Response) => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id));

    if (!task) {
        res.status(404).send('Task not found');
    } else {
        res.json(task);
    }
});

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

export default router;