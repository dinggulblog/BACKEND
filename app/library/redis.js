import { createClient } from 'redis';

class RedisClient {
  constructor () {
    this.client = createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    });
  }

  get endpoint() {
    return this.client.v4;
  }

  async setValue(key, value) {
    await this.client.set(key, value, 'EX', 14*24*3600);
  }

  async getValue(key) {
    return await this.client.get(key);
  }

  async getSetValue(key, value) {
    return await this.client.getSet(key, value);
  }

  async isExists(key) {
    return await this.client.exists(key);
  }

  async delValue(key) {
    await this.client.del(key);
  }

  async quit(callback) {
    await this.client.quit(callback);
  }

  async connectRedisClient() {
    try {
      await this.client.connect();
      console.log('\x1b[33m%s\x1b[0m', 'Successfully connected to RedisClient');
    } catch (error) {
      console.error('Redis client connection ERROR: ' + error.message);
    }
  }
};

export default RedisClient;
