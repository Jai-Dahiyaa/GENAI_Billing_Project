export const getValkeyConfig = () => ({
  host: process.env.VALKEY_HOST || 'localhost',
  port: parseInt(process.env.VALKEY_PORT || '6379', 10),
  password: process.env.VALKEY_PASSWORD || undefined,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});