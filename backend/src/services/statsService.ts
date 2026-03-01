import { prisma } from '../lib/prisma';

export interface QuestionStats {
    questionId: string;
    questionText: string;
    errorPercentage: number;
}

export interface GlobalStats {
    totalAttempts: number;
    averageScore: number;
    distributionLevels: {
        Excelente: number;
        Alto: number;
        Medio: number;
        Bajo: number;
    };
    preguntasMasFalladas: QuestionStats[];
}

export const calculateGlobalStats = async (examId: string): Promise<GlobalStats> => {
    // 1. Obtener todos los intentos finalizados para este examen
    const attempts = await (prisma as any).attempt.findMany({
        where: {
            examId,
            finishedAt: { not: null }
        },
        include: {
            answers: true
        }
    });

    const totalAttempts = attempts.length;
    if (totalAttempts === 0) {
        return {
            totalAttempts: 0,
            averageScore: 0,
            distributionLevels: { Excelente: 0, Alto: 0, Medio: 0, Bajo: 0 },
            preguntasMasFalladas: []
        };
    }

    // 2. Calcular promedio y distribución
    let sumScores = 0;
    const distribution = { Excelente: 0, Alto: 0, Medio: 0, Bajo: 0 };

    attempts.forEach((att: any) => {
        sumScores += att.scoreTotal || 0;
        const level = att.levelEstimated as keyof typeof distribution;
        if (distribution[level] !== undefined) {
            distribution[level]++;
        }
    });

    const averageScore = sumScores / totalAttempts;

    // 3. Analizar preguntas más falladas
    // Necesitamos saber cuántas veces se respondió cada pregunta y cuántas veces fue incorrecta
    const questions = await (prisma as any).question.findMany({
        where: { examId },
        select: { id: true, questionText: true }
    });

    const questionFailureMap: Record<string, { total: number; failed: number; text: string }> = {};
    questions.forEach((q: any) => {
        questionFailureMap[q.id] = { total: 0, failed: 0, text: q.questionText };
    });

    attempts.forEach((att: any) => {
        att.answers.forEach((ans: any) => {
            if (questionFailureMap[ans.questionId]) {
                questionFailureMap[ans.questionId].total++;
                if (!ans.isCorrect) {
                    questionFailureMap[ans.questionId].failed++;
                }
            }
        });
    });

    const preguntasMasFalladas: QuestionStats[] = Object.keys(questionFailureMap)
        .map(id => ({
            questionId: id,
            questionText: questionFailureMap[id].text,
            errorPercentage: questionFailureMap[id].total > 0
                ? (questionFailureMap[id].failed / questionFailureMap[id].total) * 100
                : 0
        }))
        .filter(q => q.errorPercentage > 0)
        .sort((a, b) => b.errorPercentage - a.errorPercentage)
        .slice(0, 5); // Top 5 más falladas

    return {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        distributionLevels: distribution,
        preguntasMasFalladas
    };
};
