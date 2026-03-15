'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Target,
    Trash2,
    ArrowLeft,
    Save
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Competency {
    id: string;
    name: string;
    description: string;
}

export default function CompetenciesPage() {
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchCompetencies();
    }, []);

    const fetchCompetencies = async () => {
        try {
            const res = await api.get('admin/competencies');
            setCompetencies(res.data);
        } catch (error) {
            console.error('Error fetching competencies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editId) {
                await api.put(`admin/competencies/${editId}`, { name, description });
                alert('Competencia actualizada');
            } else {
                await api.post('admin/competencies', { name, description });
                alert('Competencia creada');
            }
            // Reset
            handleCancel();
            fetchCompetencies();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar competencia');
        }
    };

    const handleEdit = (comp: Competency) => {
        setName(comp.name);
        setDescription(comp.description || '');
        setEditId(comp.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro? Las preguntas asociadas podrían impedir la eliminación.')) return;
        try {
            await api.delete(`admin/competencies/${id}`);
            fetchCompetencies();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar');
        }
    };

    const handleCancel = () => {
        setName('');
        setDescription('');
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin"
                        className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Competencias</h1>
                        <p className="text-slate-500 mt-1">Define las áreas de conocimiento para clasificar las preguntas.</p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        <Plus size={20} />
                        Nueva Competencia
                    </button>
                )}
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl"
                >
                    <h2 className="text-xl font-bold mb-6 text-slate-900">
                        {isEditing ? 'Editar Competencia' : 'Nueva Competencia'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre de la Competencia</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                    placeholder="Ej: Análisis Clínico"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción (Opcional)</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                                    rows={3}
                                    placeholder="De qué trata esta competencia..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={handleCancel} className="px-6 py-3 text-slate-400 font-bold">Cancelar</button>
                            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                <Save size={18} /> {isEditing ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competencies.map((comp, idx) => (
                    <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all relative"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Target size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{comp.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{comp.description || 'Sin descripción.'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(comp)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Plus size={18} className="rotate-45" /> {/* Usando Plus rotado para editar o mejor Trash/Edit si están disponibles */}
                                <span className="text-xs font-bold ml-1">Editar</span>
                            </button>
                            <button
                                onClick={() => handleDelete(comp.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                                <span className="text-xs font-bold ml-1">Eliminar</span>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {competencies.length === 0 && !showForm && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Target size={48} className="text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No hay competencias definidas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
