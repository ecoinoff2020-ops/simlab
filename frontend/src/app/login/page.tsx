'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function LoginContent() {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const params = new URLSearchParams(window.location.search);
        if (params.get('registered')) {
            setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.post('auth/login', formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // REDIRECCIÓN DURA: Limpia el estado de React y el DOM por completo
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Email o contraseña incorrectos');
            setLoading(false);
        }
    };

    // Evitamos CUALQUIER renderizado hasta que esté montado en el cliente
    if (!mounted) {
        return <div className="min-h-screen bg-slate-50" />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden" suppressHydrationWarning>
            {/* Panel Izquierdo (Diseño estático sin animaciones para evitar errores de DOM) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[120px]"></div>
                </div>
                <div className="relative z-10 text-center max-w-md">
                    <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl p-4">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-6">SimLab</h1>
                    <p className="text-slate-400">Plataforma de simulación docente.</p>
                </div>
            </div>

            {/* Panel Derecho */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-slate-100">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Bienvenido</h2>
                        <p className="text-slate-500 font-medium">Inicia sesión para continuar.</p>
                    </div>

                    {/* Contenedores de mensaje estáticos para evitar manipulación dinámica del DOM que cause removeChild errors */}
                    <div className="min-h-[60px]">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
                                <CheckCircle2 size={18} /> {success}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Entrar <ArrowRight size={20} /></>
                            )}
                        </button>

                        <div className="pt-8 text-center border-t border-slate-100">
                            <p className="text-slate-500 font-medium text-sm">
                                ¿No tienes cuenta? {' '}
                                <Link href="/register" className="text-indigo-600 font-bold hover:underline">Regístrate</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <LoginContent />
        </Suspense>
    );
}
