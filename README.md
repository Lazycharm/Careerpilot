# Career Platform - AI-Powered Resume & Career Preparation

A professional AI-powered Resume & Career Preparation platform tailored for UAE job seekers.

## 🚀 Features

- **Resume Builder**: Create ATS-optimized resumes with multiple templates
- **AI-Powered Optimization**: Enhance resumes for UAE ATS systems
- **Cover Letter Generator**: AI-generated cover letters tailored to UAE work culture
- **Interview Preparation**: Practice with AI-generated questions and get readiness scores
- **Admin Panel**: Full control over settings, pricing, and features
- **Subscription System**: Ziina payment integration for monetization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI API (GPT-4)
- **Payment**: Ziina Payment Gateway
- **PDF Generation**: jsPDF + html2canvas

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ZIINA_API_KEY`, `ZIINA_API_SECRET`, `ZIINA_MERCHANT_ID`: Ziina credentials

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create an admin user** (run this in a script or manually via Prisma Studio)
   ```bash
   npx prisma studio
   ```
   Or create via API after first user registration

6. **Initialize default settings**
   - After creating an admin user, visit `/admin/settings` to configure platform settings

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
career-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard pages
│   ├── (admin)/           # Admin panel pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── landing/           # Landing page components
│   ├── resume/            # Resume builder components
│   └── admin/             # Admin components
├── lib/                   # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth config
│   ├── ai.ts              # AI service functions
│   ├── ziina.ts           # Ziina payment integration
│   └── settings.ts        # Settings management
├── prisma/                # Database schema
└── types/                 # TypeScript types
```

## 🔐 Default Admin Setup

After creating your first admin user, you can:

1. Log in as admin
2. Visit `/admin/settings`
3. Configure:
   - Subscription enabled/disabled
   - Pricing (resume download, cover letter)
   - Feature toggles (AI features, interview prep, free downloads)

## 📝 Database Schema

The platform uses the following main models:
- `User` - User accounts with roles (user/admin)
- `Resume` - User resumes with JSONB data
- `ResumeTemplate` - Available resume templates
- `CoverLetter` - Generated cover letters
- `InterviewSession` - Interview preparation sessions
- `InterviewQuestion` & `InterviewAnswer` - Q&A with AI analysis
- `Subscription` - User subscriptions
- `Setting` - Admin-configurable settings
- `Download` - Download history

## 🔧 Configuration

All platform settings are configurable via the admin panel:
- Subscription system (enable/disable)
- Pricing for downloads
- AI features toggle
- Free downloads toggle
- Interview prep toggle

## 📄 API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/resumes/*` - Resume CRUD and export
- `/api/cover-letters/*` - Cover letter generation
- `/api/interviews/*` - Interview prep and analysis
- `/api/ai/*` - AI-powered features
- `/api/admin/*` - Admin management
- `/api/payments/*` - Ziina payment processing

## 🚢 Deployment

1. **Deploy to Vercel** (recommended for Next.js)
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Run database migrations**
   ```bash
   npx prisma db push
   ```

4. **Create admin user** and configure settings

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🤝 Contributing

This is a production-ready platform. Follow best practices:
- Write clean, maintainable code
- Add proper error handling
- Test all features before deployment
- Keep security in mind

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for UAE job seekers

