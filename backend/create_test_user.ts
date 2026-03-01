import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const password = 'password123';
    const password_hash = await bcrypt.hash(password, 10);

    try {
        // Ensure test user
        await prisma.user.upsert({
            where: { email: 'test@simlab.com' },
            update: { password_hash },
            create: {
                name: 'Usuario de Prueba',
                email: 'test@simlab.com',
                password_hash,
                role: 'docente'
            }
        });

        // Update standard admin
        await prisma.user.upsert({
            where: { email: 'admin@simlab.com' },
            update: { password_hash },
            create: {
                name: 'Admin SimLab',
                email: 'admin@simlab.com',
                password_hash,
                role: 'admin'
            }
        });

        console.log('ALL_USERS_READY');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
