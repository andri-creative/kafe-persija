import { PrismaClient } from '../generated/prisma/client';
import dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

dotenv.config();

async function checkConnection() {
    console.log('--- Database Connection Check ---');
    console.log(`Host: ${process.env.DATABASE_HOST}`);
    console.log(`User: ${process.env.DATABASE_USER}`);
    console.log(`Database: ${process.env.DATABASE_NAME}`);
    console.log(`Port: ${process.env.DATABASE_PORT}`);
    console.log('---------------------------------');

    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Attempting to connect to database...');
        // We try to run a simple query to verify connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: Database connection established successfully!');
    } catch (error: any) {
        console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Failed to connect to database.');

        if (error.code === 'P1001') {
            console.error('Reason: Cannot reach database server. Check if your MySQL/MariaDB service is running.');
        } else if (error.code === 'P1017') {
            console.error('Reason: Server has closed the connection. Check your networking or timeouts.');
        } else {
            console.error(`Error details: ${error.message}`);
        }

        console.log('\nTip: Check your .env file and ensure the credentials are correct.');
    } finally {
        await prisma.$disconnect();
        console.log('---------------------------------');
    }
}

checkConnection();
