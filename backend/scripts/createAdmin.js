require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración del Pool y el Adaptador para PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Instancia de PrismaClient usando el adaptador
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Ajustado a los campos de tu schema.prisma (User -> name, email, password_hash, role)
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
        await pool.end(); // Importante cerrar el pool de conexiones
    }
}

main();
