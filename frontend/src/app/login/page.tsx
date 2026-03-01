'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginInputs({ formData, handleChange, loading, error, success, handleSubmit }: any) {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contraseña</label>
                    <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        Entrar a SimLab
                        <ArrowRight size={20} />
                    </>
                )}
            </button>

            <div className="pt-8 text-center border-t border-slate-100">
                <p className="text-slate-500 font-medium text-sm">
                    ¿Aún no tienes acceso? {' '}
                    <Link href="/register" className="text-indigo-600 font-bold hover:underline">Solicita tu cuenta</Link>
                </p>
            </div>
        </form>
    );
}

function LoginWrapper() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered')) {
            setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.post('/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al entrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Left Decor */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-violet-600 rounded-full blur-[120px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center max-w-md"
                >
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <span className="text-white text-3xl font-black">S</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-6 leading-tight">Potencia tu futuro docente con <span className="text-indigo-400">SimLab</span></h1>
                    <p className="text-slate-400 text-lg">La plataforma de simulación más intuitiva para profesionales de la educación.</p>
                </motion.div>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Bienvenido</h2>
                            <p className="text-slate-500 font-medium">Inicia sesión en tu cuenta.</p>
                        </div>

                        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
                        {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-2"><CheckCircle2 size={18} /> {success}</div>}

                        <LoginInputs
                            formData={formData}
                            handleChange={handleChange}
                            loading={loading}
                            error={error}
                            success={success}
                            handleSubmit={handleSubmit}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>}>
            <LoginWrapper />
        </Suspense>
    );
}
