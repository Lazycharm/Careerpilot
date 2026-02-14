# 🏗️ Architecture Proposal: AI-Powered Career Platform

## 📋 Tech Stack Proposal

### **Frontend**
- **Framework**: Next.js 14 (App Router) with TypeScript
  - Server-side rendering for SEO
  - API routes for backend logic
  - Built-in optimization
- **UI Framework**: Tailwind CSS + shadcn/ui
  - Modern, customizable components
  - Premium design system
  - Mobile-first responsive
- **State Management**: Zustand (lightweight, simple)
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: jsPDF + html2canvas (client-side) OR Puppeteer (server-side)
- **Animations**: Framer Motion

### **Backend**
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
  - Relational data for users, resumes, interviews
  - JSON fields for flexible resume data
- **Authentication**: NextAuth.js (Auth.js)
  - Email/password
  - Session management
  - Role-based access control
- **File Storage**: Local filesystem (can upgrade to S3/Cloudinary later)
- **Email**: Resend or Nodemailer (for password reset)

### **AI Integration**
- **Primary**: OpenAI API (GPT-4)
  - Resume optimization
  - Cover letter generation
  - Interview question generation
  - Answer analysis
- **Fallback**: Consider Anthropic Claude as alternative

### **Payment/Subscription**
- **Option 1**: Stripe (recommended for production)
- **Option 2**: PayPal
- **Option 3**: Manual payment (admin marks as paid)
- **Initial**: Admin toggle to enable/disable, manual payment tracking

### **Deployment**
- **Frontend/Backend**: Vercel (Next.js optimized)
- **Database**: Supabase, Neon, or Railway PostgreSQL
- **Environment**: `.env.local` for configuration

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │   Auth   │  │ Dashboard│  │  Admin  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              NEXT.JS APPLICATION                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │           API Routes (Server-side)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │   Auth   │  │  Resume  │  │   Interview  │  │  │
│  │  │   API    │  │   API    │  │     API      │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │   AI     │  │  Admin   │  │ Subscription│  │  │
│  │  │   API    │  │   API    │  │     API     │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
│  PostgreSQL  │ │  OpenAI   │ │  File      │
│   Database   │ │    API    │ │  Storage   │
└──────────────┘ └───────────┘ └────────────┘
```

---

## 🗄️ Database Schema

### **Users Table**
```sql
id              UUID (Primary Key)
email           String (Unique)
password        String (Hashed)
name            String
role            Enum ('user', 'admin')
emailVerified   DateTime?
createdAt       DateTime
updatedAt       DateTime
```

### **UserProfiles Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
phone           String?
location        String?
industry        String?
experienceLevel String? ('fresh', 'junior', 'mid', 'senior')
createdAt       DateTime
updatedAt       DateTime
```

### **Resumes Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
templateId      UUID (Foreign Key → ResumeTemplates)
title           String (e.g., "Software Engineer Resume")
data            JSONB (stores all resume sections)
status          Enum ('draft', 'completed')
wordCount       Int
createdAt       DateTime
updatedAt       DateTime
```

### **ResumeTemplates Table**
```sql
id              UUID (Primary Key)
name            String
previewImage    String (URL)
isActive        Boolean
createdAt       DateTime
updatedAt       DateTime
```

### **CoverLetters Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
jobTitle        String
industry        String
content         Text
aiGenerated     Boolean
createdAt       DateTime
updatedAt       DateTime
```

### **InterviewSessions Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
jobTitle        String
industry        String
experienceLevel String
status          Enum ('in_progress', 'completed')
readinessScore  Int? (0-100)
createdAt       DateTime
updatedAt       DateTime
```

### **InterviewQuestions Table**
```sql
id              UUID (Primary Key)
sessionId       UUID (Foreign Key → InterviewSessions)
question        Text
type            Enum ('general', 'technical', 'behavioral')
aiGenerated     Boolean
createdAt       DateTime
```

### **InterviewAnswers Table**
```sql
id              UUID (Primary Key)
questionId      UUID (Foreign Key → InterviewQuestions)
answer          Text
score           Int? (0-100)
feedback        Text?
aiAnalyzed      Boolean
createdAt       DateTime
updatedAt       DateTime
```

### **Downloads Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
resumeId        UUID (Foreign Key → Resumes)
type            Enum ('resume', 'cover_letter')
paid            Boolean
createdAt       DateTime
```

### **Subscriptions Table**
```sql
id              UUID (Primary Key)
userId          UUID (Foreign Key → Users)
status          Enum ('active', 'expired', 'cancelled')
startDate       DateTime
endDate         DateTime?
paymentMethod   String?
createdAt       DateTime
updatedAt       DateTime
```

### **Settings Table (Admin Configuration)**
```sql
id              UUID (Primary Key)
key             String (Unique) (e.g., 'subscription_enabled', 'resume_download_price')
value           String (JSON or String)
description     String
updatedBy       UUID (Foreign Key → Users)
updatedAt       DateTime
```

**Example Settings Keys:**
- `subscription_enabled` → `"true"` or `"false"`
- `resume_download_price` → `"50"` (AED)
- `cover_letter_price` → `"30"`
- `ai_features_enabled` → `"true"`
- `free_downloads_enabled` → `"false"`
- `interview_prep_enabled` → `"true"`

---

## 📄 Pages & Routes

### **Public Routes (No Auth)**
```
/                           → Landing Page
/auth/login                 → Login Page
/auth/register              → Registration Page
/auth/forgot-password       → Forgot Password
/auth/reset-password        → Reset Password (with token)
/privacy                    → Privacy Policy
/terms                      → Terms of Service
```

### **User Routes (Auth Required)**
```
/dashboard                  → User Dashboard
/resume                     → Resume Builder (list)
/resume/new                 → Create New Resume
/resume/[id]                → Edit Resume
/resume/[id]/preview        → Preview Resume
/cover-letter               → Cover Letter Builder
/cover-letter/new           → Create Cover Letter
/cover-letter/[id]          → Edit Cover Letter
/interview                  → Interview Prep Dashboard
/interview/new              → Start New Interview Session
/interview/[id]             → Interview Session Details
/interview/[id]/questions   → Answer Questions
/interview/[id]/results     → View Results & Score
/subscription               → Subscription Status
/downloads                  → Download History
/profile                    → User Profile Settings
```

### **Admin Routes (Admin Only)**
```
/admin                      → Admin Dashboard
/admin/users                → User Management
/admin/resumes              → View All Resumes
/admin/templates            → Resume Templates Manager
/admin/settings             → Global Settings (Toggle Features, Prices)
/admin/analytics            → Interview Readiness Analytics
/admin/subscriptions        → Subscription Management
```

### **API Routes**
```
/api/auth/[...nextauth]     → NextAuth endpoints
/api/users                  → User CRUD
/api/resumes                → Resume CRUD
/api/resumes/[id]/export    → PDF Export
/api/cover-letters          → Cover Letter CRUD
/api/interviews             → Interview CRUD
/api/interviews/[id]/analyze → AI Analysis
/api/ai/resume-optimize     → AI Resume Optimization
/api/ai/cover-letter        → AI Cover Letter Generation
/api/ai/interview-questions → AI Question Generation
/api/admin/settings         → Settings CRUD
/api/admin/analytics        → Analytics Data
/api/downloads              → Download Tracking
/api/subscriptions          → Subscription Management
```

---

## 📁 Proposed Folder Structure

```
career-platform/
├── .env.local                 # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── images/
│   │   └── templates/         # Resume template previews
│   └── fonts/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── resume/
│   │   │   ├── cover-letter/
│   │   │   ├── interview/
│   │   │   └── profile/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   └── api/               # API routes
│   │       ├── auth/
│   │       ├── resumes/
│   │       ├── cover-letters/
│   │       ├── interviews/
│   │       ├── ai/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── landing/           # Landing page components
│   │   ├── resume/            # Resume builder components
│   │   ├── interview/         # Interview prep components
│   │   ├── admin/             # Admin panel components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── ai.ts              # AI service functions
│   │   ├── pdf.ts             # PDF generation
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
└── README.md
```

---

## 🔐 Security Considerations

1. **Authentication**: NextAuth.js with secure session management
2. **Password**: bcrypt hashing
3. **API Routes**: Role-based middleware
4. **File Uploads**: Validation and sanitization
5. **AI API Keys**: Server-side only, never exposed
6. **Rate Limiting**: Implement for AI endpoints
7. **CORS**: Configured for production domain

---

## 🎨 UI/UX Design Approach

1. **Design System**: Consistent color palette, typography, spacing
2. **Components**: Reusable, accessible components
3. **Loading States**: Skeleton loaders, progress indicators
4. **Error Handling**: User-friendly error messages
5. **Responsive**: Mobile-first, breakpoints: sm, md, lg, xl
6. **Animations**: Subtle, professional transitions
7. **Accessibility**: ARIA labels, keyboard navigation

---

## 🚀 Development Phases

### **Phase 1: Foundation**
- Project setup
- Database schema
- Authentication
- Basic routing

### **Phase 2: Landing & Auth**
- Landing page
- Login/Register
- Password reset

### **Phase 3: User Dashboard**
- Dashboard layout
- Progress tracking
- Navigation

### **Phase 4: Resume Builder**
- Templates
- Form builder
- Live preview
- PDF export

### **Phase 5: AI Features**
- Resume optimization
- Cover letter generation
- Integration with OpenAI

### **Phase 6: Interview Prep**
- Question generation
- Answer submission
- AI analysis
- Scoring system

### **Phase 7: Admin Panel**
- Settings management
- User management
- Analytics

### **Phase 8: Subscription**
- Payment integration
- Access control
- Download restrictions

---

## ❓ Questions for Confirmation

1. **Tech Stack**: Do you approve Next.js + PostgreSQL + OpenAI?
2. **Payment**: Start with manual payment tracking or integrate Stripe immediately?
3. **PDF Generation**: Client-side (jsPDF) or server-side (Puppeteer)?
4. **Hosting**: Vercel for deployment?
5. **Database**: Any preference for PostgreSQL provider (Supabase, Neon, Railway)?

---

## ✅ Next Steps

**Once you confirm:**
1. Initialize Next.js project
2. Set up Prisma with PostgreSQL
3. Create database schema
4. Set up authentication
5. Build landing page
6. Continue module by module

**Please review and confirm the tech stack and architecture before I proceed with code.**

