# Kairos Chat

A real-time 1-to-1 chat application built with Next.js, Express, Socket.io, and PostgreSQL.

## Tech Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| Frontend       | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend        | Node.js, Express, Socket.io, TypeScript                      |
| Database       | PostgreSQL + Drizzle ORM                                     |
| Real-time      | Socket.io                                                    |
| Frontend Tests | Vitest + React Testing Library                               |
| Backend Tests  | Jest + Supertest                                             |
| CI/CD          | GitHub Actions                                               |

## Project Structure

```
kairos-chat/
├── src/          # Next.js frontend (port 3000)
└── server/       # Express + Socket.io backend (port 8080)
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ running locally

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd kairos-chat
```

### 2. Configure environment variables

**Backend:**

```bash
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL
```

**Frontend:**

```bash
cp src/.env.local.example src/.env.local
# Edit if your backend runs on a different port
```

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../src && npm install
```

### 4. Set up the database

```bash
cd server
npm run db:push
```

This creates the `messages` table in your PostgreSQL database.

### 5. Run the application

Open two terminals:

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
# Runs on http://localhost:8080
```

**Terminal 2 — Frontend:**

```bash
cd src
npm run dev
# Runs on http://localhost:3000
```

### 6. Test with two users

Open two browser tabs at `http://localhost:3000`. Enter different usernames (e.g., **User A** and **User B**) and start chatting in real time.

## Environment Variables

### Backend (`server/.env`)

| Variable       | Default                 | Description                  |
| -------------- | ----------------------- | ---------------------------- |
| `DATABASE_URL` | —                       | PostgreSQL connection string |
| `PORT`         | `8080`                  | Server port                  |
| `CLIENT_URL`   | `http://localhost:3000` | Allowed CORS origin          |

### Frontend (`src/.env.local`)

| Variable                 | Default                 | Description          |
| ------------------------ | ----------------------- | -------------------- |
| `NEXT_PUBLIC_API_URL`    | `http://localhost:8080` | Backend REST API URL |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:8080` | Socket.io server URL |

## API Reference

### REST

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| `GET`  | `/api/messages?limit=50&offset=0` | Get paginated messages |
| `POST` | `/api/messages`                   | Create a new message   |
| `GET`  | `/health`                         | Health check           |

### Socket.io Events

| Event         | Direction            | Payload            | Description               |
| ------------- | -------------------- | ------------------ | ------------------------- |
| `sendMessage` | Client → Server      | `{ sender, text }` | Send a new message        |
| `message`     | Server → All clients | `Message`          | Broadcast new message     |
| `error`       | Server → Client      | `{ message }`      | Validation / server error |

## Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd src && npm test

# Frontend tests with coverage
cd src && npm run test:coverage
```

## CI/CD

GitHub Actions runs on every push and pull request:

1. Installs dependencies
2. Pushes database schema (PostgreSQL service)
3. Lints the frontend
4. Runs backend (Jest) and frontend (Vitest) tests
5. Builds the frontend

See `.github/workflows/test.yml` for the full pipeline.
