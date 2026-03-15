'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Users as UsersIcon,
    ArrowLeft,
    Save,
    UserCircle,
    Mail,
    Shield,
    Lock,
    Edit2,
    Trash2
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('docente');

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editId) {
                const payload: any = { name, email, role };
                if (password) payload.password = password; // Only update if typed
                await api.put(`admin/users/${editId}`, payload);
                alert('Usuario actualizado exitosamente');
            } else {
                await api.post('auth/register', { name, email, password, role });
                alert('Usuario creado exitosamente');
            }
            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setRole('docente');
            setShowForm(false);
            setIsEditing(false);
            setEditId(null);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleEditClick = (user: User) => {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPassword('');
        setEditId(user.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
        try {
            await api.delete(`admin/users/${userId}`);
            alert('Usuario eliminado exitosamente');
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const handleCancelForm = () => {
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('docente');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin"
                        className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-slate-500 mt-1">Crea y administra cuentas de docentes y administradores.</p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                )}
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <UserCircle size={24} className="text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <UserCircle size={14} /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium"
                                    placeholder="Ej: Dr. Juan Pérez"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail size={14} /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium"
                                    placeholder="correo@institucion.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={14} /> {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                                </label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    minLength={6}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium"
                                    placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14} /> Rol del Sistema
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                                >
                                    <option value="docente">Docente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={handleCancelForm} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-colors">
                                <Save size={18} /> {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuario</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Rol</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha de Registro</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={user.id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <UsersIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{user.name}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-indigo-100 text-indigo-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Docente'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors group"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}

                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-slate-400">
                                        <UsersIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="font-medium">No hay usuarios registrados</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
