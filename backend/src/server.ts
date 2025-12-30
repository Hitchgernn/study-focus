import cors from 'cors';
import express from 'express';

import reportRoutes from './routes/report.js';
import sessionRoutes from './routes/session.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
  'http://127.0.0.1:8083',
  'http://127.0.0.1:8084',
];

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
  }),
);
app.use(express.json());

app.use('/session', sessionRoutes);
app.use('/session', reportRoutes);

app.get('/', (_req, res) => {
  res.send('Focus Guardian API is running');
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Fallback error handler to avoid leaking stack traces.
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Focus Guardian backend running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}`);
});
