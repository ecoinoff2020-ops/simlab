'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { User, Mail, Lock, UserPlus, ShieldCheck, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'docente',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            await api.post('auth/register', formData);
            // REDIRECCIÓN DURA para evitar conflictos de DOM
            window.location.href = '/login?registered=true';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    if (!mounted) return <div className="min-h-screen bg-white" />;

    return (
        <div className="min-h-screen bg-white flex overflow-hidden" suppressHydrationWarning>
            {/* Left Side: Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="mb-8 inline-flex items-center justify-center w-28 h-28 bg-white rounded-[2.5rem] shadow-2xl p-5 border border-slate-100/50">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-6">
                        Únete a la nueva era del <span className="text-indigo-400">Aprendizaje</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                        Regístrate hoy y accede a herramientas de simulación diseñadas para potenciar tu carrera docente.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 overflow-y-auto">
                <div className="w-full max-w-md my-8 bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-slate-100">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Crear Cuenta</h2>
                        <p className="text-slate-500 font-medium">Forma parte de nuestra comunidad educativa.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div className="space-y-6 text-center py-4">
                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                            <ShieldCheck className="mx-auto text-amber-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Registro Restringido</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                El registro en <b>SimLab</b> es exclusivo para clientes con suscripción activa.
                            </p>
                        </div>

                        <div className="pt-4">
                            <h4 className="font-bold text-slate-900 mb-2">¿Deseas implementar SimLab en tu institución?</h4>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Contáctanos para obtener una demo y conocer nuestros planes comerciales.</p>

                            <a
                                href="mailto:ecoinoff2020@gmail.com"
                                className="w-full inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                            >
                                Contactar Comercial <ArrowRight size={20} />
                            </a>
                        </div>

                        <div className="pt-8 text-center border-t border-slate-100">
                            <p className="text-slate-500 font-medium text-sm">
                                ¿Ya tienes una cuenta? {' '}
                                <Link href="/login" className="text-indigo-600 font-bold hover:underline">Inicia sesión aquí</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
