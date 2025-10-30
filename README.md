# Tanzmoment

A modern dance course platform built with Angular and NestJS in an Nx monorepo.

## Project Structure

This project uses [Nx](https://nx.dev) as a build system and consists of the following main components:

### Apps

- **web** - Angular 20 frontend application with SSR support
- **api** - NestJS backend API with Prisma ORM

### Libs

- **shared-types** - Shared TypeScript types

## Tech Stack

### Frontend
- Angular 20
- Angular SSR
- TanStack Query (Angular Experimental)
- SCSS for styling
- Vite as build tool

### Backend
- NestJS 11
- Prisma ORM
- PostgreSQL database
- JWT Authentication (Passport)
- BullMQ for queue management
- Pino for logging
- Swagger API documentation

### Shared Services
- Redis (for BullMQ)
- Docker & Docker Compose

## Prerequisites

- Node.js (recommended: version 20.x)
- Docker & Docker Compose
- npm or yarn

## Installation

```sh
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
```

## Development

### Start everything at once

```sh
# Starts Docker services and both applications
npm start
```

### Start individual services

```sh
# Start Docker services (PostgreSQL, Redis)
npm run docker:up

# Start API (runs on port 3000)
npm run serve:api

# Start web app (runs on port 4200)
npm run serve:web

# Start both apps in parallel
npm run dev
```

### Database Management

```sh
# Run database migration
npm run prisma:migrate

# Open Prisma Studio (UI for the database)
npm run prisma:studio

# Seed database with data
npm run prisma:seed

# Reset database completely
npm run db:reset
```

### Stop services

```sh
# Stop all Docker services
npm stop
```

## UI Components

The project includes a library of reusable UI components:

- **Button** - Button component with various variants
- **Course Card** - Card component for course display
- **Input** - Input field with enhanced features (prefix/suffix, character counter, loading state)

Components are located in [apps/web/src/app/shared/ui/](apps/web/src/app/shared/ui/).

## API Documentation

The Swagger API documentation is available at:
```
http://localhost:3000/api
```

## Visualize Project Graph

```sh
npx nx graph
```

## Testing

```sh
# E2E tests for web app
npx nx e2e web-e2e

# E2E tests for API
npx nx e2e api-e2e
```

## Environment Variables

Create a `.env` file in the project root with the necessary environment variables. Example configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tanzmoment"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="your-secret-key"
```

## License

MIT
