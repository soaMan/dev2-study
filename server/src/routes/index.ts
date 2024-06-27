import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import logger from '../etc/logger';
import passportConfig from '../utils/passport';
import authRoutes from './auth.route';
import YAML from 'yamljs';
import authenticationService from '../utils/jwt';
import roomRoutes from './room.route';
import compression from 'compression';

const app = express();

app.use(compression());
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));

// request log
app.use((req: Request, res: Response, next: NextFunction) => {
    if(!req.url.startsWith('/swagger')){
        logger.info(`REQUSET: ${req.method} ${req.url}`);
        logger.info(`    ㄴ   ${JSON.stringify(req.body)}`);
    }
    next();
});

// swagger log
var swaggerDocument = YAML.load("./src/routes/swagger.yaml");
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// passport
passportConfig();
app.use(passport.initialize());

app.use(authenticationService.verifyToken);

// auth
app.use('/auth', authRoutes);
// room
app.use('/room', roomRoutes);

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`RESPONSE: error_route: ${err.message}, \n ${err.stack}`);
    res.status(500).send('Something went wrong');
});

// response log
// app.use((req: Request, res: Response, next: NextFunction) => {
//     logger.info(`RESPONSE: ${res.status}`);
//     res.status(200).send();
// });

export default app;