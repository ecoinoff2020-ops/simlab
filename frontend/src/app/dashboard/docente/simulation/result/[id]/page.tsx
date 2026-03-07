'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Download,
    ArrowLeft
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ResultDetailPage() {
    const { id } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // En un caso real, el backend debería permitir GET /results/:id
                // Para este prototipo, simularemos que lo obtenemos de la lógica de análisis
                const res = await api.get(`exams/${id}/results`);
                setResult({
                    attemptId: id,
                    scoreTotal: 0,
                    levelEstimated: 'Bajo',
                    correctAnswers: 0,
                    totalQuestions: 1,
                    examTitle: 'Primer Parcial Simulación',
                    breakdownByCompetency: [
                        {
                            competencyName: 'Anatomía Humana',
                            percentage: 0,
                            totalQuestions: 1,
                            feedback: 'Se requiere estudio profundo de este módulo.'
                        }
                    ]
                });
            } catch (err) {
                console.error('Error fetching result', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const downloadPDF = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`exams/report/pdf/${id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al descargar el PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <Link href="/dashboard/docente/results" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Volver al Historial
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100"
            >
                {/* Usamos el mismo diseño que en la vista de fin de examen pero sin el padding extra de página completa */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Reporte Detallado</h1>
                    <p className="text-slate-500 font-medium">{result.examTitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Puntaje</p>
                        <p className="text-4xl font-black text-slate-900">{result.scoreTotal}</p>
                    </div>
                    <div className="bg-indigo-600 p-6 rounded-2xl text-center text-white">
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Nivel</p>
                        <p className="text-3xl font-black">{result.levelEstimated}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Respuestas</p>
                        <p className="text-4xl font-black text-slate-900">{result.correctAnswers} / {result.totalQuestions}</p>
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-indigo-600" size={20} />
                        Desglose por Competencia
                    </h3>

                    <div className="space-y-4">
                        {result.breakdownByCompetency?.map((b: any, i: number) => (
                            <div key={i} className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-slate-800">{b.competencyName}</h4>
                                    <span className="font-black text-indigo-600">{b.percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-indigo-500" style={{ width: `${b.percentage}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 italic">&quot;{b.feedback}&quot;</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                    {downloading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Download size={20} />
                    )}
                    Descargar Reporte Profesional (PDF)
                </button>
            </motion.div>
        </div>
    );
}
