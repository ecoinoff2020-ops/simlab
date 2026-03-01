'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ShieldCheck, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'docente',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', formData);
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side: Branding (Consistent with Login) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[120px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-lg text-center"
                >
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 text-white font-black text-4xl">S</div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-6">
                        Únete a la nueva era del <span className="text-indigo-400">Aprendizaje</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                        Regístrate hoy y accede a herramientas de simulación diseñadas para potenciar tu carrera docente.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl text-left">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Validación Profesional</h4>
                                <p className="text-slate-500 text-xs mt-1">Nuestros algoritmos aseguran una evaluación objetiva y precisa.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-10 left-10 text-slate-500 text-xs font-medium tracking-widest uppercase">
                    Plataforma SimLab &bull; Comunidad Académica
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md my-8"
                >
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-indigo-100 border border-slate-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Crear Cuenta</h2>
                            <p className="text-slate-500 font-medium">Forma parte de nuestra comunidad educativa.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
                            >
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium leading-relaxed">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                                        placeholder="Juan Pérez"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Académico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                                        placeholder="tu@universidad.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tu Rol en SimLab</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <select
                                        name="role"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="docente">Soy Docente</option>
                                        <option value="admin">Soy Administrador</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ArrowRight className="rotate-90 text-slate-400" size={16} />
                                    </div>
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
                                        Crear mi Cuenta
                                        <UserPlus size={20} />
                                    </>
                                )}
                            </button>

                            <div className="pt-8 text-center border-t border-slate-100">
                                <p className="text-slate-500 font-medium text-sm">
                                    ¿Ya tienes una cuenta? {' '}
                                    <Link href="/login" className="text-indigo-600 font-bold hover:underline">Inicia sesión aquí</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
