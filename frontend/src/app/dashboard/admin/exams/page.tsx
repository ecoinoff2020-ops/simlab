'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Edit3,
    Trash2,
    Eye,
    FileText,
    Calendar
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    _count?: { questions: number };
    createdAt: string;
}

export default function AdminExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/admin/exams');
                setExams(res.data);
            } catch (error) {
                console.error('Error fetching exams', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = exams.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const deleteExam = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este examen? Todas las preguntas y resultados asociados se perderán.')) return;
        try {
            await api.delete(`/admin/exams/${id}`);
            setExams(exams.filter(e => e.id !== id));
        } catch (err) {
            alert('Error al eliminar el examen');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Exámenes</h1>
                    <p className="text-slate-500 mt-1">Crea y administra los bancos de preguntas para tus simulaciones.</p>
                </div>
                <Link
                    href="/dashboard/admin/exams/new"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Nuevo Examen
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título de examen..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Exams Grid/Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam, index) => (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <FileText size={24} />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">{exam.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">{exam.description || 'Sin descripción.'}</p>

                            <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Edit3 size={14} />
                                    {exam._count?.questions || 0} Preguntas
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {new Date(exam.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <Link
                                    href={`/dashboard/admin/exams/${exam.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                >
                                    <Eye size={16} />
                                    Ver
                                </Link>
                                <button
                                    onClick={() => deleteExam(exam.id)}
                                    className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredExams.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No se encontraron exámenes con ese criterio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
