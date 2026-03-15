'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    BookOpen,
    CheckCircle2,
    TrendingUp,
    Plus,
    ArrowRight,
    BarChart3,
    Settings
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardStats {
    usersCount: number;
    examsCount: number;
    attemptsCount: number;
    avgScore: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('admin/dashboard-stats');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching admin dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const cards = [
        { name: 'Usuarios Totales', value: stats?.usersCount || 0, icon: Users, color: 'bg-blue-500', trend: '+12%' },
        { name: 'Exámenes Activos', value: stats?.examsCount || 0, icon: BookOpen, color: 'bg-indigo-500', trend: '+2 nuevos' },
        { name: 'Simulaciones Realizadas', value: stats?.attemptsCount || 0, icon: CheckCircle2, color: 'bg-emerald-500', trend: '+8 hoy' },
        { name: 'Promedio General', value: `${stats?.avgScore || 0}%`, icon: TrendingUp, color: 'bg-amber-500', trend: 'Estable' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Administración</h1>
                <p className="text-slate-500 mt-1">Bienvenido a la consola central de SimLab. Aquí tienes un resumen de la actividad.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl ${card.color} text-white shadow-lg shadow-blue-500/10`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{card.trend}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-500">{card.name}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/dashboard/admin/exams/new" className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Plus size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Crear Examen</h4>
                                        <p className="text-xs text-slate-500">Diseña una nueva evaluación</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link href="/dashboard/admin/users" className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Users size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Gestionar Usuarios</h4>
                                        <p className="text-xs text-slate-500">Crear cuentas de docentes o admin</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link href="/dashboard/admin/competencies" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Settings size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Configurar Competencias</h4>
                                        <p className="text-xs text-slate-500">Gestionar áreas de conocimiento</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Análisis Profesional</h3>
                            <p className="text-indigo-100 mb-6 max-w-sm">Explora las estadísticas detalladas y descubre qué preguntas están desafiando más a tus docentes.</p>
                            <Link href="/dashboard/admin/stats" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105">
                                Ver Reportes Completos
                                <BarChart3 size={18} />
                            </Link>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                            <BarChart3 size={200} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group mt-6">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Gestión de Usuarios</h3>
                            <p className="text-emerald-100 mb-6 max-w-sm">Administra las cuentas de docentes y administradores, edita sus perfiles o elimínalos del sistema.</p>
                            <Link href="/dashboard/admin/users" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105">
                                Gestionar Usuarios
                                <Users size={18} />
                            </Link>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                            <Users size={200} />
                        </div>
                    </div>
                </div>

                {/* System Health / Status */}
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        Estado del Sistema
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Conectividad Backend</span>
                                <span className="text-emerald-500 font-bold">Online</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Uso de Almacenamiento</span>
                                <span className="text-slate-900 font-bold">12%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[12%]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pt-2">
                            Todos los módulos están operando correctamente según los últimos reportes de salud del servidor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
