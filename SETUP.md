# Quick Setup Guide

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Stripe account (free test account)
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## 5-Minute Quick Start

### 1. Install Dependencies (2 min)

```bash
npm install
```

### 2. Create Environment File (1 min)

Create `.env` file and add:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/courseplatform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database (1 min)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Development Server (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

## First Steps After Setup

### Create Your First Educator Account

1. Go to http://localhost:3000
2. Click "Start Teaching"
3. Fill in your details
4. Select "Educator" role
5. Register

### Create Your First Course

1. After logging in, you'll see the educator dashboard
2. Click "Create New Course"
3. Enter course title, description, and pricing
4. Click "Create Course"
5. Add modules and lessons using the drag-and-drop interface

### Test as a Student

1. Open an incognito/private browser window
2. Go to http://localhost:3000
3. Click "Start Learning"
4. Create a student account
5. Browse and enroll in courses

## Stripe Test Mode

Use these test cards in Stripe checkout:

| Card Number         | Result  |
|---------------------|---------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any billing ZIP code

## Troubleshooting

### Database Connection Error

```
Error: Can't reach database server
```

**Solution**: Make sure PostgreSQL is running:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start via Services or pgAdmin
```

### Prisma Migration Error

```
Error: Migration failed
```

**Solution**: Reset the database:

```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution**: Kill the process or use a different port:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

### File Upload Not Working

**Solution**: Create uploads directory:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Stripe Webhook Errors in Development

**Solution**: Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Development Tips

### Hot Reload Not Working?

Restart the dev server:
```bash
# Kill and restart
Ctrl+C
npm run dev
```

### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

### View Database with Prisma Studio

```bash
npx prisma studio
```

Opens at: http://localhost:5555

### Useful Commands

```bash
# Check Prisma schema syntax
npx prisma validate

# Format Prisma schema
npx prisma format

# View database structure
npx prisma db pull

# Generate TypeScript types
npx prisma generate

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

## Project URLs (Development)

- **Homepage**: http://localhost:3000
- **Educator Dashboard**: http://localhost:3000/educator/dashboard
- **Student Dashboard**: http://localhost:3000/student/dashboard
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

## Next Steps

1. ✅ Complete setup
2. ✅ Create educator account
3. ✅ Create first course
4. ✅ Add modules and lessons
5. ✅ Test as student
6. ✅ Try payment flow
7. 📖 Read the full README.md
8. 🚀 Build your course business!

## Need Help?

- Check README.md for detailed documentation
- Review code comments in source files
- Open an issue on GitHub
- Check Next.js and Prisma documentation

---

**Happy Building! 🎉**
