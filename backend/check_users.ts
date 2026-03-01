import { prisma } from './src/lib/prisma';

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                name: true
            }
        });
        console.log('USERS_FOUND:' + JSON.stringify(users));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
