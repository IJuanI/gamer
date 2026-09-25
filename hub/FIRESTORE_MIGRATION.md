# Firestore Migration Guide

## Overview

GamER Hub has been migrated from PostgreSQL (via Prisma ORM) to Google Cloud Firestore for zero-cost operation within GCP's free tier.

## Cost Comparison

- **PostgreSQL (db-f1-micro)**: ~$10/month
- **Firestore (native)**: **$0** (1GB storage, 50k reads/day free)

## Architecture Changes

### Before (PostgreSQL)
```
API (NestJS) → Prisma ORM → PostgreSQL (Cloud SQL)
```

### After (Firestore)
```
API (NestJS) → Firestore Service → Firestore (NoSQL)
```

## Collections Schema

### `users`
```typescript
{
  id: string;              // UUID (document ID)
  email: string;           // Lowercase, unique
  displayName: string;
  avatarUrl?: string;
  role?: string;           // Default: "user"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### `accounts`
```typescript
{
  id: string;              // Auto-generated (document ID)
  accountKey: string;      // Unique: "${provider}_${providerAccountId}"
  provider: string;        // "discord" or "google"
  providerAccountId: string;
  userId: string;          // Reference to users collection
  createdAt: string;       // ISO timestamp
}
```

## Deployment

The Terraform configuration automatically:

1. Creates Firestore database (native type)
2. Grants Cloud Run service account Firestore user role
3. Passes `FIREBASE_PROJECT_ID` to API via environment variable
4. Firebase Admin SDK authenticates using Cloud Run's service account identity

## API Integration

The `FirestoreService` in `apps/api/src/firestore/firestore.service.ts` provides:

```typescript
// Basic operations
findUnique<T>(collection, id): Promise<T | null>
findByField<T>(collection, field, value): Promise<T | null>
create<T>(collection, data): Promise<T>
set<T>(collection, id, data): Promise<T>
delete(collection, id): Promise<void>

// Complex queries
query<T>(collection, where): Promise<T[]>
```

## Environment Variables

### API (.env)
```
FIREBASE_PROJECT_ID=your-gcp-project-id
```

### Terraform (TF_VAR)
```
TF_VAR_gcp_project_id=your-gcp-project-id
```

Firestore will be automatically created with the project ID during `terraform apply`.

## Free Tier Limits

Firestore free tier includes:

- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day
- **Bandwidth**: 20 GB/month

GamER Hub's expected usage (user profiles, OAuth accounts, teams, recruitment posts) should stay well within these limits.

## Features Preserved

All existing features continue to work:
- ✅ Discord OAuth authentication
- ✅ Google OAuth authentication
- ✅ User profile management
- ✅ Team management
- ✅ Recruitment posting
- ✅ Game profile tracking
- ✅ Platform link integration

## Notes for Developers

### Adding New Collections

1. Add collection operations to `FirestoreService`
2. Update service types to reflect Firestore structure
3. Test with Firestore emulator locally:
   ```bash
   firebase emulators:start
   ```

### Queries

Firestore queries use:
- `where(field, operator, value)`
- Supported operators: `==`, `<`, `<=`, `>`, `>=`, `!=`, `array-contains`, `in`, `array-contains-any`

Example:
```typescript
const results = await firestore.query<User>("users", [
  ["role", "==", "admin"],
  ["createdAt", ">", "2024-01-01"]
]);
```

### Performance

Firestore is optimized for:
- Single-document lookups (by ID)
- Simple equality queries
- Range queries on indexed fields

For complex aggregations, consider:
- Implementing them in application logic
- Using Cloud Functions for background jobs
- Cloud Datastore for complex queries (paid)

## Troubleshooting

### "FIREBASE_PROJECT_ID not set"
- Ensure Terraform passes the variable to Cloud Run
- Check Cloud Run service revision environment variables

### "Permission denied" errors
- Verify Cloud Run service account has Firestore user role
- Check IAM bindings in Terraform

### "Collection not found"
- Firestore creates collections on first write
- If empty, collections don't appear in console until data is added

## Migration Path (if reverting)

If you need to return to PostgreSQL:
1. Revert commits that migrated to Firestore
2. Update Terraform to use Cloud SQL module
3. Restore Prisma in API package.json
4. Run `pnpm install` to get Prisma CLI back
5. Re-run migrations

---

**Last Updated**: 2026-09-25
