# Quick Ziina Webhook Setup Guide

## Windows PowerShell Setup

### Option 1: Using .env.local (Recommended)

1. **Make sure your `.env.local` file exists** in the project root with:
   ```env
   ZIINA_API_KEY="your-ziina-api-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Run the script**:
   ```powershell
   npx tsx scripts/setup-ziina-webhook.ts
   ```

### Option 2: Set Environment Variable in PowerShell

If the script still doesn't find your key, set it directly in PowerShell:

```powershell
# Set the environment variable for this session
$env:ZIINA_API_KEY="your-ziina-api-key"
$env:NEXTAUTH_URL="http://localhost:3000"

# Then run the script
npx tsx scripts/setup-ziina-webhook.ts
```

### Option 3: One-Line Command

```powershell
$env:ZIINA_API_KEY="your-key"; $env:NEXTAUTH_URL="http://localhost:3000"; npx tsx scripts/setup-ziina-webhook.ts
```

## Verify .env.local File

Make sure your `.env.local` file:
- ✅ Is in the project root (same folder as `package.json`)
- ✅ Has the correct format: `ZIINA_API_KEY="your-key"` (with quotes)
- ✅ Has no extra spaces or special characters
- ✅ Is saved (not just open in editor)

## Troubleshooting

### Still not working?

1. **Check file location**:
   ```powershell
   Get-Content .env.local
   ```
   This should show your environment variables.

2. **Verify the key is there**:
   ```powershell
   Select-String -Path .env.local -Pattern "ZIINA_API_KEY"
   ```

3. **Try manual method**:
   Use the admin panel at `/admin/settings` → "Ziina Webhook Configuration" → "Register Webhook with Ziina"

## After Setup

Once the webhook is registered, you'll get a secret. Add it to `.env.local`:

```env
ZIINA_WEBHOOK_SECRET="the-generated-secret"
```

Then restart your development server.

