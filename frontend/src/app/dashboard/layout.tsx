'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    LogOut,
    User,
    Settings,
    HelpCircle
} from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!mounted || !user) return null;

    const adminMenu = [
        { name: 'Resumen', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Exámenes', icon: BookOpen, href: '/dashboard/admin/exams' },
        { name: 'Competencias', icon: Settings, href: '/dashboard/admin/competencies' },
        { name: 'Estadísticas', icon: BarChart3, href: '/dashboard/admin/stats' },
    ];

    const docenteMenu = [
        { name: 'Mis Simulaciones', icon: LayoutDashboard, href: '/dashboard/docente' },
        { name: 'Explorar Exámenes', icon: BookOpen, href: '/dashboard/docente/explore' },
        { name: 'Resultados', icon: BarChart3, href: '/dashboard/docente/results' },
    ];

    const menuItems = user.role === 'admin' ? adminMenu : docenteMenu;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`bg-slate-900 text-white w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'}`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg ring-1 ring-slate-800">
                        <img src="/logo.png" alt="SimLab Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">SimLab</h1>
                        <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">{user.role}</p>
                    </div>
                </div>

                <nav className="mt-6 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 px-5'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs ring-1 ring-slate-600">
                            <User size={16} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors group"
                    >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <LayoutDashboard size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <HelpCircle size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
