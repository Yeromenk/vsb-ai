import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('Connected to the database (PostgreSQL)');
        return prisma;
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1);
    }
}

export { prisma, connectToDatabase };