'use client';

import { useEffect, useState } from 'react';
import { Search, Play, Clock, BookOpen, Filter } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    _count?: {
        questions: number;
    };
}

export default function ExploreExams() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/exams');
                setExams(res.data);
                setFilteredExams(res.data);
            } catch (error) {
                console.error('Error fetching exams', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    useEffect(() => {
        const filtered = exams.filter(exam =>
            exam.title.toLowerCase().includes(search.toLowerCase()) ||
            exam.description?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredExams(filtered);
    }, [search, exams]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explorar Exámenes</h1>
                    <p className="text-slate-500 mt-1">Descubre nuevos desafíos y certifica tus competencias.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título o descripción..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all border border-slate-200">
                    <Filter size={20} />
                    Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.length > 0 ? filteredExams.map((exam, index) => (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group border-b-4 border-b-transparent hover:border-b-indigo-500"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                                {exam._count?.questions || 0} Preguntas
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-xl mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                            {exam.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-6 min-h-[60px]">
                            {exam.description || 'Prepárate para este desafío diseñado para poner a prueba tus capacidades estratégicas y técnicas.'}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={16} />
                                <span className="text-sm font-semibold">{exam.durationMinutes} minutos</span>
                            </div>
                            <Link
                                href={`/dashboard/docente/simulation/${exam.id}`}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                            >
                                Comenzar
                                <Play size={14} fill="currentColor" />
                            </Link>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No encontramos lo que buscas</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">Intenta ajustar tu búsqueda o explorar otras categorías.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
