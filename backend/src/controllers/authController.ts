import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../lib/prisma';
const SALT_ROUNDS = 10;

// ─── Registro ──────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { name, email, password, role } = req.body;

    try {
        // Verificar si el email ya está en uso
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ message: 'El email ya está registrado' });
            return;
        }

        // Hashear contraseña
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                role: role === 'admin' ? 'admin' : 'docente',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error) {
        console.error('[register]', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ─── Login ─────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password } = req.body;
    console.log(`[login] Intentando login para: ${email}`);

    try {
        // Buscar usuario
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        // Generar JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('[login] ERROR: JWT_SECRET no está configurado en las variables de entorno');
            res.status(500).json({ message: 'Error de configuración del servidor (JWT)' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            secret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('[login] Error catastrófico:', error);

        // Si el error es de Prisma (base de datos)
        if (error.code) {
            res.status(500).json({
                message: 'Error de conexión con la base de datos',
                code: error.code
            });
            return;
        }

        res.status(500).json({
            message: 'Error interno del servidor',
            detail: error.message
        });
    }
};

// ─── Perfil del usuario autenticado ────────────────────────────────────────

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
};
