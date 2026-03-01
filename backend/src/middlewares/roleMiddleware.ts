import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware de control de roles.
 * Uso: requireRole('admin') o requireRole('admin', 'docente')
 */
export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: 'Acceso denegado: no tienes permisos para este recurso',
                requiredRole: roles,
                yourRole: req.user.role,
            });
            return;
        }

        next();
    };
};
