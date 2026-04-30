# Student Management System

A full-stack Student Management System with:

- Backend: Node.js, Express, MSSQL
- Frontend: React, Vite, Tailwind CSS

## Project Structure

- backend: REST API, authentication, class/student/score management
- frontend: Admin UI for login, class/student management, and score entry

## Features

- Employee authentication (JWT)
- Manage classes
- Manage students
- Enter and update student scores
- Secure database connectivity via MSSQL settings in environment variables

## Tech Stack

### Backend

- express
- mssql
- jsonwebtoken
- dotenv
- cors

### Frontend

- react
- react-router-dom
- vite
- tailwindcss

## Prerequisites

- Node.js 18+
- npm 9+
- SQL Server / Azure SQL database

## Environment Setup

1. Go to backend folder.
2. Copy .env.example to .env.
3. Fill your real database and JWT values.

Example command:

```bash
cd backend
copy .env.example .env
```

Required backend env keys:

- PORT
- NODE_ENV
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_TYPE
- DB_ENCRYPT
- DB_TRUST_SERVER_CERT
- DB_CONNECTION_TIMEOUT
- DB_REQUEST_TIMEOUT
- JWT_SECRET
- JWT_EXPIRES_IN

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Run in Development

Start backend:

```bash
cd backend
npm run dev
```

Backend default URL: http://localhost:5000

Start frontend in another terminal:

```bash
cd frontend
npm run dev
```

Frontend default URL (Vite): http://localhost:5173

## API Base URL (Current Frontend Config)

Frontend auth service currently uses:

- http://localhost:5000

If you change backend host/port, update service files in frontend/src/services accordingly.

## Available Backend Routes

- POST /auth/login
- /classes
- /students
- /scores

## Production Build

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

Backend:

```bash
cd backend
npm start
```

## Notes

- Do not commit real secrets from backend/.env.
- Keep backend/.env.example as the template for team sharing.
