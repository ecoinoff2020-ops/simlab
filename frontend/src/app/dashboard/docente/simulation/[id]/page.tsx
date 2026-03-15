'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import SimulationInterface from '@/components/simulation/SimulationInterface';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Download,
    Home,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function SimulationPage() {
    const { id } = useParams();
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);

    const handleFinish = (data: any) => {
        setResult(data);
    };

    const downloadPDF = async () => {
        if (!result?.attemptId) return;
        setDownloading(true);
        try {
            const res = await api.get(`exams/report/pdf/${result.attemptId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${result.attemptId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al descargar el PDF');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center py-10 px-4">
            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="interface"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full"
                    >
                        <SimulationInterface examId={id as string} onFinish={handleFinish} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl w-full bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-indigo-100 border border-indigo-50"
                    >
                        <div className="text-center mb-12">
                            <div className="inline-flex p-4 bg-emerald-50 rounded-3xl mb-6 ring-8 ring-emerald-50/50">
                                <CheckCircle2 className="text-emerald-500" size={48} />
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">¡Simulación Completada!</h1>
                            <p className="text-slate-500 text-lg">Has finalizado tu evaluación de {result.examTitle || 'la plataforma'}. Revisa tus resultados detallados abajo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-100/50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Puntaje Obtenido</p>
                                <div className="relative inline-block">
                                    <p className="text-5xl font-black text-slate-900">{result.scoreTotal}</p>
                                    <p className="text-xs font-bold text-indigo-500 mt-1">SISTEMA SIMLAB</p>
                                </div>
                            </div>
                            <div className="bg-indigo-600 p-8 rounded-3xl text-center text-white shadow-xl shadow-indigo-200">
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3">Nivel Estimado</p>
                                <p className="text-4xl font-black">{result.levelEstimated}</p>
                                <p className="text-xs font-medium text-indigo-100 mt-2">Basado en competencias</p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-100/50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Respuestas</p>
                                <p className="text-5xl font-black text-slate-900">{result.correctAnswers} <span className="text-2xl text-slate-300 font-normal">/ {result.totalQuestions}</span></p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <BarChart3 className="text-indigo-600" size={24} />
                                Desglose por Competencia
                            </h3>

                            <div className="space-y-4">
                                {result.breakdownByCompetency?.map((b: any, i: number) => (
                                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{b.competencyName}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{b.totalQuestions} preguntas evaluadas</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-lg font-black ${b.percentage >= 80 ? 'text-emerald-500' : b.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {b.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                                            <div
                                                className={`h-full transition-all duration-1000 ${b.percentage >= 80 ? 'bg-emerald-500' : b.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${b.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <AlertCircle size={14} className="text-slate-400 mt-0.5" />
                                            <p className="text-xs text-slate-600 font-medium italic">&quot;{b.feedback}&quot;</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={downloadPDF}
                                disabled={downloading}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                            >
                                {downloading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Download size={20} />
                                )}
                                Descargar Reporte Profesional (PDF)
                            </button>
                            <Link
                                href="/dashboard/docente"
                                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all"
                            >
                                <Home size={20} />
                                Volver al Inicio
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
