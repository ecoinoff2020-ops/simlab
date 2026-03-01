'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Target,
    AlertTriangle,
    Users,
    Search
} from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

interface QuestionStat {
    questionId: string;
    questionText: string;
    errorPercentage: number;
}

interface Stats {
    totalAttempts: number;
    averageScore: number;
    distributionLevels: {
        Excelente: number;
        Alto: number;
        Medio: number;
        Bajo: number;
    };
    preguntasMasFalladas: QuestionStat[];
}

export default function AdminStatsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExam, setSelectedExam] = useState<string>('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/admin/exams');
                setExams(res.data);
                if (res.data.length > 0) {
                    setSelectedExam(res.data[0].id);
                }
            } catch (err) {
                console.error('Error fetching exams', err);
            }
        };
        fetchExams();
    }, []);

    useEffect(() => {
        if (!selectedExam) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/stats/${selectedExam}`);
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedExam]);

    const downloadExcel = async () => {
        if (!selectedExam) return;
        try {
            const res = await api.get(`/admin/report/excel/${selectedExam}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_masivo_${selectedExam}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al descargar el Excel');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Estadísticas Globales</h1>
                    <p className="text-slate-500 mt-1">Análisis profundo del rendimiento académico por examen.</p>
                </div>
                <button
                    onClick={downloadExcel}
                    disabled={!selectedExam}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                >
                    <Download size={20} />
                    Exportar Excel Masivo
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Seleccionar Examen</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 appearance-none pointer-events-auto"
                    >
                        {exams.map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Procesando datos analíticos...</p>
                </div>
            ) : stats ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Top Overviews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100">
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Intentos</p>
                            <div className="flex items-center gap-3">
                                <Users className="text-blue-500" size={20} />
                                <p className="text-2xl font-bold text-slate-900">{stats.totalAttempts}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100">
                            <p className="text-sm font-medium text-slate-500 mb-1">Promedio General</p>
                            <div className="flex items-center gap-3">
                                <Target className="text-indigo-500" size={20} />
                                <p className="text-2xl font-bold text-slate-900">{stats.averageScore}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Level Distribution */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <BarChart3 className="text-indigo-600" size={20} />
                                Distribución de Niveles
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(stats.distributionLevels).map(([level, count]) => {
                                    const percentage = stats.totalAttempts > 0 ? (count / stats.totalAttempts) * 100 : 0;
                                    const color = level === 'Excelente' ? 'bg-emerald-500' : level === 'Alto' ? 'bg-blue-500' : level === 'Medio' ? 'bg-amber-500' : 'bg-red-500';
                                    return (
                                        <div key={level} className="space-y-2">
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className="text-slate-700">{level}</span>
                                                <span className="text-slate-400">{count} estudiantes</span>
                                            </div>
                                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className={`h-full ${color}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Failing Questions */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={20} />
                                Preguntas con Mayor Error
                            </h3>
                            <div className="space-y-4">
                                {stats.preguntasMasFalladas.length > 0 ? stats.preguntasMasFalladas.map((q, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-red-500 shadow-sm transition-transform hover:scale-110">
                                            {Math.round(q.errorPercentage)}%
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{q.questionText}</p>
                                            <p className="text-xs text-slate-500">Tasa de fallo crítica identificada</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center py-12 text-slate-400">No hay datos suficientes para analizar fallos.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-slate-400">Selecciona un examen para ver las estadísticas.</p>
                </div>
            )}
        </div>
    );
}
