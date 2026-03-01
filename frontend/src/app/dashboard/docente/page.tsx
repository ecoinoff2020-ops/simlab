'use client';

import { useEffect, useState } from 'react';
import {
    Play,
    History,
    Award,
    Clock,
    ArrowRight,
    TrendingUp,
    BookOpen
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
}

export default function DocenteDashboard() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [stats, setStats] = useState({ totalAttempts: 0, bestScore: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, statsRes] = await Promise.all([
                    api.get('/exams'),
                    api.get('/exams/my-stats')
                ]);
                setExams(examsRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Espacio de Simulación</h1>
                    <p className="text-slate-500 mt-1">Explora los exámenes disponibles y pon a prueba tus conocimientos.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex -space-x-2 overflow-hidden px-2">
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">AS</div>
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">MR</div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium pr-4">12 docentes activos hoy</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Exams */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Play size={20} className="text-indigo-600" />
                        Exámenes Disponibles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.length > 0 ? exams.map((exam, index) => (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-100 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                    <BookOpen size={60} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-6">{exam.description || 'Sin descripción disponible.'}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-xs font-medium">{exam.durationMinutes} min</span>
                                    </div>
                                    <Link
                                        href={`/dashboard/docente/simulation/${exam.id}`}
                                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                    >
                                        Iniciar
                                        <Play size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                                <p className="text-slate-400">No hay exámenes disponibles en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" />
                        Mi Actividad
                    </h2>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Mejor Puntaje</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.bestScore}%</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <History size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Simulaciones</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalAttempts}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <Link href="/dashboard/docente/results" className="flex items-center justify-between group">
                                <span className="text-sm font-bold text-indigo-600">Ver historial completo</span>
                                <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2">Tip de Simulación</p>
                            <p className="text-sm text-slate-300 italic font-serif">"La práctica constante es la clave de la maestría. Intenta superar tus debilidades por competencia."</p>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
