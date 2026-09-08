export const DEMO_MODE = process.env.DEMO_MODE !== 'false';
export const PORT = Number(process.env.PORT) || 5001;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/annsetu';
