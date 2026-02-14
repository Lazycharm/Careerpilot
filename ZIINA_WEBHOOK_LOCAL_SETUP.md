# Setting Up Ziina Webhook for Local Development

Ziina requires webhooks to be publicly accessible HTTPS URLs. Since `localhost` is not accepted, you need to use a tunneling service like **ngrok** for local development.

## Quick Setup with ngrok

### Step 1: Install ngrok

Download from: https://ngrok.com/download

Or use package manager:
```powershell
# Using Chocolatey (if installed)
choco install ngrok

# Or download directly from ngrok.com
```

### Step 2: Start Your Development Server

```powershell
npm run dev
```

Your app should be running on `http://localhost:3000`

### Step 3: Start ngrok

In a **new PowerShell window**, run:

```powershell
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

### Step 4: Copy the HTTPS URL

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 5: Register Webhook

**Option A: Using the script**

```powershell
$env:ZIINA_WEBHOOK_URL="https://abc123.ngrok-free.app/api/payments/webhook"
npx tsx scripts/setup-ziina-webhook.ts
```

**Option B: Using Admin Panel**

1. Go to `/admin/settings`
2. Find "Ziina Webhook Configuration"
3. Manually enter the webhook URL: `https://abc123.ngrok-free.app/api/payments/webhook`
4. Click "Register Webhook with Ziina"

### Step 6: Add Secret to .env.local

After registration, add the generated secret:

```env
ZIINA_WEBHOOK_SECRET="the-generated-secret"
```

## Important Notes

⚠️ **ngrok URLs change each time you restart ngrok** (unless you have a paid plan with a static URL)

- Free ngrok URLs expire after 2 hours
- Each restart gives you a new URL
- You'll need to re-register the webhook if the URL changes

## Alternative: Use Production URL

If you have a production deployment:

1. Deploy your app to Vercel/Netlify/etc.
2. Use your production URL for the webhook
3. Webhook will work for both local and production payments

## Testing Webhook Locally

1. Keep ngrok running in one terminal
2. Keep your dev server running in another terminal
3. Make a test payment
4. Check your server logs for webhook events

## Production Setup

For production, use your actual domain:

```env
ZIINA_WEBHOOK_URL="https://yourdomain.com/api/payments/webhook"
```

No ngrok needed for production!

## Troubleshooting

### "url must be a URL address" error

- ✅ Use HTTPS (not HTTP)
- ✅ Use a publicly accessible URL (not localhost)
- ✅ Ensure the URL is reachable from the internet

### Webhook not receiving events

1. Verify ngrok is still running
2. Check ngrok URL hasn't changed
3. Verify webhook secret matches
4. Check server logs for incoming requests

### ngrok URL expired

Simply restart ngrok and re-register the webhook with the new URL.

