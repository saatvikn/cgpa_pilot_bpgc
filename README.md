# CGPA Pilot BPGC

A work-in-progress full-stack CGPA tracker for BITS Pilani, Goa Campus students. The project is being built to learn how a Next.js frontend, Express REST API, and PostgreSQL database work together.

## Current features

- Search a seeded BITS Goa course catalogue.
- Register with an email and hashed password.
- Log in and log out using a JWT stored in an HTTP-only cookie.
- Retrieve the currently authenticated user through a protected endpoint.
- Store application data in Supabase-hosted PostgreSQL.

Semester management, grade entry, SGPA/CGPA calculation, and the main frontend interface are still under development.

## Tech stack

- Next.js and React
- Node.js and Express
- PostgreSQL with the `pg` driver
- Supabase for PostgreSQL hosting
- Zod, bcryptjs, and JSON Web Tokens

## Local setup

Install dependencies in both applications:

```bash
cd client
npm install

cd ../server
npm install
```

Create local environment files using these templates:

- `client/.env.example` -> `client/.env.local`
- `server/.env.example` -> `server/.env`

From `server/`, create the database schema and seed the course catalogue:

```bash
npm run migrate
npm run seed-courses
```

Run the backend and frontend in separate terminals:

```bash
# server/
npm run dev
```

```bash
# client/
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the repository folder structure.
