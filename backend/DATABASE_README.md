# Renaissance API Database Setup

A professional NestJS backend with TypeORM and PostgreSQL database integration.

## Features

- **NestJS Framework**: Modern Node.js backend framework
- **TypeORM**: Advanced ORM with PostgreSQL support
- **Database Migrations**: Professional schema management
- **Entity Relationships**: Comprehensive data modeling
- **Environment Configuration**: Secure configuration management
- **Professional Schema**: Well-designed database structure

## Database Schema

The application includes the following main entities:

- **Users**: User management with roles and permissions
- **Posts**: Content management with various types and statuses
- **Comments**: Nested commenting system
- **Categories**: Hierarchical categorization
- **Media**: File management system

## Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
# Create database (run with superuser privileges)
createdb renaissance_api

# Run the setup script
npm run db:setup
```

4. Run migrations:
```bash
npm run migration:run
```

5. Start the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Database Commands

- `npm run migration:generate` - Generate a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration
- `npm run schema:sync` - Synchronize schema with entities (dev only)
- `npm run schema:drop` - Drop all database tables

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=renaissance_api

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Project Structure

```
src/
├── common/
│   └── entities/
│       └── base.entity.ts
├── config/
│   ├── database.config.ts
│   └── configuration.ts
├── users/
│   └── entities/
│       └── user.entity.ts
├── posts/
│   └── entities/
│       └── post.entity.ts
├── comments/
│   └── entities/
│       └── comment.entity.ts
├── categories/
│   └── entities/
│       └── category.entity.ts
├── media/
│   └── entities/
│       └── media.entity.ts
├── migrations/
│   └── 001-create-initial-schema.ts
├── app.module.ts
└── main.ts
scripts/
└── setup-database.sql
```

## Development

The project uses TypeORM's synchronization in development mode, which automatically creates/updates database tables based on entity definitions. For production, use migrations.

## License

UNLICENSED
