import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET as string;

        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
            role: string;
            name: string;
        };

        // Verificar que el usuario aún existe en la DB
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
