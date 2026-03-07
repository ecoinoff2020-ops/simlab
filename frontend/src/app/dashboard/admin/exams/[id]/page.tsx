'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    FileText,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Save,
    Layout,
    Clock,
    Target
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id?: string;
    optionText: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    questionText: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN';
    points: number;
    competency: { name: string };
    options: Option[];
}

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
}

interface Competency {
    id: string;
    name: string;
}

export default function ExamDetailPage() {
    const { id: examId } = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [qType, setQType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN'>('MULTIPLE_CHOICE');
    const [qText, setQText] = useState('');
    const [qPoints, setQPoints] = useState(1);
    const [qCompetencyId, setQCompetencyId] = useState('');
    const [qCorrectAnswer, setQCorrectAnswer] = useState('');
    const [qOptions, setQOptions] = useState<Option[]>([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examRes, questionsRes, compRes] = await Promise.all([
                    api.get(`admin/exams`), // This usually lists all, we need a single one if exists
                    api.get(`admin/questions/exam/${examId}`),
                    api.get('admin/competencies')
                ]);

                // Assuming we can find the exam from the list for now if there's no /admin/exams/:id
                const currentExam = examRes.data.find((e: Exam) => e.id === examId);
                setExam(currentExam || null);
                setQuestions(questionsRes.data);
                setCompetencies(compRes.data);
                if (compRes.data.length > 0) setQCompetencyId(compRes.data[0].id);
            } catch (error) {
                console.error('Error fetching exam details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [examId]);

    const handleAddOption = () => {
        setQOptions([...qOptions, { optionText: '', isCorrect: false }]);
    };

    const handleRemoveOption = (index: number) => {
        setQOptions(qOptions.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...qOptions];
        newOptions[index].optionText = text;
        setQOptions(newOptions);
    };

    const handleCorrectOptionChange = (index: number) => {
        setQOptions(qOptions.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        })));
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                examId,
                competencyId: qCompetencyId,
                type: qType,
                questionText: qText,
                points: qPoints,
                correctAnswer: qType === 'OPEN' ? qCorrectAnswer : (qType === 'TRUE_FALSE' ? qCorrectAnswer : null),
                options: qType === 'MULTIPLE_CHOICE' ? qOptions : []
            };

            const res = await api.post('admin/questions', payload);
            setQuestions([...questions, res.data]);
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error('Error creating question', error);
            alert('Error al crear la pregunta. Revisa los campos.');
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm('¿Eliminar esta pregunta?')) return;
        try {
            await api.delete(`admin/questions/${qId}`);
            setQuestions(questions.filter(q => q.id !== qId));
        } catch (error) {
            alert('Error al eliminar la pregunta');
        }
    };

    const resetForm = () => {
        setQText('');
        setQPoints(1);
        setQType('MULTIPLE_CHOICE');
        setQOptions([
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
        ]);
        setQCorrectAnswer('');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!exam) return <div className="p-8 text-center text-slate-500 font-bold">Examen no encontrado</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/exams"
                        className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{exam.title}</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Clock size={16} /> {exam.durationMinutes} min</span>
                            <span className="flex items-center gap-1.5"><FileText size={16} /> {questions.length} preguntas</span>
                        </p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus size={20} />
                        Agregar Pregunta
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <form onSubmit={handleCreateQuestion} className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-900">Nueva Pregunta</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={qType}
                                        onChange={(e) => setQType(e.target.value as any)}
                                    >
                                        <option value="MULTIPLE_CHOICE">Opción Múltiple</option>
                                        <option value="TRUE_FALSE">Verdadero / Falso</option>
                                        <option value="OPEN">Pregunta Abierta</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntos</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={qPoints}
                                        onChange={(e) => setQPoints(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Competencia</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={qCompetencyId}
                                        onChange={(e) => setQCompetencyId(e.target.value)}
                                        required
                                    >
                                        {competencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Texto de la Pregunta</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                                    rows={3}
                                    placeholder="Escribe la pregunta aquí..."
                                    value={qText}
                                    onChange={(e) => setQText(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Details based on type */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                {qType === 'MULTIPLE_CHOICE' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-bold text-slate-600">Opciones de Respuesta</h4>
                                            <button
                                                type="button"
                                                onClick={handleAddOption}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Añadir Opción
                                            </button>
                                        </div>
                                        {qOptions.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="correct"
                                                    checked={opt.isCorrect}
                                                    onChange={() => handleCorrectOptionChange(idx)}
                                                    className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    placeholder={`Opción ${idx + 1}`}
                                                    value={opt.optionText}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    required
                                                />
                                                {qOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(idx)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {qType === 'TRUE_FALSE' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-600">Respuesta Correcta</h4>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="tf"
                                                    value="true"
                                                    checked={qCorrectAnswer === 'true'}
                                                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                                                    className="w-5 h-5 text-indigo-600"
                                                />
                                                <span className="font-medium group-hover:text-indigo-600 transition-colors">Verdadero</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="tf"
                                                    value="false"
                                                    checked={qCorrectAnswer === 'false'}
                                                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                                                    className="w-5 h-5 text-indigo-600"
                                                />
                                                <span className="font-medium group-hover:text-indigo-600 transition-colors">Falso</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {qType === 'OPEN' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-600">Guía de Respuesta Correcta (Palabras clave o frase esperada)</h4>
                                        <textarea
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                                            rows={2}
                                            placeholder="Ej: Lavado de manos quirúrgico..."
                                            value={qCorrectAnswer}
                                            onChange={(e) => setQCorrectAnswer(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                                >
                                    <Save size={18} />
                                    Guardar Pregunta
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Layout size={20} className="text-indigo-600" />
                    Preguntas del Examen
                </h3>

                {questions.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <HelpCircle size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No hay preguntas registradas. Comienza agregando una.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {questions.map((q, idx) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                                {q.type === 'MULTIPLE_CHOICE' ? 'Opción Múltiple' : q.type === 'TRUE_FALSE' ? 'V/F' : 'Abierta'}
                                            </span>
                                            <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                                <Target size={12} /> {q.competency?.name || 'Gral'}
                                            </span>
                                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                                                {q.points} pts
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-lg leading-snug">{q.questionText}</h4>

                                        {q.options.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm ${opt.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                                                        {opt.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} className="opacity-20" />}
                                                        <span className={opt.isCorrect ? 'font-bold' : ''}>{opt.optionText}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleDeleteQuestion(q.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
