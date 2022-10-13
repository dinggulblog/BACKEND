import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  legacyMode: true
})

export const connectRedisClient = async () => {
  try {
    await redisClient.connect();
    console.log('\x1b[33m%s\x1b[0m', 'Successfully connected to RedisClient');
  } catch (error) {
    console.error('Redis client connection ERROR: ' + error.message);
  }
}

export const redisClientV4 = redisClient.v4