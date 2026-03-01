import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import examRoutes from './routes/examRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middlewares globales ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exams', examRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 SimLab Backend corriendo en http://localhost:${PORT}`);
});

export default app;
