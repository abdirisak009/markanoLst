# Markano Online Learning Platform

A comprehensive online learning platform designed for educational institutions, students, and instructors.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/internshipwasarada-1988s-projects/v0-markano-online-learning)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## 📚 Documentation

**📖 [Comprehensive System Documentation](./docs/COMPREHENSIVE_SYSTEM_DOCUMENTATION.md)** - Complete guide covering all features, API endpoints, database schema, and setup instructions.

### Additional Documentation

- [Backend API Documentation](./docs/BACKEND_DOCUMENTATION.md) - Detailed API reference
- [Gamified Learning Path](./docs/GAMIFIED_LEARNING_PATH.md) - Gamification system details
- [Learning System Setup](./docs/LEARNING_SYSTEM_SETUP.md) - Setup and configuration guide
- [Gamification Features](./docs/GAMIFICATION_FEATURES_SUMMARY.md) - Gamification features overview
- [Markano Gold Implementation](./docs/MARKAANO_GOLD_IMPLEMENTATION.md) - Gold system documentation

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
node scripts/run-migration.js scripts/001_create_tables.sql
# ... run other migrations as needed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL=postgresql://user:password@host:port/database
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=markano
R2_ENDPOINT=your_r2_endpoint
R2_PUBLIC_URL=your_r2_public_url
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_KEY=your_whatsapp_api_key
NODE_ENV=development
```

## ✨ Features

- 🎮 **Gamified Learning System** - XP, levels, badges, and daily streaks
- 📚 **Multiple Learning Systems** - Traditional courses, Gold tracks, and video learning
- 💻 **Live Coding Challenges** - Real-time coding competitions
- 🛒 **E-commerce Wizard** - Group-based project management
- 👥 **Group Management** - Student groups with payment tracking
- 📹 **Video Learning** - Video courses with progress tracking
- 💬 **Forum System** - Discussion boards for students
- 📊 **Admin Dashboard** - Comprehensive admin panel
- 🔐 **Security** - Rate limiting, IP blocking, and authentication
- 💳 **Payment System** - Course and group payment management

## 🏗️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Serverless)
- **File Storage:** Cloudflare R2
- **UI:** React 19 + Tailwind CSS 4
- **Components:** Radix UI + shadcn/ui

## 📁 Project Structure

```
markanoLst/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/             # Utility libraries (db, auth, security, etc.)
├── scripts/         # Database migration scripts
├── public/          # Static assets
└── docs/            # Documentation
```

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📖 API Endpoints

The system includes 100+ API endpoints covering:

- Authentication (Admin, Gold Student, Penn Student)
- Learning System (Courses, Modules, Lessons, Progress)
- Gamification (XP, Levels, Badges, Streaks)
- Gold System (Tracks, Levels, Enrollments)
- Videos (Catalog, Progress, Analytics)
- Groups (Management, Payments, Expenses)
- E-commerce Wizard (Submissions, Admin)
- Live Coding (Challenges, Teams, Submissions)
- Admin (Users, Students, Quizzes, Reports)
- And more...

See [Comprehensive Documentation](./docs/COMPREHENSIVE_SYSTEM_DOCUMENTATION.md) for complete API reference.

## 🗄️ Database

The system uses PostgreSQL with 50+ tables covering:

- User management (Admin, Students)
- Learning systems (Courses, Modules, Lessons)
- Gamification (XP, Levels, Badges)
- Payments and groups
- Videos and analytics
- Live coding challenges
- Forum and discussions

See [Database Schema](./docs/COMPREHENSIVE_SYSTEM_DOCUMENTATION.md#database-schema) for details.

## 🚢 Deployment

### Ubuntu VPS Production Deployment

**📖 [Complete Production Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Step-by-step guide for deploying on Ubuntu VPS with Nginx, PM2, and PostgreSQL.

Quick setup:
```bash
# On your Ubuntu VPS
wget https://raw.githubusercontent.com/YOUR_REPO/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### Vercel

The project is configured for Vercel deployment. Connect your GitHub repository and configure environment variables.

### Docker

```bash
docker-compose up -d
```

## 📝 License

Proprietary software. All rights reserved.

## 👥 Support

For issues, questions, or contributions, please refer to the [Comprehensive Documentation](./docs/COMPREHENSIVE_SYSTEM_DOCUMENTATION.md) or contact the development team.

---

**Version:** 1.0  
**Last Updated:** January 2026
