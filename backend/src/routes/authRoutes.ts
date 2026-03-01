import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Crea un nuevo usuario (docente o admin)
 */
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('El nombre es requerido'),
        body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('role')
            .optional()
            .isIn(['admin', 'docente'])
            .withMessage('Rol inválido: debe ser admin o docente'),
    ],
    register
);

/**
 * POST /api/auth/login
 * Autentica y devuelve un JWT
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
    ],
    login
);

/**
 * GET /api/auth/me
 * Ruta protegida — devuelve los datos del usuario autenticado
 */
router.get('/me', authMiddleware, me);

export default router;
