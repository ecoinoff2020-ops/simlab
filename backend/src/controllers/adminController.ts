import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { validationResult } from 'express-validator';
import { calculateGlobalStats } from '../services/statsService';
import { generateIndividualPDF, generateMassiveExcel } from '../services/reportService';
import bcrypt from 'bcryptjs';

// ─── Users ──────────────────────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, created_at: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('[listUsers]', error);
        res.status(500).json({ message: 'Error al listar usuarios' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, email, role, password } = req.body;
    try {
        const data: any = { name, email, role };
        if (password) {
            data.password_hash = await bcrypt.hash(password, 10);
        }
        const user = await prisma.user.update({
            where: { id },
            data
        });
        res.json(user);
    } catch (error) {
        console.error('[updateUser]', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const currentUser = (req as any).user;

    try {
        // Evitar que un administrador se elimine a sí mismo
        if (currentUser && id === currentUser.id) {
            res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador' });
            return;
        }

        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        console.error('[deleteUser] Full error detail:', error);

        // Error P2025 de Prisma: El registro no existe
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'El usuario ya no existe' });
            return;
        }

        // Error P2003 de Prisma: Violación de restricción de clave foránea
        if (error.code === 'P2003') {
            res.status(400).json({
                message: 'No se puede eliminar el usuario porque tiene registros dependientes. Asegúrate de eliminar sus intentos primero.'
            });
            return;
        }

        res.status(500).json({ message: 'Error interno al intentar eliminar el usuario' });
    }
};

// ─── Competencies ──────────────────────────────────────────────────────────

export const createCompetency = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        const competency = await prisma.competency.create({
            data: { name, description }
        });
        res.status(201).json(competency);
    } catch (error) {
        console.error('[createCompetency]', error);
        res.status(500).json({ message: 'Error al crear competencia' });
    }
};

export const listCompetencies = async (req: Request, res: Response) => {
    try {
        const competencies = await prisma.competency.findMany();
        res.json(competencies);
    } catch (error) {
        console.error('[listCompetencies]', error);
        res.status(500).json({ message: 'Error al listar competencias' });
    }
};

// ─── Exams ─────────────────────────────────────────────────────────────────

export const createExam = async (req: Request, res: Response) => {
    const { title, description, durationMinutes } = req.body;
    try {
        const exam = await prisma.exam.create({
            data: { title, description, durationMinutes: parseInt(durationMinutes) }
        });
        res.status(201).json(exam);
    } catch (error) {
        console.error('[createExam]', error);
        res.status(500).json({ message: 'Error al crear examen' });
    }
};

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

export const updateExam = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { title, description, durationMinutes } = req.body;
    try {
        const exam = await prisma.exam.update({
            where: { id },
            data: { title, description, durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined }
        });
        res.json(exam);
    } catch (error) {
        console.error('[updateExam]', error);
        res.status(500).json({ message: 'Error al actualizar examen' });
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.exam.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('[deleteExam]', error);
        res.status(500).json({ message: 'Error al eliminar examen' });
    }
};

// ─── Questions ─────────────────────────────────────────────────────────────

export const createQuestion = async (req: Request, res: Response) => {
    const { examId, competencyId, type, questionText, correctAnswer, points, options } = req.body;

    try {
        // Validaciones de negocio por tipo
        if (type === 'MULTIPLE_CHOICE') {
            if (!options || options.length < 2) {
                res.status(400).json({ message: 'MULTIPLE_CHOICE requiere al menos 2 opciones' });
                return;
            }
            const correctCount = options.filter((o: any) => o.isCorrect).length;
            if (correctCount !== 1) {
                res.status(400).json({ message: 'MULTIPLE_CHOICE requiere exactamente 1 opción correcta' });
                return;
            }
        }

        // Crear pregunta con lógica transaccional para opciones
        const result = await prisma.$transaction(async (tx) => {
            const question = await tx.question.create({
                data: {
                    examId,
                    competencyId,
                    type,
                    questionText,
                    correctAnswer: type === 'OPEN' ? correctAnswer : null,
                    points: points ? parseInt(points) : 1,
                }
            });

            if (type === 'MULTIPLE_CHOICE') {
                await tx.option.createMany({
                    data: options.map((o: any) => ({
                        questionId: question.id,
                        optionText: o.optionText,
                        isCorrect: !!o.isCorrect
                    }))
                });
            } else if (type === 'TRUE_FALSE') {
                await tx.option.createMany({
                    data: [
                        { questionId: question.id, optionText: 'Verdadero', isCorrect: correctAnswer === 'true' },
                        { questionId: question.id, optionText: 'Falso', isCorrect: correctAnswer === 'false' }
                    ]
                });
            }

            return tx.question.findUnique({
                where: { id: question.id },
                include: { options: true }
            });
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('[createQuestion]', error);
        res.status(500).json({ message: 'Error al crear pregunta' });
    }
};

export const listQuestionsByExam = async (req: Request, res: Response) => {
    const examId = req.params.examId as string;
    try {
        const questions = await prisma.question.findMany({
            where: { examId },
            include: { options: true, competency: { select: { name: true } } }
        });
        res.json(questions);
    } catch (error) {
        console.error('[listQuestionsByExam]', error);
        res.status(500).json({ message: 'Error al listar preguntas' });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { questionText, points, correctAnswer } = req.body;
    try {
        const question = await prisma.question.update({
            where: { id },
            data: {
                questionText,
                points: points ? parseInt(points) : undefined,
                correctAnswer
            },
            include: { options: true }
        });
        res.json(question);
    } catch (error) {
        console.error('[updateQuestion]', error);
        res.status(500).json({ message: 'Error al actualizar pregunta' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.question.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('[deleteQuestion]', error);
        res.status(500).json({ message: 'Error al eliminar pregunta' });
    }
};

// ─── Estadísticas y Reportes ──────────────────────────────────────────────

export const getGlobalStats = async (req: Request, res: Response) => {
    const examId = req.params.examId as string;
    try {
        const stats = await calculateGlobalStats(examId);
        res.json(stats);
    } catch (error) {
        console.error('[getGlobalStats]', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

export const exportIndividualPDF = async (req: Request, res: Response) => {
    const attemptId = req.params.attemptId as string;
    try {
        const doc = await generateIndividualPDF(attemptId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${attemptId}.pdf`);

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('[exportIndividualPDF]', error);
        res.status(500).json({ message: 'Error al generar PDF' });
    }
};

export const exportMassiveExcel = async (req: Request, res: Response) => {
    const examId = req.params.examId as string;
    try {
        const workbook = await generateMassiveExcel(examId);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_examen_${examId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('[exportMassiveExcel]', error);
        res.status(500).json({ message: 'Error al exportar Excel' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [usersCount, examsCount, attemptsCount, attemptsData] = await Promise.all([
            prisma.user.count(),
            prisma.exam.count(),
            prisma.attempt.count({ where: { finishedAt: { not: null } } }),
            prisma.attempt.findMany({
                where: { finishedAt: { not: null } },
                select: { scoreTotal: true }
            })
        ]);

        const avgScore = attemptsData.length > 0
            ? attemptsData.reduce((acc, curr) => acc + (curr.scoreTotal || 0), 0) / attemptsData.length
            : 0;

        res.json({
            usersCount,
            examsCount,
            attemptsCount,
            avgScore: Math.round(avgScore * 10) / 10
        });
    } catch (error) {
        console.error('[getDashboardStats]', error);
        res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
};
