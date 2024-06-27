import { NextFunction, Request, Response, Router } from 'express';
import { body, header } from 'express-validator';
import logger from '../etc/logger';
import authService from '../services/auth.service';

const router = Router();

const regitserRules = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('name').notEmpty().withMessage('Name is required'),
];
const loginRules = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];
const refreshRules = [
    header('x-refreshToken').notEmpty().withMessage('refreshToken is required'),
];

// 가입
router.post('/register', regitserRules, async (req: Request, res: Response, next: NextFunction) => {
    logger.info('auth_route_register_call')
    await authService.register(req, res, next);
});
// 로그인
router.post('/login', loginRules, async (req: Request, res: Response, next: NextFunction) => {
    logger.info('auth_route_login_call')
    await authService.login(req, res, next);
});
// 토큰 갱신
router.post('/refresh', refreshRules, async (req: Request, res: Response, next: NextFunction) => {
    logger.info('auth_route_refreshToken_call')
    await authService.refresh(req, res, next);
    next();
});

export default router;