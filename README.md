# Course Platform MVP

A complete course platform for solo educators to sell and manage online courses. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Product Vision

To provide solo educators with the simplest, most affordable, and fairest platform to sell their first online course and build a sustainable business, by offering core LMS features and essential sales tools on a transparent, zero-transaction-fee subscription model.

## Features

### For Educators

#### Course & Content Management
- ✅ Create courses with title, description, and pricing
- ✅ Drag-and-drop interface for organizing modules and lessons
- ✅ Upload video, audio, and PDF files (up to 100MB per file)
- ✅ Multiple content types: Video, Audio, PDF, Text, Quiz
- ✅ Drip content scheduling (release lessons on specific days after enrollment)
- ✅ Publish/unpublish courses

#### Monetization & Payments
- ✅ Stripe payment integration
- ✅ One-time purchase pricing
- ✅ Recurring subscription pricing (monthly/annual)
- ✅ Discount codes (percentage and fixed amount)
- ⏳ PayPal payment integration (structure ready)
- ⏳ Direct payment account connection for educators

#### Analytics & Management
- ✅ Dashboard with revenue, student count, and course metrics
- ✅ Student management interface with enrollment tracking
- ✅ Progress monitoring for each student
- ✅ Recent enrollment activity feed

#### Branding (Basic)
- ✅ Clean, professional interface
- ⏳ Custom domain support (UI ready)
- ⏳ Sales page template editor (basic version implemented)

### For Students

- ✅ Browse and purchase courses
- ✅ Secure checkout with Stripe
- ✅ Personal dashboard with enrolled courses
- ✅ Video/audio/PDF course player
- ✅ Track learning progress
- ✅ Course completion tracking
- ✅ Apply discount codes at checkout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **File Upload**: Local filesystem (configurable for cloud storage)
- **UI Components**: Custom components with Lucide icons
- **Drag & Drop**: @dnd-kit

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd course-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/courseplatform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=104857600
```

#### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

#### Get Stripe Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. For webhooks, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Create upload directory

```bash
mkdir -p public/uploads
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
course-platform/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/              # Uploaded files
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication
│   │   │   ├── courses/      # Course management
│   │   │   ├── payments/     # Payment processing
│   │   │   ├── progress/     # Student progress
│   │   │   └── upload/       # File uploads
│   │   ├── auth/             # Auth pages (login, register)
│   │   ├── courses/          # Public course pages
│   │   ├── educator/         # Educator dashboard
│   │   │   ├── courses/      # Course management
│   │   │   ├── dashboard/    # Analytics dashboard
│   │   │   ├── students/     # Student management
│   │   │   └── settings/     # Educator settings
│   │   ├── student/          # Student interface
│   │   │   ├── courses/      # Course player
│   │   │   └── dashboard/    # Student dashboard
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── educator/         # Educator components
│   │   └── student/          # Student components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── prisma.ts         # Prisma client
│   ├── types/
│   │   └── next-auth.d.ts    # TypeScript definitions
│   └── middleware.ts         # Route protection
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

### Core Models

- **User**: Educators and students with role-based access
- **Course**: Course content with pricing and settings
- **Module**: Course sections containing lessons
- **Lesson**: Individual learning units (video, audio, PDF, text, quiz)
- **Quiz**: Multiple-choice assessments
- **Enrollment**: Student course registrations
- **Progress**: Student lesson completion tracking
- **Payment**: Payment transactions
- **DiscountCode**: Promotional codes

## Key Features Implementation

### Authentication & Authorization

- Role-based access control (EDUCATOR, STUDENT, ADMIN)
- Protected routes with middleware
- Session-based authentication with NextAuth.js

### Course Management

- Create and edit courses
- Drag-and-drop module and lesson organization
- Support for multiple content types
- Drip content scheduling for cohort-based learning

### Payment Processing

- Stripe Checkout integration
- Webhook handling for payment confirmation
- Automatic enrollment on successful payment
- Discount code validation and application

### Student Experience

- Course browser and enrollment
- Video/audio/PDF player
- Progress tracking with automatic save
- Completion percentage calculation

### File Uploads

- Secure file upload with size validation
- Support for video, audio, and PDF files
- Files stored in public/uploads (configurable for cloud storage)

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PATCH /api/courses/[courseId]` - Update course

### Modules & Lessons
- `POST /api/courses/[courseId]/modules` - Create module
- `POST /api/courses/[courseId]/modules/reorder` - Reorder modules
- `POST /api/courses/[courseId]/modules/[moduleId]/lessons` - Create lesson
- `POST /api/courses/[courseId]/modules/[moduleId]/lessons/reorder` - Reorder lessons

### Payments
- `POST /api/payments/stripe/checkout` - Create checkout session
- `POST /api/payments/stripe/webhook` - Handle Stripe webhooks

### Progress
- `POST /api/progress` - Update student progress

### Uploads
- `POST /api/upload` - Upload files

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Database Hosting

Recommended providers:
- [Supabase](https://supabase.com) - Free tier includes PostgreSQL
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Full-stack hosting

### File Storage

For production, consider using:
- AWS S3
- Cloudinary
- Vercel Blob Storage

Update the upload API route to use your chosen provider.

## Stripe Webhook Setup (Production)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook signing secret to `.env`

## Environment Variables (Production)

Make sure to set all environment variables in your hosting platform:

```env
DATABASE_URL=<production-database-url>
NEXTAUTH_URL=<production-url>
NEXTAUTH_SECRET=<secure-secret>
STRIPE_SECRET_KEY=<live-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
NEXT_PUBLIC_APP_URL=<production-url>
```

## Default Accounts (Development)

Create educator and student accounts through the registration page at `/auth/register`.

## Roadmap & Future Enhancements

### Phase 1 (Core Features) - ✅ Complete
- Course creation and management
- Video/audio/PDF content support
- Stripe payment integration
- Student dashboard and progress tracking
- Educator analytics

### Phase 2 (Coming Soon)
- PayPal payment integration
- Quiz builder with scoring
- Custom domain support
- Sales page template editor
- Email notifications
- Certificate generation

### Phase 3 (Future)
- Course bundles
- Affiliate program
- Advanced analytics
- Live sessions
- Community features
- Mobile app

## Contributing

This is an MVP project. Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own courses!

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

## Acknowledgments

Built with modern web technologies:
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Stripe for payment infrastructure
- Vercel for hosting platform
- All open-source contributors

---

**Made with ❤️ for educators building their online course business**
