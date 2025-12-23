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

## Archive Migration
Files in the Archive currently reside in `localStorage` (base64).
You may want to upload these to a real GCS bucket or store them in the Database `inventory`.
