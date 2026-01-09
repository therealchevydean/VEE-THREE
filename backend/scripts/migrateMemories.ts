import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function migrate() {
    const legacyPath = path.join(process.cwd(), 'core_memory.json');

    if (!fs.existsSync(legacyPath)) {
        console.log('⚠️ core_memory.json not found. Skipping legacy migration.');
        return;
    }

    const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
    console.log(`🔍 Found ${legacyData.length} entries in core_memory.json`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const item of legacyData) {
        // Idempotency check: check if content already exists for this legacy entry
        // Since legacy doesn't have UUIDs, we check for exact content match or metadata link
        const existing = await prisma.memory.findFirst({
            where: {
                content: item.text,
                metadata: {
                    path: {
                        equals: 'legacy_import'
                    }
                }
            }
        });

        if (existing) {
            skippedCount++;
            continue;
        }

        await prisma.memory.create({
            data: {
                content: item.text,
                type: 'legacy',
                metadata: {
                    import_source: 'core_memory.json',
                    original_timestamp: item.timestamp,
                    legacy_id: item.id
                }
            }
        });
        migratedCount++;
    }

    console.log(`✅ Migration complete: ${migratedCount} migrated, ${skippedCount} skipped.`);
}

migrate()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
