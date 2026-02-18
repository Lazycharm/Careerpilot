# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Ziina Payment Gateway
# Get your access token from https://ziina.com/business/connect
ZIINA_API_KEY="your-ziina-bearer-token"
ZIINA_WEBHOOK_URL="https://yourdomain.com/api/payments/webhook"
ZIINA_WEBHOOK_SECRET="generated-by-setup-script"

# Optional: Admin Setup
ADMIN_EMAIL="admin@careerplatform.com"
ADMIN_PASSWORD="admin123"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Database Schema to Supabase
```bash
npm run db:push
```

### 5. Run Setup Script (Optional)
This will create default templates and admin user:
```bash
npm run setup
```

Or manually:
- Create an admin user via Prisma Studio: `npm run db:studio`
- Visit `/admin/settings` to configure platform settings

### 6. Start Development Server
```bash
npm run dev
```

### 7. Access the Application
- Landing Page: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Register: http://localhost:3000/auth/register
- Dashboard: http://localhost:3000/dashboard (after login)
- Admin Panel: http://localhost:3000/admin (admin only)

## Creating Your First Admin User

### Option 1: Via Setup Script
```bash
ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="yourpassword" npm run setup
```

### Option 2: Via Prisma Studio
1. Run `npm run db:studio`
2. Navigate to User model
3. Create a new user with:
   - Email: your email
   - Password: hashed with bcrypt (use online tool or script)
   - Role: `admin`

### Option 3: Via API (after first user registration)
1. Register a regular user
2. Manually update role to `admin` in database
3. Or use Prisma Studio to change role

### Local vs production (admin login)
- **Production** uses the database configured in Netlify (or your host) env vars.
- **Local** uses the database in your `.env` / `.env.local` (e.g. a different DB or Supabase project).
- If admin login works on the live site but not locally, your local app is using a different database where that admin user does not exist. Create an admin locally with the setup script: `ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" npm run setup`

## Initial Configuration

After logging in as admin:

1. Visit `/admin/settings`
2. Configure:
   - **Subscription Enabled**: Toggle subscription system
   - **Resume Download Price**: Set price in AED
   - **Cover Letter Price**: Set price in AED
   - **AI Features Enabled**: Toggle AI features
   - **Free Downloads Enabled**: Allow free downloads for all
   - **Interview Prep Enabled**: Toggle interview preparation

## Database Schema

The platform uses the following main models:
- `User` - User accounts (user/admin roles)
- `Resume` - User resumes with JSONB data
- `ResumeTemplate` - Available resume templates
- `CoverLetter` - Generated cover letters
- `InterviewSession` - Interview preparation sessions
- `InterviewQuestion` & `InterviewAnswer` - Q&A with AI analysis
- `Subscription` - User subscriptions
- `Setting` - Admin-configurable settings
- `Download` - Download history

## Troubleshooting

### Database Connection Issues
- Verify your Supabase connection string
- Check if your Supabase project is active
- Ensure IP is whitelisted if using connection pooling

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

### AI Features Not Working
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota/credits
- Review API logs for errors

### Payment Integration
- Verify Ziina credentials are correct
- Check Ziina API documentation for endpoint changes
- Test in sandbox mode first

## Next Steps

1. **Customize Templates**: Add your own resume templates
2. **Configure Pricing**: Set up subscription pricing
3. **Test Features**: Test all user flows
4. **Deploy**: Deploy to Vercel or your preferred platform

## Production Deployment

1. Set all environment variables in your hosting platform
2. Run `npm run build` to test production build
3. Run `npm run db:push` to ensure database is up to date
4. Deploy to Vercel (recommended for Next.js)

---

For more details, see the main [README.md](./README.md)

