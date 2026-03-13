require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({ where: { role: 'admin' } });
        const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET);

        const r = await fetch('http://localhost:4000/api/admin/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                title: 'Examen de Prueba',
                description: 'desc',
                durationMinutes: 60
            })
        });

        console.log('STATUS:', r.status);
        console.log('RESPONSE:', await r.text());
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
