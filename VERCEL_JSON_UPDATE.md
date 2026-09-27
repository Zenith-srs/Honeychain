# Manual Update Required: vercel.json Files

## Action Required

Due to remote schema validation, the following files need to be manually updated:

### 1. Root `vercel.json`

**Location:** `c:\Users\HP\Desktop\honeychain\HoneyChain\vercel.json`

**Replace entire content with:**

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Web `vercel.json`

**Location:** `c:\Users\HP\Desktop\honeychain\HoneyChain\web\vercel.json`

**Replace entire content with:**

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## What Changed

- **Removed:** Hardcoded backend API proxy to `https://honeychain-y8j6.onrender.com`
- **Why:** The React app now uses `VITE_API_URL` environment variable instead
- **Added:** Asset caching headers for better performance

## Important

After making these changes, you **must** set `VITE_API_URL` in Vercel dashboard (see VERCEL_DEPLOYMENT.md for instructions).
