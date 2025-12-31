# VEE Data Migration Guide

## Overview
VEE is transitioning from local JSON storage to a PostgreSQL Database with Vector Memory.
Currently, memories are stored in:
- `core_memory.json` (Legacy)
- `localStorage` (Simulated Memory Service)

Target Database: PostgreSQL (`vee_db`)

## Migration Steps (Future)
*Perform these steps once a live `DATABASE_URL` is configured.*

### 1. Extract Legacy Data
Create a script to read `core_memory.json` from the legacy project or export from `localStorage` in the browser dev tools.

### 2. Run Migration Script
Create a node script `backend/scripts/migrateMemories.ts` (Example):

```typescript
import { commit } from '../src/services/memoryService'; // Need backend version of this
// or interact directly with DB

const data =  require('./core_memory.json');

async function migrate() {
    for (const item of data) {
        // Send to Backend API
        await fetch('http://localhost:3001/api/memory', {
            method: 'POST',
            body: JSON.stringify({ content: item.text })
        });
        console.log(`Migrated: ${item.id}`);
    }
}
migrate();
```

### 3. Verify
Use the VEE Search tool (Chat Interface) to ask questions stored in the old memory.

### Execution Engine Database Schema

The following tables were added to `vee_db`:

### `jobs`
- `id`: UUID (Primary Key)
- `pipeline_type`: ENUM ('SOCIAL_POST', 'LISTING', 'TOKIN_FRANKS_CARD', 'EBOOK_SECTION')
- `input_summary`: TEXT
- `draft_output`: JSONB
- `status`: ENUM ('INBOX', 'DRAFT', 'READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED')
- `created_at`, `updated_at`: TIMESTAMP

### `real_world_tasks`
- `id`: UUID (Primary Key)
- `related_job_id`: UUID (FK to jobs)
- `description`: TEXT
- `category`: ENUM ('PACKAGING', 'SHIPPING', 'BURN_CYCLE', 'PREP', 'REMINDER')
- `status`: ENUM ('TODO', 'IN_PROGRESS', 'DONE')

## Running Migrations

Execute the engine migration script:
```bash
npm run test:engine  # This initializes schema if missing or run scripts/init-engine-db.ts
```

## Archive Migration
Files in the Archive currently reside in `localStorage` (base64).
You may want to upload these to a real GCS bucket or store them in the Database `inventory`.
