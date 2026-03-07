'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            // Usamos replace para no ensuciar el historial con la página de carga
            if (user.role === 'admin') {
                router.replace('/dashboard/admin');
            } else {
                router.replace('/dashboard/docente');
            }
        } else {
            router.replace('/login');
        }
    }, [router]);

    if (!mounted) return null;

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
}
