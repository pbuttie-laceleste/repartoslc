import pkg from 'pg';

const { Pool } = pkg;
let pool;

export const getPool = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: Number(process.env.PG_POOL_MAX || 5)
    });
  }
  return pool;
};

export const dbHealth = async () => {
  const clientPool = getPool();
  if (!clientPool) {
    return { status: 'disabled' };
  }
  try {
    await clientPool.query('SELECT 1');
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};
