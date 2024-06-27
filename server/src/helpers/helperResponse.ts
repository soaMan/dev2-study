import { Response } from 'express';
import logger from '../etc/logger';

const message = (messages: string) => {
    return typeof messages === 'object' ? messages : { messages: [messages] };
};

const returnResponse = (status: number, message: object, res: Response) => {
    logger.info(`RESPONSE: status: ${status}, body: ${JSON.stringify(message)}`);
    res.status(status).json(message);
}

const Response = {
    Ok: (res: Response) => {
        returnResponse(200, message('Ok'), res);
    },
    Ok_item: (res: Response, data: any) => {
        returnResponse(200, { "messages:": "Ok", "item": data }, res);
    },
    Ok_items: (res: Response, data: any) => {
        returnResponse(200, { "messages:": "Ok", "items": data }, res);
    },
    Forbidden: (res: Response, msg: string) => {
        returnResponse(403, message(msg || 'Access is denied'), res);
    },
    BadRequest: (res: Response) => {
        returnResponse(400, message('Bad Request'), res);
    },
    Unauthorized: (res: Response) => {
        returnResponse(401, message('Unauthorized'), res);
    },
    Unauthorized_msg: (res: Response, msg: string) => {
        returnResponse(401, message(`Unauthorized - ${msg}`), res);
    },
    NotFound: (res: Response, msg: string) => {
        returnResponse(404, message(msg || 'Not found'), res);
    },
    InternalServerError: (res: Response, msg: string) => {
        returnResponse(500, message(msg || 'Internal Server Error'), res);
    },

    // Custome
    NotFoundUser: (res: Response, msg: string) => {
        returnResponse(400, message(msg || 'Not found user'), res);
    },
    NotFoundRoom: (res: Response) => {
        returnResponse(400, message('Not found user'), res);
    },
    InvalidUserOrPass: (res: Response, msg: string) => {
        returnResponse(400, message(msg || 'Invalid Username/Password'), res);
    },
    InvalidParams: (res: Response, msg: string) => {
        returnResponse(400, message(msg || 'Invalid params data'), res);
    },
};

export default Response;