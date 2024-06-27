import { Server } from 'http';
import WebSocket from 'ws';
import { Request } from 'express';
import logger from '../etc/logger';
import jwt, { JwtRst } from '../utils/jwt';
import _ from 'lodash';

const connections: any = {};

declare class ChatWebSocket extends WebSocket {
    isAuthenticated: boolean;
}

export default (server: Server) => {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (connection: ChatWebSocket, req: Request) => {
        connection.on("close", (code: number, data: string) => {
            logger.info(`DISCONNECTED::WEBSOCKET - code: ${code}, cause: ${data}`);
        });
        connection.on('message', async (stream) => {
            try {
                const message = JSON.parse(stream.toString());
                if (message.type === 'authenticate') {
                    const jwtRst: JwtRst = await jwt.verify(message.token, false);
                    const sub: string = jwtRst.sub;
                    if (!jwtRst.verified) {
                        let cause: string = `토큰 검증 오류로 연결 거부 - user: ${jwtRst.sub}`;
                        connection.close(4002, cause);
                    } else {
                        oldConnectionCheck(sub);
                        connections[sub] = connection;
                        connection.isAuthenticated = true;
                        logger.info(`CONNECTED::WEBSOCKET - user: ${sub}`);
                    }
                } else {
                    // 일반 수신 메시지 - 미정의
                    if (!connection.isAuthenticated)
                        connection.close(4002, "인증 필요함");
                    logger.info(`INPUT MESSAGE: ${stream}`)
                }
            } catch (error) {
                connection.close(4000, `접속 초기화 오류: ${error}`);
            }
        });
    });

}

const oldConnectionCheck = (sub: string): void => {
    const oldConnection: ChatWebSocket = connections[sub];
    if (!oldConnection)
        return;
    let cause = `중복 접속으로 기존 웹소켓 커넥션은 종료 합니다: userId: ${sub}`;
    oldConnection.close(4003, cause);
}

export const say = (sub: string, message: string): void => {
    let connection: ChatWebSocket = connections[sub];
    if(connection)
        connection.send(message);
}

export const sayAll = (message: string): void => {
    _.mapKeys(connections, (connection: ChatWebSocket, key) => {
        // connection.emit(message);
        connection.send(message);
    });
}

/*
브라우저 테스트
let ws = new WebSocket(`ws://localhost:3000`);
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGF0YXBwLXNlcnZlciIsInN1YiI6IjY2N2E1ODBjYmRmMWVmMmEzNGQ1MzI4NiIsImF1ZCI6ImNjY0BhYWEuY29tIiwiaWF0IjoxNzE5Mzk5OTIwLCJleHAiOjE3MTk0ODYzMjB9.6M2HS3Oa3dWTyKaqC25m8fpJJ1nEZ_QJxzsL7QESXqY';
var msg = {
    type: 'authenticate',
    token
};
ws.onopen = function (event) {
    ws.send(JSON.stringify(msg));
};
// 이벤트
ws.addEventListener("open", () => {
    console.log("서버에 연결되었음.");
});

ws.addEventListener("message", (message) => {
    console.log("서버로 부터의 메시지 : ", message);
});

ws.addEventListener("close", () => {
    console.log("서버가 종료됨.")
});



*/


