'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
      <main className="max-w-4xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center flex-col items-center gap-4">
          <div className="w-24 h-24 p-3 bg-white rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 flex items-center justify-center border border-slate-100">
            <img src="/logo.png" alt="SimLab Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-indigo-600 tracking-wider">SimLab</h1>
        </div>

        <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          {user ? `¡Bienvenido de nuevo, ${user.name}!` : "Gestión de Simulaciones Académicas"}
        </h2>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {user
            ? `Has iniciado sesión como ${user.role}. Tienes acceso completo a tus herramientas de simulación.`
            : "Una plataforma potente para docentes y administradores para crear, gestionar y supervisar entornos de simulación educativa."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              Cerrar Sesión
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 font-semibold rounded-lg shadow-sm hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1"
              >
                Crear Cuenta
              </Link>
            </>
          )}
        </div>
      </main>

      <footer className="mt-20 text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} SimLab Platform. Todos los derechos reservados.
      </footer>
    </div>
  );
}
