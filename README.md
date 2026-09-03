# CGPA Pilot BPGC

[![CI](https://github.com/saatvikn/cgpa_pilot_bpgc/actions/workflows/ci.yml/badge.svg)](https://github.com/saatvikn/cgpa_pilot_bpgc/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack CGPA tracker for BITS Pilani, Goa Campus students. Build semesters, add courses from the campus catalogue, record grades, and see credit-weighted SGPA and CGPA values.

## Features

- Register, log in, and log out with JWT authentication in an HTTP-only cookie.
- Create, edit, order, and delete semesters.
- Search a seeded catalogue of 590 BITS Goa courses by code or name.
- Add courses, select grades, and remove courses from a semester.
- Calculate SGPA and CGPA using course credits; ungraded courses are ignored.
- Keep every student's semester data isolated through server-side ownership checks.

## Stack

- **Frontend:** Next.js 16 and React 19
- **Backend:** Node.js and Express 5
- **Database:** PostgreSQL hosted on Supabase
- **Validation and security:** Zod, bcryptjs, JWT, Helmet, and rate limiting
- **Testing:** Node.js test runner and GitHub Actions

```text
Browser -> Next.js client -> Express API -> Supabase PostgreSQL
```

In production, the Next.js app proxies `/api` requests to the Express server so the authentication cookie stays first-party. See [ARCHITECTURE.md](ARCHITECTURE.md) for the folder map.

## Run locally

Requirements: Node.js 24, npm, and a PostgreSQL database.

```bash
git clone https://github.com/saatvikn/cgpa_pilot_bpgc.git
cd cgpa_pilot_bpgc/client
npm install
cd ../server
npm install
```

Copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`, then replace the placeholder values.

From `server/`, prepare the database:

```bash
npm run migrate -- 001_initial_schema.sql
npm run migrate -- 002_indexes.sql
npm run migrate -- 003_secure_public_tables.sql
npm run seed-courses
```

Start the two applications in separate terminals:

```bash
# server/
npm run dev
```

```bash
# client/
npm run dev
```

Open `http://localhost:3000`. The API runs at `http://localhost:5000`.

## Environment variables

| Application | Variable | Purpose |
| --- | --- | --- |
| Client | `NEXT_PUBLIC_API_URL` | Direct Express URL used locally |
| Client | `SERVER_API_URL` | Express URL used by the production Next.js proxy |
| Server | `PORT` | Express port; defaults to `5000` |
| Server | `CLIENT_URL` | Allowed frontend origin |
| Server | `DATABASE_URL` | PostgreSQL connection string |
| Server | `JWT_SECRET` | Secret used to sign tokens; use at least 32 random characters |
| Server | `NODE_ENV` | `development`, `test`, or `production` |

Never commit real `.env` files or credentials.

## Data and calculations

The database stores users, the shared course catalogue, user-owned semesters, and the courses and grades selected within each semester.

```text
SGPA or CGPA = sum(course credits × grade points) / sum(graded credits)
```

Supported grades are `A`, `A-`, `B`, `B-`, `C`, `C-`, `D`, and `E`.

## Checks

```bash
# server/
npm test

# client/
npm run lint
npm run build
```

## Deployment

The project is prepared for a Vercel frontend, Render backend, and Supabase PostgreSQL database. Set `SERVER_API_URL` on Vercel and the server variables listed above on Render.

## Database schema

```mermaid
erDiagram
    USERS ||--o{ SEMESTERS : owns
    SEMESTERS ||--o{ SEMESTER_COURSES : contains
    COURSES ||--o{ SEMESTER_COURSES : selected_as

    USERS {
        uuid id PK
        text email UK
        text password_hash
        timestamptz created_at
    }

    COURSES {
        uuid id PK
        text course_code UK
        text course_name
        smallint credits
        text department
        timestamptz created_at
    }

    SEMESTERS {
        uuid id PK
        uuid user_id FK
        text name
        integer semester_order
        timestamptz created_at
        timestamptz updated_at
    }

    SEMESTER_COURSES {
        uuid id PK
        uuid semester_id FK
        uuid course_id FK
        text grade
        timestamptz created_at
        timestamptz updated_at
    }
```

Each user can own multiple semesters. `semester_courses` joins a semester to the shared course catalogue and stores the selected grade. A course can appear only once in a semester, and a semester order can appear only once per user.

## Contributing

Contributions and bug reports are welcome.

1. Fork the repository and create a focused branch.
2. Install dependencies in both `client/` and `server/`.
3. Make the change and add small comments where they improve understanding.
4. Run the server tests, client lint, and client production build.
5. Open a pull request explaining the change and how it was tested.

Use short, natural commit messages that describe the result. Keep unrelated changes in separate commits.

## Security

Do not open a public issue for a vulnerability. Submit it privately through the repository's **Security** tab, or contact the maintainer through their GitHub profile if private reporting is unavailable.

Never commit passwords, database connection strings, JWT secrets, private keys, or real student data.

## License

Licensed under the [MIT License](LICENSE).
