import { Router } from 'express';
import { body } from 'express-validator';
import { startExam, saveAnswer, finishExam, getResults, listExams, getMyStats, getMyHistory } from '../controllers/examController';
import { exportIndividualPDF } from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();

// Todas las rutas de este archivo requieren estar Autenticado y ser Docente
router.use(authMiddleware);
router.use(requireRole('docente'));

// Listar exámenes disponibles para docentes
router.get('/', listExams);

// Iniciar un examen (crea Attempt y devuelve preguntas limpias)
router.post('/:examId/start', startExam);

// Guardar o actualizar una respuesta (auto-guardado) - ahora recibe attemptId en URL
router.post('/:attemptId/answer', [
    body('questionId').notEmpty().withMessage('questionId es requerido'),
    body('answerText').notEmpty().withMessage('El texto de la respuesta es requerido')
], saveAnswer);

// Finalizar y evaluar el examen
router.post('/:attemptId/finish', finishExam);

// Obtener reporte detallado por competencia
router.get('/:attemptId/results', getResults);

// Exportar PDF para docente
router.get('/report/pdf/:attemptId', exportIndividualPDF);

router.get('/my-stats', getMyStats);
router.get('/my-history', getMyHistory);

export default router;
