# 소개
mqtt를 활용한 1:1 대화 시스템

# 구성요소
1. node.js + express
2. angularjs
3. mongodb
4. redis
5. Mosquitto(mqtt broker)

# 설계 항목
## mqtt topic 정의
1. 대화방 전용 Topic
* chat/room/{roomid}
2. 대화 수집 Topic(서버 전용)
* chat/room/all


## mqtt message 스키마
```
{
	roomId: {roomId}, -- 대화방 전용 토픽 송신 시 생략 가능
	talker: {userId},
	message: {message},
}
```

## 웹소켓 연결
1. 최초 접속 생성(인증)
```
let ws = new WebSocket(`ws://localhost:3000`);
let token = {JWT};
var msg = {
    type: 'authenticate',
    token
};
ws.onopen = function (event) {
    ws.send(JSON.stringify(msg));
};
```

## 웹소켓 메시지 스키마
1. 로비 - 대화방 목록 업데이트
```
{
    "type": "update",
    "items": [
        {
            "_id": "667c05d29985e996…",
            "name": "temp 테스트 방 aaa #1",
            "status": "waiting"
        }
    ]
}
```

# 인프라 설치
* 시스템에 Docker 설치 필수
## redis
```
docker run --name redis --restart=always -p 6379:6379 -d \
-v ~/data/redis.conf:/etc/redis/redis.conf \
-v ~/data/redis:/data \
redis:latest redis-server /etc/redis/redis.conf
```

## mosquitto
```
docker run -it -d --name mos -p 1883:1883 \
eclipse-mosquitto:2
```

## mongodb
```
docker run --name mongodb -v ~/data/mongo:/data/db -d \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=admin1234 \
-p 27017:27017 mongo
```

# 프로젝트 실행
## backend-server
```
git clone dev2-study/server
npm run dev
```














