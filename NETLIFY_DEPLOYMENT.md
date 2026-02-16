# Netlify Deployment Guide

This guide will help you deploy CareerPilot to Netlify.

## Prerequisites

1. A Netlify account
2. GitHub repository connected to Netlify
3. Environment variables configured

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Select the repository: `Lazycharm/Careerpilot`

### 2. Configure Build Settings

Netlify will auto-detect Next.js settings from `netlify.toml`:
- **Build command**: `npm run db:generate && npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 (specified in `.nvmrc`)

### 3. Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-site.netlify.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Ziina Payment Gateway
ZIINA_API_KEY="your-ziina-bearer-token"
ZIINA_WEBHOOK_URL="https://your-site.netlify.app/api/payments/webhook"
ZIINA_WEBHOOK_SECRET="your-webhook-secret"

# Optional: Admin Setup
ADMIN_EMAIL="admin@careerplatform.com"
ADMIN_PASSWORD="admin123"
```

### 4. Install Netlify Next.js Plugin

The plugin is specified in `netlify.toml` and will be installed automatically during build.

If you need to install manually:
```bash
npm install --save-dev @netlify/plugin-nextjs
```

### 5. Deploy

1. Push your code to GitHub
2. Netlify will automatically trigger a build
3. Monitor the build logs in Netlify Dashboard

### 6. Post-Deployment Setup

After successful deployment:

1. **Run Database Migrations**:
   ```bash
   npm run db:push
   ```
   Or use Netlify CLI:
   ```bash
   netlify dev
   ```

2. **Create Admin User**:
   - Use the setup script via Netlify Functions
   - Or manually create via Prisma Studio
   - Or use the admin panel after first user registration

3. **Configure Settings**:
   - Visit `https://your-site.netlify.app/admin/settings`
   - Configure platform settings

### 7. Update Webhook URLs

After deployment, update your Ziina webhook URL:
- Go to Ziina Dashboard
- Update webhook URL to: `https://your-site.netlify.app/api/payments/webhook`

## Troubleshooting

### Build Fails

- Check Node version (should be 18)
- Verify all environment variables are set
- Check build logs for specific errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure Supabase allows connections from Netlify IPs
- Check if SSL is required in connection string

### API Routes Not Working

- Ensure `@netlify/plugin-nextjs` is installed
- Check that routes are in `app/api/` directory
- Verify environment variables are set

### Prisma Client Generation

- The build command includes `npm run db:generate`
- If issues occur, check Prisma schema is valid
- Ensure `DATABASE_URL` is accessible during build

## Additional Notes

- Netlify Functions have a 10-second timeout by default
- For longer operations, consider using background functions
- Puppeteer may require additional configuration on Netlify
- Consider using a service like Browserless for PDF generation in production

## Support

For issues specific to Netlify deployment, check:
- [Netlify Next.js Plugin Docs](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Support](https://www.netlify.com/support/)
