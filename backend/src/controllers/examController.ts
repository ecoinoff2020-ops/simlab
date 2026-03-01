import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculateCompetencyBreakdown } from '../services/analysisService';

// ─── Iniciar Examen ────────────────────────────────────────────────────────

export const startExam = async (req: Request, res: Response) => {
    const { examId } = req.params;
    const userId = (req as any).user.id;

    try {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    include: {
                        options: {
                            select: {
                                id: true,
                                optionText: true,
                                // isCorrect NO SE ENVÍA
                            }
                        }
                    }
                }
            }
        });

        if (!exam) {
            res.status(404).json({ message: 'Examen no encontrado' });
            return;
        }

        // Crear intento
        const attempt = await prisma.attempt.create({
            data: {
                userId,
                examId: exam.id,
                startedAt: new Date()
            }
        });

        // Limpiar preguntas (quitar correctAnswer)
        const sanitizedQuestions = exam.questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });

        res.status(201).json({
            attemptId: attempt.id,
            exam: {
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.durationMinutes
            },
            questions: sanitizedQuestions
        });
    } catch (error) {
        console.error('[startExam]', error);
        res.status(500).json({ message: 'Error al iniciar examen' });
    }
};

// ─── Guardar Respuesta (Auto-guardado) ────────────────────────────────────

export const saveAnswer = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const { questionId, answerText } = req.body;
    const userId = (req as any).user.id;

    try {
        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId }
        });

        if (!attempt) {
            res.status(404).json({ message: 'Intento no encontrado' });
            return;
        }

        if (attempt.userId !== userId) {
            res.status(403).json({ message: 'No tienes permiso para este intento' });
            return;
        }

        if (attempt.finishedAt) {
            res.status(400).json({ message: 'Este intento ya ha sido finalizado' });
            return;
        }

        // Upsert de la respuesta
        const answer = await prisma.answer.upsert({
            where: {
                // Necesitamos un índice único compuesto en schema.prisma si queremos usar upsert por attemptId + questionId
                // Pero como no lo tenemos, usaremos find + create/update
                id: (await prisma.answer.findFirst({
                    where: { attemptId, questionId }
                }))?.id || '00000000-0000-0000-0000-000000000000'
            },
            update: { answerText },
            create: {
                attemptId,
                questionId,
                answerText
            }
        });

        res.json({ message: 'Respuesta guardada', answerId: answer.id });
    } catch (error) {
        console.error('[saveAnswer]', error);
        res.status(500).json({ message: 'Error al guardar respuesta' });
    }
};

// ─── Finalizar Examen y Evaluar ───────────────────────────────────────────

export const finishExam = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = (req as any).user.id;

    try {
        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: true,
                exam: {
                    include: {
                        questions: {
                            include: { options: true }
                        }
                    }
                }
            }
        });

        if (!attempt) {
            res.status(404).json({ message: 'Intento no encontrado' });
            return;
        }

        if (attempt.userId !== userId) {
            res.status(403).json({ message: 'No tienes permiso para este intento' });
            return;
        }

        if (attempt.finishedAt) {
            res.status(400).json({ message: 'Este intento ya fue evaluado anteriormente' });
            return;
        }

        let scoreTotal = 0;
        let correctAnswersCount = 0;
        const totalQuestions = attempt.exam.questions.length;

        // Evaluación de cada respuesta
        for (const question of attempt.exam.questions) {
            const userAnswer = attempt.answers.find(a => a.questionId === question.id);
            let isCorrect = false;
            let scoreObtained = 0;

            if (userAnswer) {
                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    // Check if answerText matches the correct option Id
                    const correctOption = question.options.find(o => o.isCorrect);
                    if (correctOption && userAnswer.answerText === correctOption.id) {
                        isCorrect = true;
                        scoreObtained = question.points;
                    }
                } else if (question.type === 'OPEN') {
                    // Simple string comparison for OPEN questions
                    if (question.correctAnswer && userAnswer.answerText.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                        isCorrect = true;
                        scoreObtained = question.points;
                    }
                }

                // Update answer record
                await prisma.answer.update({
                    where: { id: userAnswer.id },
                    data: { isCorrect, scoreObtained }
                });
            }

            if (isCorrect) {
                scoreTotal += scoreObtained;
                correctAnswersCount++;
            }
        }

        // Calcular puntaje máximo posible por puntos
        const maxPoints = attempt.exam.questions.reduce((acc, q) => acc + q.points, 0);
        const percentage = maxPoints > 0 ? (scoreTotal / maxPoints) * 100 : 0;

        // Determinar nivel
        let levelEstimated = 'Bajo';
        if (percentage >= 90) levelEstimated = 'Excelente';
        else if (percentage >= 75) levelEstimated = 'Alto';
        else if (percentage >= 60) levelEstimated = 'Medio';

        // Cerrar intento
        const updatedAttempt = await prisma.attempt.update({
            where: { id: attemptId },
            data: {
                scoreTotal,
                levelEstimated,
                finishedAt: new Date()
            }
        });

        res.json({
            message: 'Examen finalizado',
            scoreTotal: updatedAttempt.scoreTotal,
            levelEstimated: updatedAttempt.levelEstimated,
            totalQuestions,
            correctAnswers: correctAnswersCount
        });
    } catch (error) {
        console.error('[finishExam]', error);
        res.status(500).json({ message: 'Error al finalizar examen' });
    }
};

// ─── Obtener Resultados Detallados ────────────────────────────────────────

export const getResults = async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = (req as any).user.id;

    try {
        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: true,
                exam: {
                    include: {
                        questions: {
                            include: { competency: true, options: true }
                        }
                    }
                }
            }
        });

        if (!attempt) {
            res.status(404).json({ message: 'Intento no encontrado' });
            return;
        }

        if (attempt.userId !== userId) {
            res.status(403).json({ message: 'No tienes permiso para ver estos resultados' });
            return;
        }

        if (!attempt.finishedAt) {
            res.status(400).json({ message: 'El examen aún no ha sido finalizado' });
            return;
        }

        const breakdownByCompetency = calculateCompetencyBreakdown(attempt);

        res.json({
            scoreTotal: attempt.scoreTotal,
            levelEstimated: attempt.levelEstimated,
            breakdownByCompetency
        });
    } catch (error) {
        console.error('[getResults]', error);
        res.status(500).json({ message: 'Error al obtener resultados' });
    }
};

// ─── Listar Exámenes (Vista Docente) ──────────────────────────────────────

export const listExams = async (req: Request, res: Response) => {
    try {
        const exams = await prisma.exam.findMany({
            include: { _count: { select: { questions: true } } }
        });
        res.json(exams);
    } catch (error) {
        console.error('[listExams]', error);
        res.status(500).json({ message: 'Error al listar exámenes' });
    }
};

// ─── Estadísticas Personales (Docente) ────────────────────────────────────

export const getMyStats = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const attempts = await prisma.attempt.findMany({
            where: { userId, finishedAt: { not: null } },
            select: { scoreTotal: true }
        });

        const totalAttempts = attempts.length;
        const bestScore = totalAttempts > 0
            ? Math.max(...attempts.map(a => a.scoreTotal || 0))
            : 0;

        res.json({
            totalAttempts,
            bestScore
        });
    } catch (error) {
        console.error('[getMyStats]', error);
        res.status(500).json({ message: 'Error al obtener estadísticas personales' });
    }
};

// ─── Historial de Intentos (Docente) ──────────────────────────────────────

export const getMyHistory = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const history = await prisma.attempt.findMany({
            where: { userId, finishedAt: { not: null } },
            include: {
                exam: { select: { title: true } }
            },
            orderBy: { finishedAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        console.error('[getMyHistory]', error);
        res.status(500).json({ message: 'Error al obtener el historial' });
    }
};
