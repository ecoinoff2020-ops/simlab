require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Usar PrismaClient directamente sin el adapter pg
// Prisma maneja la conexión internamente usando DATABASE_URL del .env
const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                name: 'Admin SimLab',
                email: 'admin@simlab.com',
                password_hash: hashedPassword,
                role: 'admin'
            }
        });

        console.log('Admin creado:', admin.email);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('El usuario admin ya existe en la base de datos.');
        } else {
            console.error('Error creando admin:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
