# Developer Utilities

This directory contains developer-only utilities for testing and debugging.

## Ephemeral API Revisions

Switch between PR-specific API deployments and production from the browser console.

### Usage

```javascript
// Switch to PR #123 deployment
ephemeralApi(123)

// Switch back to production
ephemeralApi()
```

### How it works

- **GitHub Actions** automatically builds and deploys each PR to a tagged Cloud Run revision (`pr-###`)
- The production deployment uses the `prod` tag with 100% traffic
- The `ephemeralApi()` function switches traffic between tagged revisions for testing
- When a PR is closed, its revision is automatically cleaned up

### Example workflow

1. Push to PR #42
2. GitHub Actions builds image and deploys as `pr-42` revision (0% traffic)
3. View PR comment with ephemeral API URL
4. In browser console: `ephemeralApi(42)` to switch API traffic to that revision
5. Test PR changes
6. `ephemeralApi()` to switch back to production
7. Merge PR
8. GitHub Actions rebuilds with `latest` tag and routes 100% traffic to it
9. PR is closed → revision `pr-42` is automatically deleted

### API Endpoints

**POST `/api/dev/switch-revision`**

Request:
```json
{
  "revisionTag": "pr-123"  // or "prod"
}
```

Response:
```json
{
  "revision": "pr-123",
  "traffic": {
    "pr-123": 100
  }
}
```

### Security

- DevModule only loads in non-production environments
- Endpoint validates revision tag format (`pr-\d+` or `prod`)
- Requires authentication in production (currently bypassed in dev)

### Notes

- Only works when frontend is deployed on same domain as API (CORS)
- Ephemeral URLs follow pattern: `https://pr-###---gamer-hub-api-us-central1.run.app`
