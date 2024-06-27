import dotenv from 'dotenv';
const { config } = dotenv;
config();


const number = (value: string) => {
	const result: number = Number(value);
	if (Number.isNaN(result))
		return 0;
	else
		return result;
}

export default {
	app: {
		host: process.env.app_host || '',
		port: process.env.app_port || 3000,
		prefix: '/api/v1',
	},
	mongodb: {
		url: process.env.mongo_url || '',
	},
	mqtt: {
		url: process.env.mqtt_url || '',
		topic: {
			default: process.env.mqtt_default_topic || '',
		}
	},
	redis: {
		url: `redis://${process.env.redis_host || '127.0.0.1'}:${process.env.redis_port || 6379}`,
		password: `${process.env.redis_pwd || 'pwd'}`,
		database: 0
	},
	jwt: {
		accessToken: {
			expire_time: number(process.env.access_token_expire || '')
		},
		refreshToken: {
			expire_time: number(process.env.refresh_token_expire || '')
		}
	}
};