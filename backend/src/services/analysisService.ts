export interface CompetencyResult {
    competencyName: string;
    percentage: number;
    feedback: string;
}

export const calculateCompetencyBreakdown = (attempt: any): CompetencyResult[] => {
    const breakdown: Record<string, { totalPoints: number; obtainedPoints: number; name: string }> = {};

    // 1. Agrupar por competencia desde la estructura del examen cargado en el attempt
    attempt.exam.questions.forEach((question: any) => {
        const compId = question.competency.id;
        const compName = question.competency.name;

        if (!breakdown[compId]) {
            breakdown[compId] = { totalPoints: 0, obtainedPoints: 0, name: compName };
        }

        breakdown[compId].totalPoints += question.points;

        // Buscar respuesta del usuario para esta pregunta
        const userAnswer = attempt.answers.find((a: any) => a.questionId === question.id);
        if (userAnswer && userAnswer.isCorrect) {
            breakdown[compId].obtainedPoints += userAnswer.scoreObtained;
        }
    });

    // 2. Calcular porcentajes y aplicar retroalimentación
    return Object.values(breakdown).map(comp => {
        const percentage = comp.totalPoints > 0 ? (comp.obtainedPoints / comp.totalPoints) * 100 : 0;

        let feedback = "Área crítica, requiere estudio urgente";
        if (percentage >= 90) feedback = "Dominio excelente";
        else if (percentage >= 75) feedback = "Buen dominio";
        else if (percentage >= 60) feedback = "Dominio aceptable, necesita reforzar";

        return {
            competencyName: comp.name,
            percentage: Math.round(percentage),
            feedback
        };
    });
};
