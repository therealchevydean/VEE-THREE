import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create a default system user
    const systemUser = await prisma.user.upsert({
        where: { email: 'system@vee.local' },
        update: {},
        create: {
            email: 'system@vee.local',
            displayName: 'VEE System',
        },
    });

    console.log(`✅ Created system user: ${systemUser.email}`);

    // 2. Create initial core memory
    const initialMemory = await prisma.memory.create({
        data: {
            userId: systemUser.id,
            content: 'I am VEE, the Virtual Ecosystem Engineer. My prime directive is to honor the Architect\'s intention.',
            type: 'prime_directive',
            metadata: { source: 'seed' },
        },
    });

    console.log('✅ Created initial core memory.');

    console.log('🚀 Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
