'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Send,
    Clock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

interface Option {
    id: string;
    optionText: string;
}

interface Question {
    id: string;
    questionText: string;
    type: string;
    options: Option[];
}

interface SimulationInterfaceProps {
    examId: string;
    onFinish: (result: any) => void;
}

export default function SimulationInterface({ examId, onFinish }: SimulationInterfaceProps) {
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const startSimulation = async () => {
            try {
                const res = await api.post(`/exams/${examId}/start`);
                const { attemptId, questions, exam } = res.data;

                setAttemptId(attemptId);
                setQuestions(questions);
                setTimeLeft(exam.durationMinutes * 60);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al iniciar la simulación');
                setLoading(false);
            }
        };

        startSimulation();
    }, [examId]);

    const handleFinish = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.post(`/exams/${attemptId}/finish`);
            onFinish(res.data);
        } catch (err) {
            setError('Error al finalizar el examen');
            setLoading(false);
        }
    }, [attemptId, onFinish]);

    useEffect(() => {
        if (timeLeft <= 0 || loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, handleFinish]);

    const saveCurrentAnswer = useCallback(async (questionId: string, answer: string) => {
        setSaving(true);
        try {
            await api.post(`/exams/${attemptId}/answer`, {
                questionId,
                answerText: answer
            });
        } catch (err) {
            console.error('Error auto-saving answer', err);
        } finally {
            setSaving(false);
        }
    }, [attemptId]);

    const handleOptionSelect = (optionId: string) => {
        const currentQuestion = questions[currentIndex];
        const newAnswers = { ...answers, [currentQuestion.id]: optionId };
        setAnswers(newAnswers);
        saveCurrentAnswer(currentQuestion.id, optionId);
    };

    const handleOpenAnswer = (text: string) => {
        const currentQuestion = questions[currentIndex];
        const newAnswers = { ...answers, [currentQuestion.id]: text };
        setAnswers(newAnswers);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !attemptId) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium font-serif animate-pulse">Preparando entorno de simulación...</p>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-red-900 mb-2">Ups, algo salió mal</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Reintentar</button>
        </div>
    );

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Clock className={`text-slate-400 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`} size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tiempo Restante</p>
                        <p className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-slate-900'}`}>{formatTime(timeLeft)}</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pregunta</p>
                    <p className="text-lg font-bold text-slate-900">{currentIndex + 1} <span className="text-slate-300 font-normal">/ {questions.length}</span></p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full mb-12 overflow-hidden shadow-inner">
                <motion.div
                    className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                ></motion.div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                {currentQuestion && (
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-50 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-10">
                            {currentQuestion.questionText}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.type !== 'OPEN' ? (
                                currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${answers[currentQuestion.id] === option.id
                                            ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-200'
                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className={`font-medium ${answers[currentQuestion.id] === option.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {option.optionText}
                                        </span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center ${answers[currentQuestion.id] === option.id
                                            ? 'border-indigo-600 bg-indigo-600'
                                            : 'border-slate-200 group-hover:border-slate-300'
                                            }`}>
                                            {answers[currentQuestion.id] === option.id && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleOpenAnswer(e.target.value)}
                                    onBlur={(e) => saveCurrentAnswer(currentQuestion.id, e.target.value)}
                                    className="w-full h-40 p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-0 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                                    placeholder="Escribe tu respuesta detalladamente aquí..."
                                ></textarea>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${currentIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-105"
                    >
                        Finalizar Examen
                        <Send size={20} />
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105"
                    >
                        Siguiente
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            {saving && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                    Guardando progreso...
                </div>
            )}
        </div>
    );
}
