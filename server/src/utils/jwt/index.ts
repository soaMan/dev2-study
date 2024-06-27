import { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import env from '../../config/env';
import logger from '../../etc/logger';
import HelperResponse from '../../helpers/helperResponse';
import redis_cli from '../../db/conn_redis';

declare module "express-serve-static-core" {
    interface Request {
        userId?: string;
    }
}

const jwt_secret = 'jwt_secret_key_1234567890';

const jwtSign = async (userId: string, email: string, expiresIn: number) => {
    return jwt.sign({
        iss: 'chatapp-server',
        sub: userId,
        aud: email,
    },
        jwt_secret,
        {
            expiresIn: expiresIn
        });
}

const isNoneTokenApi = (url: string, method: string) => {
    if (url == '/auth/login')
        return true;
    if (url == '/auth/register')
        return true;
    if (url == '/auth/refresh')
        return true;
    return false;
}

export interface JwtRst {
    verified: boolean,
    sub: any,
}

const verify = async (token: string, allowExpired: boolean): Promise<JwtRst> => {
    const retVal: JwtRst = { verified: false, sub: '' };
    if (token)
        jwt.verify(token, jwt_secret, (error, user) => {
            retVal.sub = user?.sub;
            if (error && error instanceof TokenExpiredError && allowExpired) {
                logger.info(`token expired, but allow expired: ${allowExpired}, ${user}`);
                retVal.verified = true;
            } else if (error) {
                logger.info(`token error: ${error}`)
            } else {
                retVal.verified = true;
            }
        });
    return retVal;
}


export default {

    generateAccessToken: async (user: any) => {
        return jwtSign(user._id.toString(), user.email, env.jwt.accessToken.expire_time);
        // return jwtSign(user._id.toString(), user.email, 60);
    },

    generateRefreshToken: async (user: any) => {
        return jwtSign(user._id.toString(), user.email, env.jwt.refreshToken.expire_time);
        // return jwtSign(user._id.toString(), user.email, 500);
    },

    refreshAccessToken: async (req: Request, res: Response) => {
        // todo
    },

    verifyToken: (req: Request, res: Response, next: NextFunction) => {
        if (isNoneTokenApi(req.url, req.method))
            next();
        else {
            let authHeader: string = req.headers["authorization"] || '';
            let requestToken: string = authHeader && authHeader.split(" ")[1];
            if (!requestToken) {
                logger.warn('empty token');
                return HelperResponse.BadRequest(res);
            } else
                jwt.verify(requestToken, jwt_secret, async (error, user) => {

                    if (error) {
                        logger.error(error);
                        return HelperResponse.Unauthorized_msg(res, error.message);
                    }
                    
                    req.userId = user?.sub?.toString();
                    const savedToken = await redis_cli.getAccessToken(user?.sub?.toString() || '');
                    if(savedToken  == null || savedToken != requestToken){
                        const err = `신규 로그인으로 취소된 토큰입니다. 신규 토큰을 이용하세요`;
                        logger.error(err);
                        return HelperResponse.Unauthorized_msg(res, err);
                    }

                    logger.info(`token verified: ${JSON.stringify(user)}`);
                    next();
                    
                });
        }
    },

    verify
}