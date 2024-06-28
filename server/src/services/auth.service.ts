import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import _ from 'lodash';
import passport from 'passport';
import logger from '../etc/logger';
import ResponseMessage from '../helpers/helperResponse';
import User from '../models/user.model';
import authenticationService from '../utils/jwt';
import redis_cli from '../db/conn_redis';


export default {

    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('auth_service_register_call');
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(new Error(_.toString(errors.array())));
                return;
            }
            const { email, name, password } = req.body;
            const newOne = new User({ email: email, name: name, password: await bcrypt.hash(password, 10) });
            const find = await User.findOne({ email });
            if (find)
                ResponseMessage.BadRequest(res);
            else {
                await newOne.save();
                const accessToken: string = await authenticationService.generateAccessToken(newOne);
                const refreshToekn: string = await authenticationService.generateRefreshToken(newOne);
                ResponseMessage.Ok_item(res, { accessToken, refreshToekn, name, email });
            }

        } catch (error) {
            logger.error(`auth_service_register_error: ${error}`);
            throw error;
        }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('auth_service_login_call');
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(new Error(_.toString(errors.array())));
                return;
            }
            passport.authenticate('local', async (error: any, user: any, msg: any) => {
                if (error || !user) {
                    ResponseMessage.Unauthorized(res);
                } else {
                    const accessToken: string = await authenticationService.generateAccessToken(user);
                    const refreshToekn: string = await authenticationService.generateRefreshToken(user);
                    redis_cli.setAccessToken(user._id.toString(), accessToken);
                    redis_cli.setRefreshToken(user._id.toString(), refreshToekn);
                    const iam = await User.findOne({ email: user.email }).select(['-password', '-createdAt', '-updatedAt']);
                    ResponseMessage.Ok_item(res, { name:iam?.name, email:iam?.email, accessToken, refreshToekn });
                }
            })(req, res);

        } catch (error) {
            logger.error(`auth_service_login_error: ${error}`);
            throw error;
        }
    },

    refresh: async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('auth_service_refresh_call');
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(new Error(_.toString(errors.array())));
                return;
            }
            const isVerified = await authenticationService.refreshAccessToken(req, res);

            // if (isVerified) {
            //     const accessToken: string = await authenticationService.generateAccessToken(user);
            // } else
            //     retrun ResponseMessage.BadRequest(res);


        } catch (error) {
            logger.error(`auth_service_refresh_error: ${error}`);
            throw error;
        }
    },

}