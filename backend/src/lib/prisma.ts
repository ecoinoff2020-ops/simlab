import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Creamos la instancia de Prisma directamente
// Prisma usa la variable DATABASE_URL del .env por defecto
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
