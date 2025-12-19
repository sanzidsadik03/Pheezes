# Pheezes Inventory & Management System

A premium inventory and cash management system built with Next.js, Tailwind CSS, and Prisma (SQLite).

## Features
- **Product Management**: Add products with variations (Size, Color), quantity, and pricing.
- **Order Processing**: Create orders, process them (stock deduction), and dispatch.
- **Cash Management**: Track total cash flow and view shareholder equity (25% split among 4 shareholders).
- **Premium UI**: Glassmorphism design with dark mode.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   The project uses SQLite.
   ```bash
   npx prisma db push
   ```
   *Note: If you encounter issues, ensure `prisma/schema.prisma` points to a valid file path.*

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Tech Stack
- Framework: Next.js 14 (App Router)
- Database: SQLite (via Prisma ORM)
- Styling: Tailwind CSS + Shadcn UI concepts
- Icons: Lucide React
