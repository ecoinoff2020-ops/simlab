const PdfPrinter = require('pdfmake/js/Printer').default;
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';
import { calculateCompetencyBreakdown } from './analysisService';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Configuración de fuentes para pdfmake (usando las estándar del sistema para evitar buffers pesados)
const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

export const generateIndividualPDF = async (attemptId: string): Promise<any> => {
    const attempt = await (prisma as any).attempt.findUnique({
        where: { id: attemptId },
        include: {
            user: true,
            exam: {
                include: {
                    questions: {
                        include: { competency: true, options: true }
                    }
                }
            },
            answers: true
        }
    });

    if (!attempt || !attempt.finishedAt) {
        throw new Error('Intento no encontrado o no finalizado');
    }

    const breakdown = calculateCompetencyBreakdown(attempt);

    const docDefinition: TDocumentDefinitions = {
        content: [
            { text: 'SIMLAB - REPORTE DE RESULTADOS', style: 'header' },
            { text: `Examen: ${attempt.exam.title}`, style: 'subheader' },
            { text: `Usuario: ${attempt.user.name} (${attempt.user.email})`, margin: [0, 10, 0, 0] },
            { text: `Fecha: ${attempt.finishedAt.toLocaleDateString()}`, margin: [0, 5, 0, 20] },

            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [{ text: 'PUNTAJE TOTAL', bold: true }, { text: attempt.scoreTotal?.toString() || '0', bold: true }],
                        [{ text: 'NIVEL ESTIMADO', bold: true }, { text: attempt.levelEstimated || 'N/A', bold: true }]
                    ]
                }
            },

            { text: 'Desglose por Competencia', style: 'subheader', margin: [0, 20, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto'],
                    body: [
                        [{ text: 'Competencia', bold: true }, { text: '%', bold: true }, { text: 'Feedback', bold: true }],
                        ...breakdown.map(b => [b.competencyName, `${b.percentage}%`, b.feedback])
                    ]
                }
            }
        ],
        styles: {
            header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
            subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] }
        }
    };

    return printer.createPdfKitDocument(docDefinition);
};

export const generateMassiveExcel = async (examId: string): Promise<ExcelJS.Workbook> => {
    const exam = await (prisma as any).exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error('Examen no encontrado');

    const attempts = await (prisma as any).attempt.findMany({
        where: { examId, finishedAt: { not: null } },
        include: {
            user: true,
            answers: true,
            exam: {
                include: {
                    questions: { include: { competency: true } }
                }
            }
        }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resultados SimLab');

    // Configurar columnas
    worksheet.columns = [
        { header: 'Usuario', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Puntaje', key: 'score', width: 10 },
        { header: 'Nivel', key: 'level', width: 15 },
        { header: 'Fecha', key: 'date', width: 20 },
        { header: 'Desglose Competencias', key: 'competencies', width: 50 },
    ];

    attempts.forEach(att => {
        const breakdown = calculateCompetencyBreakdown(att);
        const competencyString = breakdown.map(b => `${b.competencyName}: ${b.percentage}%`).join(' | ');

        worksheet.addRow({
            name: att.user.name,
            email: att.user.email,
            score: att.scoreTotal,
            level: att.levelEstimated,
            date: att.finishedAt?.toLocaleDateString(),
            competencies: competencyString
        });
    });

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true };

    return workbook;
};
