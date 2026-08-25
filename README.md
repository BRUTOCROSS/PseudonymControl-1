# PseudoResolve

PseudoResolve is an anonymous workplace complaint management system. It gives employees a safe way to report workplace issues using pseudonymous accounts, while giving administrators the tools to review, categorize, track, and resolve complaints.

## What the project does

The application supports two main types of users:

- **Employees** can create an account, join an organization, submit complaints, track complaint status, and provide feedback.
- **Administrators** can create organizations, configure escalation thresholds, review complaints, update statuses, view grouped complaints, and monitor complaint statistics.

Complaints are analyzed with Google Gemini to help categorize them into areas such as:

- Human Resources
- Infrastructure
- Management
- Cafeteria
- Security
- Other

The system also groups similar complaints and can escalate issues when configurable thresholds are reached.

## Main features

- Anonymous or pseudonymous complaint submission
- Organization-based access control
- Multiple organizations per user
- Role-based dashboards for employees and administrators
- AI-powered complaint categorization
- Similarity grouping for repeated or related complaints
- Complaint status tracking:
  - Pending
  - Resolved
  - Escalated
- Automatic escalation based on organization settings
- Admin analytics and complaint statistics
- Feedback and notifications
- Secure session-based authentication
- Password hashing with `bcryptjs`

## Technology stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI
- TanStack Query
- React Hook Form
- Zod
- Wouter

### Backend

- Node.js
- Express
- TypeScript
- Session-based authentication
- Drizzle ORM
- PostgreSQL
- Google Gemini API

## Project structure

```text
client/             React frontend
  src/
    components/     Reusable UI components
    pages/          Application pages and dashboards
    hooks/          React hooks
    lib/            Authentication and API utilities

server/             Express backend
  db.ts             Database connection
  index.ts          Application entry point
  routes.ts         API routes
  storage.ts        Data access interface

shared/             Shared application code
  schema.ts         Drizzle database schema and types

attached_assets/    Reference assets and imported project files
```

## Requirements

- Node.js 20 or newer
- PostgreSQL database
- Google Gemini API key

## Environment variables

Create a `.env` file locally, or configure these values in your hosting provider's secret manager:

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_long_random_session_secret
```

Never commit `.env` files, API keys, database passwords, or session secrets to GitHub.

## Getting started

Install dependencies:

```bash
npm install
```

Push the database schema:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The application runs on port `5000` in development.

## Available commands

```bash
npm run dev      # Start the development server
npm run check    # Run TypeScript checks
npm run build    # Build the frontend and backend
npm run start    # Start the production build
npm run db:push  # Apply the Drizzle schema to PostgreSQL
```

## Application flow

1. A user registers with an organization access key or creates an organization.
2. The user receives a pseudonymous identity.
3. The user submits a workplace complaint.
4. Gemini analyzes and categorizes the complaint.
5. Similar complaints can be grouped for pattern recognition.
6. Administrators review complaints through the admin dashboard.
7. Complaints are marked as pending, resolved, or escalated.
8. Users can follow the status of their complaints and provide feedback.

## Pushing this project to GitHub

Before pushing, confirm that generated files and secrets are ignored:

```bash
git status
```

Then run:

```bash
git init
git add .
git commit -m "Initial project upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your GitHub details. If a Git remote already exists, check it with:

```bash
git remote -v
```

## Privacy note

PseudoResolve is designed to separate complaints from a user's real-world identity by using pseudonymous accounts. Organizations should still configure appropriate access controls, database security, retention policies, and deployment safeguards before using the system with sensitive workplace data.

## License

This project is licensed under the MIT License.