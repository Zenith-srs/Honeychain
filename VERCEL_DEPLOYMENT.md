# Vercel Deployment Configuration

## Important: Environment Variable Setup

The HoneyChain web frontend **requires** an environment variable to connect to the backend API.

### Step 1: Set Environment Variable in Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:

   ```
   Key: VITE_API_URL
   Value: https://honeychain-y8j6.onrender.com
   ```

3. Select **Production**, **Preview**, and **Development** environments
4. Click **Save**

### Step 2: Redeploy

After adding the environment variable, trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

Or use the Vercel dashboard to manually trigger a redeploy.

## How It Works

The React application uses `import.meta.env.VITE_API_URL` to determine the backend API endpoint:

- **Local Development**: Uses `http://127.0.0.1:8000` (from `web/.env`)
- **Production (Vercel)**: Uses the environment variable set in Vercel dashboard

## Vercel Configuration Explained

The `vercel.json` file is now simplified and only handles SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all non-asset routes are handled by React Router, while API calls go directly to the backend URL specified in `VITE_API_URL`.

## Troubleshooting

### API calls fail with CORS errors
- Verify `VITE_API_URL` is set in Vercel
- Check that your Render backend allows Vercel domains in CORS settings
- The backend should have: `allow_origin_regex=r"https://.*\.vercel\.app"`

### Environment variable not working
- Make sure variable name is exactly `VITE_API_URL` (case-sensitive)
- Vite only reads variables prefixed with `VITE_`
- Redeploy after adding environment variables

### Console shows "undefined" for API URL
- Check browser console: `console.log(import.meta.env.VITE_API_URL)`
- If undefined, the environment variable wasn't set during build
- Trigger a new deployment after setting the variable
