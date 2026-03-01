'use client';

import { useEffect, useState } from 'react';
import {
    History,
    Search,
    Download,
    Eye,
    Calendar,
    Award,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Result {
    id: string;
    scoreTotal: number;
    levelEstimated: string;
    finishedAt: string;
    exam: { title: string };
}

export default function DocenteResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get('/exams/my-history');
                setResults(res.data);
            } catch (error) {
                console.error('Error fetching results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historial de Simulaciones</h1>
                <p className="text-slate-500 mt-1">Revisa tu progreso y descarga tus certificados de competencia.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de examen..."
                            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordenar por:</span>
                        <select className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer">
                            <option>Más reciente</option>
                            <option>Mayor puntaje</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="px-8 py-4">Examen</th>
                                <th className="px-8 py-4">Fecha</th>
                                <th className="px-8 py-4">Puntaje</th>
                                <th className="px-8 py-4">Nivel</th>
                                <th className="px-8 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {results.map((result, index) => (
                                <motion.tr
                                    key={result.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <History size={18} />
                                            </div>
                                            <span className="font-bold text-slate-900">{result.exam.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar size={14} />
                                            {new Date(result.finishedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className={result.scoreTotal >= 80 ? 'text-emerald-500' : 'text-slate-300'} />
                                            <span className="font-black text-slate-900">{result.scoreTotal}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.levelEstimated === 'Excelente' ? 'bg-emerald-50 text-emerald-600' :
                                            result.levelEstimated === 'Alto' ? 'bg-blue-50 text-blue-600' :
                                                result.levelEstimated === 'Medio' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'
                                            }`}>
                                            {result.levelEstimated}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/dashboard/docente/simulation/result/${result.id}`}
                                                className="p-2 bg-white border border-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm transition-all"
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.get(`/exams/report/pdf/${result.id}`, { responseType: 'blob' });
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `reporte_${result.id}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        alert('Error al descargar el PDF');
                                                    }
                                                }}
                                                className="p-2 bg-white border border-slate-100 text-slate-600 hover:text-emerald-600 rounded-lg shadow-sm transition-all"
                                                title="Descargar PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {results.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">Aún no has completado ninguna simulación.</p>
                        <Link href="/dashboard/docente" className="text-indigo-600 font-bold text-sm mt-2 inline-flex items-center gap-1 group">
                            Ir a explorar exámenes
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
