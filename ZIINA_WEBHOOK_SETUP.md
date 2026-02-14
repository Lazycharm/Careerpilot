# Ziina Webhook Setup Guide

This guide explains how to set up Ziina webhooks to receive real-time payment notifications.

## What is a Webhook?

A webhook is a way for Ziina to notify your application when payment events occur (like payment success or failure). This allows your app to automatically activate subscriptions without manual verification.

## Setup Methods

### Method 1: Using the Setup Script (Recommended)

1. **Set your environment variables** in `.env.local`:
   ```env
   ZIINA_API_KEY="your-ziina-api-key"
   NEXTAUTH_URL="https://yourdomain.com"  # or http://localhost:3000 for local
   ```

2. **Run the setup script**:
   ```bash
   npx tsx scripts/setup-ziina-webhook.ts
   ```

3. **Copy the generated secret** to your `.env.local`:
   ```env
   ZIINA_WEBHOOK_SECRET="the-generated-secret-from-script"
   ```

4. **Restart your server** to load the new environment variable.

### Method 2: Using Admin Panel (Coming Soon)

1. Go to `/admin/settings`
2. Find "Ziina Webhook" section
3. Click "Register Webhook"
4. Copy the generated secret to `.env.local`

### Method 3: Manual Registration via API

You can also register the webhook manually using curl or Postman:

```bash
curl -X POST https://api-v2.ziina.com/api/webhook \
  -H "Authorization: Bearer YOUR_ZIINA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/payments/webhook",
    "secret": "your-generated-secret"
  }'
```

## Webhook URL Format

- **Local Development**: `http://localhost:3000/api/payments/webhook`
- **Production**: `https://yourdomain.com/api/payments/webhook`

⚠️ **Important**: For production, your webhook URL must be:
- Publicly accessible (not behind a firewall)
- Using HTTPS (not HTTP)
- Returning 200 status code

## Generating a Webhook Secret

The webhook secret is used to verify that requests are actually from Ziina. You can generate one using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use the setup script which generates it automatically
```

## Environment Variables

Add these to your `.env.local`:

```env
# Required
ZIINA_API_KEY="your-ziina-bearer-token"
ZIINA_WEBHOOK_SECRET="your-generated-secret"

# Optional (defaults to NEXTAUTH_URL + /api/payments/webhook)
ZIINA_WEBHOOK_URL="https://yourdomain.com/api/payments/webhook"
```

## Testing the Webhook

1. **Check webhook endpoint** is accessible:
   ```bash
   curl https://yourdomain.com/api/payments/webhook
   ```

2. **Make a test payment** through your application

3. **Check server logs** for webhook events:
   ```
   Webhook received: { event: 'payment_intent.status.updated', paymentIntentId: '...' }
   Subscription activated: <subscription-id>
   ```

## Webhook Events

Ziina currently sends one event:
- `payment_intent.status.updated` - When payment status changes (completed, failed, etc.)

## Security

The webhook endpoint:
- ✅ Verifies HMAC signature using `ZIINA_WEBHOOK_SECRET`
- ✅ Only processes events from Ziina
- ✅ Handles payment completion and failure
- ✅ Updates subscription status automatically

## Troubleshooting

### Webhook not receiving events

1. **Check webhook URL is correct**:
   - Must be publicly accessible
   - Must use HTTPS in production
   - Must return 200 status

2. **Verify secret matches**:
   - Secret in `.env.local` must match the one registered with Ziina
   - Restart server after adding secret

3. **Check server logs**:
   - Look for "Webhook received" messages
   - Check for signature verification errors

### "Invalid signature" error

- Ensure `ZIINA_WEBHOOK_SECRET` is set correctly
- Secret must match the one registered with Ziina
- Restart server after updating secret

### Webhook not activating subscriptions

- Check database for subscription records
- Verify `ziinaOrderId` matches payment intent ID
- Check server logs for errors

## Production Deployment

When deploying to production:

1. **Update webhook URL** in Ziina dashboard or via API
2. **Set environment variables** in your hosting platform:
   - `ZIINA_API_KEY`
   - `ZIINA_WEBHOOK_SECRET`
   - `ZIINA_WEBHOOK_URL` (optional, defaults to NEXTAUTH_URL)
3. **Test webhook** with a real payment
4. **Monitor logs** for webhook events

## Support

If you encounter issues:
1. Check Ziina API documentation: https://docs.ziina.com
2. Verify your API key has webhook permissions
3. Check server logs for detailed error messages
4. Test webhook endpoint manually with a POST request

