# PseudoResolve - Anonymous Workplace Complaint System

## Overview
PseudoResolve is a full-stack web application for anonymous workplace complaint management. It allows employees to submit complaints anonymously while providing administrators with tools to manage, categorize, and resolve issues. The system uses AI-powered categorization and includes features for escalation based on configurable thresholds.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and bundling
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Authentication**: Session-based with express-session
- **Password Hashing**: bcryptjs for secure password storage
- **Database ORM**: Drizzle ORM for type-safe database operations

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **Schema**: Drizzle ORM with schema definitions in `shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### User Management
- **Anonymous Identity**: Users are assigned pseudonyms for complete anonymity
- **Organization-based Access**: Users belong to organizations via access keys
- **Role-based Authorization**: Admin users have additional privileges
- **Session Management**: Secure session handling with HTTP-only cookies

### Complaint System
- **Anonymous Submission**: Complaints are linked to user pseudonyms, not real identities
- **AI Categorization**: Google Gemini AI automatically categorizes complaints into predefined categories (HR, Infrastructure, Management, Cafeteria, Security, Other)
- **Similarity Grouping**: AI groups similar complaints for pattern recognition
- **Status Tracking**: Three states - pending, resolved, escalated
- **Automatic Escalation**: Complaints escalate based on configurable thresholds

### AI Integration
- **Service**: Google Gemini 2.5 Pro for complaint analysis
- **Features**: 
  - Automatic categorization
  - Similarity group assignment
  - Confidence scoring
- **Structured Output**: JSON schema validation for consistent AI responses

### Admin Dashboard
- **Complaint Management**: View, filter, and update complaint statuses
- **Analytics**: Statistics and trend analysis
- **Bulk Operations**: Efficient handling of multiple complaints
- **Escalation Management**: Handle escalated complaints with priority

## Data Flow

1. **User Registration**: Users register with organization access key, receive pseudonym
2. **Complaint Submission**: Anonymous complaint submitted with content
3. **AI Processing**: Gemini AI categorizes and groups similar complaints
4. **Admin Review**: Administrators review and manage complaints
5. **Status Updates**: Complaints move through pending → resolved/escalated states
6. **Feedback Loop**: Users can provide feedback on resolutions

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration for complaint categorization
- **@neondatabase/serverless**: PostgreSQL database connection via Neon
- **drizzle-orm**: Type-safe database ORM and query builder
- **express-session**: Secure session management
- **bcryptjs**: Password hashing and verification

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for complex components
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR on port 5000
- **Database**: Neon serverless PostgreSQL

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Served by Express in production

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **AI Service**: `GEMINI_API_KEY` for Google AI integration
- **Sessions**: `SESSION_SECRET` for secure session management

## Recent Changes
- August 17, 2025: Implemented organization switching functionality for multi-organization users
- August 17, 2025: Created separate Admin and User dashboards with role-based routing
- August 17, 2025: Added 3-option organization management (Create, Join, My Organizations) in sidebar
- August 17, 2025: Organization creation now includes threshold percentage setting
- August 17, 2025: Users can now be admin in one org and member in another
- August 17, 2025: Dashboard only accessible after selecting an organization
- August 17, 2025: AI chatbot integrated with user dashboard for complaint submission

## User Preferences
Preferred communication style: Simple, everyday language.