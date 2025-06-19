const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10); // Ganti 'admin123' dengan password yang diinginkan

    await prisma.pengguna.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            nama: 'admin',
            password: hashedPassword,
            role: 'admin',
            nip: '2311523026',
            telepon: '081393408908',
        },
    });

    console.log('Admin account seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
