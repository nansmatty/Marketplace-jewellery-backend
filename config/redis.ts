import Redis from 'ioredis';
require('dotenv').config();

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log('Redis Connected to:', process.env.REDIS_URL);
    return process.env.REDIS_URL;
  } else {
    const localhostUrl = 'redis://localhost:6379';
    console.log('Redis Connected to:', localhostUrl);
    return localhostUrl;
  }
};

export const redis = new Redis(redisClient());

export const checkConnection = async () => {
  try {
    await redis.ping();
    console.log('Redis is connected.');
    return true; // Connection successful
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    return false; // Connection failed
  }
};
