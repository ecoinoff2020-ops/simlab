import { Router } from 'express';
import { body } from 'express-validator';
import {
    createExam, listExams, updateExam, deleteExam,
    createCompetency, listCompetencies,
    createQuestion, listQuestionsByExam, updateQuestion, deleteQuestion,
    getGlobalStats, exportIndividualPDF, exportMassiveExcel,
    getDashboardStats, listUsers, updateUser, deleteUser
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();

// Todas las rutas de este archivo requieren ser Admin
router.use(authMiddleware);
router.use(requireRole('admin'));

// ─── Exámenes ──────────────────────────────────────────────────────────────
router.get('/exams', listExams);
router.post('/exams', [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('durationMinutes').isNumeric().withMessage('La duración debe ser un número')
], createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// ─── Competencias ──────────────────────────────────────────────────────────
router.get('/competencies', listCompetencies);
router.post('/competencies', [
    body('name').notEmpty().withMessage('El nombre es requerido')
], createCompetency);

// ─── Preguntas ─────────────────────────────────────────────────────────────
router.get('/questions/exam/:examId', listQuestionsByExam);
router.post('/questions', [
    body('examId').notEmpty().withMessage('examId es requerido'),
    body('competencyId').notEmpty().withMessage('competencyId es requerido'),
    body('type').isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'OPEN']).withMessage('Tipo de pregunta inválido'),
    body('questionText').notEmpty().withMessage('El texto de la pregunta es requerido')
], createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// ─── Estadísticas y Reportes ──────────────────────────────────────────────
router.get('/stats/:examId', getGlobalStats);
router.get('/report/pdf/:attemptId', exportIndividualPDF);
router.get('/report/excel/:examId', exportMassiveExcel);
router.get('/dashboard-stats', getDashboardStats);

// ─── Usuarios ──────────────────────────────────────────────────────────────
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
