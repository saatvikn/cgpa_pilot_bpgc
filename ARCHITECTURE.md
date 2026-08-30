# CGPA Pilot BPGC Architecture

This document explains the project as it exists after the course catalogue API was added. It is both a map of the repository and a guide to how the frontend, backend, and database communicate.

The application is still an early learning version. It currently has:

- a Next.js frontend that can call the backend health endpoint;
- an Express backend with health and course-search endpoints;
- a verified SSL connection to Supabase PostgreSQL;
- the initial relational database schema;
- 14 seeded BITS Goa Computer Science core courses.

Authentication, semester CRUD, grade entry, SGPA, and CGPA have not been implemented yet.

## 1. Big-picture architecture

```text
Browser
   |
   | React event handlers and fetch()
   | HTTP requests and JSON responses
   v
Next.js frontend
http://localhost:3000
   |
   | HTTP request to NEXT_PUBLIC_API_URL
   v
Express REST API
http://localhost:5000
   |
   | Parameterized SQL through pg
   | Encrypted and certificate-verified connection
   v
Supabase-hosted PostgreSQL
```

Supabase is only being used to host PostgreSQL. The project does not use Supabase Auth, the Supabase JavaScript client, or Supabase's generated Data API.

### Responsibilities of each layer

| Layer | Responsible for | Not responsible for |
| --- | --- | --- |
| Browser/React | Rendering UI, handling clicks and forms, showing loading and error states | Trusting user input or enforcing database security |
| Next.js | Organizing frontend pages and components, building the browser application | Connecting directly to PostgreSQL |
| Express | Defining API routes, validating requests, authenticating users, enforcing ownership, running application logic | Rendering the main React UI |
| PostgreSQL | Persisting data and enforcing relational constraints | Knowing which browser is logged in |

The backend and database are the security boundary. Hiding something in React is a user-experience decision, not authorization.

## 2. Local ports and origins

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

An origin consists of protocol, hostname, and port. Therefore, ports `3000` and `5000` are different origins even though both use `localhost`.

The Express CORS middleware allows the configured frontend origin to read API responses. CORS is enforced by browsers; it is not authentication and does not stop tools such as `curl` from calling the API.

## 3. Repository map

```text
cgpa_pilot_bpgc/
|
|-- ARCHITECTURE.md
|-- .gitignore
|
|-- client/
|   |-- app/
|   |   |-- favicon.ico
|   |   |-- globals.css
|   |   |-- layout.js
|   |   |-- page.js
|   |   `-- page.module.css
|   |-- public/
|   |-- .env.local             ignored; exists only on the local machine
|   |-- .env.example
|   |-- .gitignore
|   |-- eslint.config.mjs
|   |-- jsconfig.json
|   |-- next.config.mjs
|   |-- package.json
|   |-- package-lock.json
|   `-- README.md
|
`-- server/
    |-- certs/
    |   `-- supabase_ca.crt
    |-- data/
    |   `-- bits-goa-courses.csv
    |-- scripts/
    |   |-- runMigration.js
    |   |-- seedCourses.js
    |   `-- testDatabase.js
    |-- sql/
    |   `-- 001_initial_schema.sql
    |-- src/
    |   |-- config/
    |   |   `-- db.js
    |   |-- controllers/
    |   |   `-- course.controller.js
    |   |-- routes/
    |   |   `-- course.routes.js
    |   |-- app.js
    |   `-- server.js
    |-- .env                   ignored; contains the real database URL
    |-- .env.example
    |-- package.json
    `-- package-lock.json
```

`node_modules/`, `.next/`, `.env` files, logs, and `tmp/` are ignored by Git.

## 4. Root files

### `.gitignore`

Defines files that Git must not commit. Important examples are:

- `node_modules/`: downloaded dependencies can be restored with `npm install`;
- `.next/`: generated Next.js development/build output;
- `.env*`: local environment files that may contain secrets;
- `!.env.example`: an exception allowing safe environment templates into Git;
- `tmp/`: temporary research and rendering files;
- `*.log`: generated logs.

Package lockfiles are deliberately committed. They record the exact dependency versions installed for a reproducible setup.

### `ARCHITECTURE.md`

This file. It explains how the code is organized and how data moves through the system. It should be updated when the architecture changes materially.

## 5. Frontend: `client/`

The `client` directory is an independent npm application built with Next.js, React, and JavaScript.

### `client/package.json`

Describes the frontend application, dependencies, and commands.

Current runtime dependencies:

- `next`: the frontend framework and development/build server;
- `react`: the component and state model;
- `react-dom`: renders React components into the browser DOM.

Commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run a completed production build |
| `npm run lint` | Check frontend source code with ESLint |

### `client/package-lock.json`

Records exact installed dependency versions and their dependency tree. It is generated and maintained by npm.

### `client/app/`

The `app` directory activates the Next.js App Router. Folder and file names inside it determine frontend routes and shared layouts.

#### `client/app/layout.js`

The root layout wraps every frontend page.

It currently:

- loads the Geist font definitions;
- imports global CSS;
- defines temporary generated metadata;
- renders page content through the `children` prop.

The metadata still says `Create Next App` and will be replaced when the public UI is built.

#### `client/app/page.js`

Represents the `/` frontend route.

It begins with:

```js
"use client";
```

App Router components are Server Components by default. This page needs browser state and an `onClick` event, so it must be a Client Component.

The page currently demonstrates:

- `useState` for backend status, loading state, and error state;
- an asynchronous click handler;
- `fetch()` to call `GET /api/health`;
- `response.ok` to detect non-successful HTTP status codes;
- `response.json()` to convert a JSON response into a JavaScript object;
- `try`, `catch`, and `finally` for success, failure, and cleanup behavior.

Current request flow:

```text
User clicks "Check backend"
        |
        v
checkBackend()
        |
        v
fetch(NEXT_PUBLIC_API_URL + "/api/health")
        |
        v
Express responds with { "status": "ok" }
        |
        v
setBackendStatus(data.status)
        |
        v
React renders the updated status
```

This is a temporary connectivity page, not the final landing page.

#### `client/app/page.module.css`

Contains styles scoped to `page.js`. CSS Module class names are imported through the `styles` object, preventing these class names from leaking globally.

#### `client/app/globals.css`

Contains site-wide CSS such as:

- default colors;
- box sizing;
- body sizing and typography;
- link defaults;
- basic dark-mode variables.

Global CSS affects every page. Component-specific styling belongs in CSS Modules where practical.

#### `client/app/favicon.ico`

The browser-tab icon. It is still the generated starter icon.

### `client/public/`

Contains files that Next.js serves directly from the site root. For example, `public/example.svg` would be available at `/example.svg`.

The existing SVG files are unused `create-next-app` starter assets and can be removed later when the real UI assets are introduced.

### `client/.env.local`

Local, ignored environment configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The `NEXT_PUBLIC_` prefix means Next.js may expose this value to browser JavaScript. It is appropriate for a public API address but never for a database URL, password, or signing secret.

### `client/.env.example`

A safe template documenting the frontend environment variables required by another developer. It contains no secrets and is committed.

### `client/next.config.mjs`

The Next.js configuration file. It currently uses the default configuration and has no custom options.

### `client/jsconfig.json`

Defines this import alias:

```text
@/* -> client/*
```

Later, an import such as `@/components/Navbar` can refer to `client/components/Navbar` without a long relative path.

### `client/eslint.config.mjs`

Configures ESLint with Next.js Core Web Vitals rules. ESLint catches suspicious JavaScript and React patterns before they become runtime bugs.

### `client/.gitignore`

Contains additional ignore rules scoped to the frontend, including `.next`, build output, frontend environment files, and package-manager artifacts.

### `client/README.md`

The generated Next.js README. It is temporary and will eventually be replaced or folded into the project's root README.

## 6. Backend: `server/`

The `server` directory is a separate npm application using Node.js, Express, and raw SQL through `pg`.

### `server/package.json`

Current dependencies:

| Dependency | Purpose |
| --- | --- |
| `express` | HTTP server, middleware, routes, requests, and responses |
| `dotenv` | Loads values from `server/.env` into `process.env` |
| `cors` | Adds browser cross-origin response headers for the allowed frontend |
| `pg` | PostgreSQL driver and connection pool |
| `csv-parse` | Reliably parses catalogue CSV data |
| `nodemon` | Development-only automatic server restart after file changes |

Current scripts:

| Command | Purpose | Re-runnable? |
| --- | --- | --- |
| `npm run dev` | Start Express through nodemon | Yes |
| `npm start` | Start Express through Node | Yes |
| `npm run test-db` | Run `SELECT NOW()` to test PostgreSQL connectivity | Yes |
| `npm run migrate` | Apply the initial schema migration | Only once per database |
| `npm run seed-courses` | Insert or update catalogue rows from CSV | Yes |
| `npm test` | Placeholder; automated tests are not configured yet | Not useful yet |

### `server/src/server.js`

The backend process entry point.

It:

1. loads `server/.env` through `dotenv/config`;
2. imports the configured Express application;
3. reads `PORT`, defaulting to 5000;
4. calls `app.listen()` to accept HTTP connections.

`server.js` answers the question: **How does the process start?**

### `server/src/app.js`

Creates and configures the Express application.

It currently:

1. calls `express()` to create the app;
2. configures CORS for `CLIENT_URL`;
3. defines `GET /api/health`;
4. mounts the course router under `/api/courses`;
5. exports the configured app.

`app.js` answers the question: **What middleware and routes does the API contain?**

Keeping `app.js` separate from `server.js` will later allow tests to import the app without opening a real network port.

The health route does not query PostgreSQL. It only proves that the Express process can receive and answer an HTTP request.

### `server/src/config/db.js`

Creates the shared PostgreSQL connection pool.

It:

- requires `DATABASE_URL`;
- reads the Supabase CA certificate;
- enables strict TLS certificate verification;
- sets a 30-second connection timeout;
- exports one reusable `Pool` instance.

A pool avoids opening a brand-new database connection for every query:

```text
Request 1 -> borrow connection -> query -> return connection
Request 2 -> reuse connection  -> query -> return connection
```

The pool is created empty and connects lazily when a query needs a database connection.

### `server/certs/supabase_ca.crt`

The public certificate authority used to verify that the backend is connecting to the expected Supabase server.

This is not a secret and contains no private key. The database password remains in `server/.env`.

### `server/src/routes/course.routes.js`

Defines URL-to-controller mappings for the course catalogue.

Current mapping:

```text
GET / -> getCourses
```

Because `app.js` mounts this router at `/api/courses`, the complete endpoint is:

```text
GET /api/courses
```

The route file should remain thin. It decides which function handles a request but does not contain SQL.

### `server/src/controllers/course.controller.js`

Contains the `getCourses` request handler.

It:

1. reads `request.query.search`;
2. trims it and creates a `%search%` SQL pattern;
3. queries PostgreSQL;
4. returns matching course rows as JSON;
5. returns a safe `500` message if the query fails.

The SQL searches course codes and names case-insensitively:

```sql
WHERE course_code ILIKE $1
   OR course_name ILIKE $1
```

`$1` is a parameter placeholder. The search value is supplied separately in an array, so PostgreSQL treats it as data rather than executable SQL.

The result is ordered by course code and limited to 50 rows. With an empty search, the pattern is `%%`, which matches every course up to that limit.

Current response shape:

```json
{
  "courses": [
    {
      "id": "uuid",
      "course_code": "CS F212",
      "course_name": "Database Systems",
      "credits": 4,
      "department": "Computer Science"
    }
  ]
}
```

### `server/data/bits-goa-courses.csv`

Version-controlled seed data for the master course catalogue.

Columns:

```text
course_code, course_name, credits, department
```

It currently contains 14 verified Computer Science core courses. It is a master catalogue sample, not a record of which courses are offered in a particular semester.

The project consistently uses the term `credits`, not `units`.

### `server/scripts/testDatabase.js`

A connectivity diagnostic. It runs:

```sql
SELECT NOW() AS current_time;
```

If it succeeds, the backend can reach PostgreSQL, authenticate, establish verified TLS, send SQL, and receive rows.

It closes the pool because it is a standalone process. Normal API controllers must not close the shared pool after each request.

### `server/scripts/runMigration.js`

Reads `sql/001_initial_schema.sql` and sends it to PostgreSQL.

The script is permanent project tooling, not a temporary test. The specific `001` migration is applied once to a database. Running it again against the same schema will fail because the tables already exist.

The current runner is intentionally simple and knows only about migration `001`. A future migration system can track and apply multiple numbered migrations.

### `server/scripts/seedCourses.js`

Reads the CSV, validates each row, and inserts or updates catalogue data.

Important behaviors:

- rejects an empty CSV;
- rejects missing or non-positive credit values;
- rejects duplicate course codes within the CSV;
- uses one checked-out database client;
- wraps the whole seed operation in a transaction;
- uses parameterized SQL;
- uses an upsert to make the script safe to rerun.

Transaction flow:

```text
BEGIN
  -> validate and upsert course 1
  -> validate and upsert course 2
  -> ...
COMMIT
```

If any row fails:

```text
error -> ROLLBACK -> none of that run's partial changes remain
```

Upsert behavior:

```text
new course_code      -> INSERT
existing course_code -> UPDATE title, credits, and department
```

The course's existing UUID is preserved during an update, so future student records referencing it are not broken.

### `server/.env`

Ignored local backend configuration:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://real-secret-connection-string
```

`DATABASE_URL` must never be placed in frontend code or committed to Git.

### `server/.env.example`

A safe template showing which backend variables are required without containing the real credentials.

### `server/package-lock.json`

The exact backend dependency tree generated by npm. It should be committed.

## 7. Database schema

The schema lives in `server/sql/001_initial_schema.sql` so database structure changes are visible in Git.

### Relationship model

```text
users
  | 1
  |
  | many
semesters
  | 1
  |
  | many
semester_courses
  | many
  |
  | 1
courses
```

Equivalent object view:

```text
User
|-- Semester 1
|   |-- selected Course A + this user's grade
|   `-- selected Course B + this user's grade
`-- Semester 2
    `-- selected Course C + this user's grade
```

### `users`

Stores application accounts.

| Column | Meaning |
| --- | --- |
| `id` | Random UUID primary key |
| `email` | Unique login email |
| `password_hash` | Future bcrypt hash; never plaintext |
| `created_at` | Account creation time |

PostgreSQL text uniqueness is case-sensitive. The future registration controller will normalize emails to lowercase before querying and inserting them.

### `courses`

Stores shared master catalogue entries.

| Column | Meaning |
| --- | --- |
| `id` | Random UUID primary key |
| `course_code` | Unique code such as `CS F212` |
| `course_name` | Canonical course title |
| `credits` | Positive integer used for GPA weighting |
| `department` | Catalogue grouping |
| `created_at` | Row creation time |

Course codes are unique and credits must be greater than zero.

### `semesters`

Stores semesters belonging to individual users.

| Column | Meaning |
| --- | --- |
| `id` | Random UUID primary key |
| `user_id` | Foreign key to `users.id` |
| `name` | User-visible semester name |
| `semester_order` | Positive sorting position |
| `created_at` | Creation time |
| `updated_at` | Most recent application-managed update time |

Constraints prevent blank names and duplicate semester-order positions for one user.

Deleting a user cascades to their semesters.

### `semester_courses`

The join table connecting a semester to the master course catalogue.

| Column | Meaning |
| --- | --- |
| `id` | Random UUID primary key |
| `semester_id` | Foreign key to `semesters.id` |
| `course_id` | Foreign key to `courses.id` |
| `grade` | Nullable letter grade |
| `created_at` | Creation time |
| `updated_at` | Most recent application-managed update time |

The grade belongs here because it describes a student's course attempt, not the shared course itself.

Allowed non-null grades are:

```text
A, A-, B, B-, C, C-, D, E
```

The unique `(semester_id, course_id)` constraint prevents the same course from being added twice to one semester.

Deleting a semester cascades to its `semester_courses` rows. Deleting a referenced master course is restricted so historical student data cannot silently lose its meaning.

### Why UUIDs?

UUIDs provide identifiers that are unique across environments and difficult to guess sequentially. They do not replace authorization: future queries must still verify that the requested semester belongs to the authenticated user.

### Why a join table instead of an array?

The join table lets PostgreSQL:

- require every selected course to exist;
- store a grade for each selection;
- prevent duplicates with a unique constraint;
- query and update individual selections;
- preserve relational integrity with foreign keys.

## 8. Current API endpoints

### `GET /api/health`

Purpose: verify that Express is running.

Database query: none.

Response:

```json
{
  "status": "ok"
}
```

### `GET /api/courses`

Purpose: return catalogue courses, currently limited to 50.

Example:

```text
GET /api/courses
```

### `GET /api/courses?search=database`

Purpose: case-insensitive partial search by course code or course name.

Example response:

```json
{
  "courses": [
    {
      "id": "uuid",
      "course_code": "CS F212",
      "course_name": "Database Systems",
      "credits": 4,
      "department": "Computer Science"
    }
  ]
}
```

## 9. End-to-end course-search flow

The frontend does not call this endpoint yet, but the backend flow already exists:

```text
Browser requests GET /api/courses?search=database
        |
        v
Express app receives the request
        |
        v
CORS middleware adds the allowed-origin response headers
        |
        v
app.js matches the /api/courses router prefix
        |
        v
course.routes.js matches GET /
        |
        v
getCourses controller reads request.query.search
        |
        v
Controller calls pool.query(SQL, [searchPattern])
        |
        v
pg borrows or opens a verified SSL database connection
        |
        v
PostgreSQL executes the parameterized ILIKE query
        |
        v
Rows return to the controller
        |
        v
Express serializes { courses: rows } as JSON
        |
        v
Browser receives the response
```

## 10. Startup flows

### Starting the frontend

```text
npm run dev
  -> Next.js reads client configuration
  -> Next.js reads NEXT_PUBLIC_API_URL
  -> development server listens on port 3000
  -> browser requests /
  -> app/layout.js wraps app/page.js
```

### Starting the backend

```text
npm run dev
  -> nodemon starts src/server.js
  -> dotenv loads server/.env
  -> server.js imports app.js
  -> app.js registers middleware and routes
  -> app.listen() listens on port 5000
```

The PostgreSQL pool does not need to open a connection merely to answer `/api/health`. A connection is established lazily when a database query is made.

## 11. Security already present

- Real environment files are ignored by Git.
- The database URL exists only in the backend environment.
- PostgreSQL traffic uses TLS.
- The Supabase server certificate is verified using its CA certificate.
- Course search uses parameterized SQL.
- Database constraints reject invalid relationships and grades.
- API failures return a generic message instead of database credentials.
- CORS allows one configured frontend origin instead of every website.

## 12. Security not present yet

- No passwords are currently accepted or hashed.
- No JWT is currently created or verified.
- No HTTP-only authentication cookie exists.
- No authentication middleware exists.
- No user ownership checks exist because semester endpoints do not exist yet.
- CORS credentials are not enabled yet.
- No request validation library is active yet.
- No rate limiting or security headers are configured.

These are planned steps, not accidental omissions being hidden by the frontend.

## 13. Current limitations

- The frontend is only a health-check demonstration.
- The catalogue contains only 14 Computer Science core courses.
- Course search is available only through the backend API.
- There are no registration or login pages.
- There is no protected dashboard.
- Semester and semester-course API endpoints do not exist.
- Grades cannot be entered through the API or frontend.
- SGPA and CGPA logic has not been written.
- Automated tests have not been configured.
- The migration runner handles only the initial migration.
- Error handling is local to the course controller rather than centralized middleware.
- The generated frontend metadata and starter assets have not been replaced.

## 14. Key terminology learned so far

| Term | Meaning in this project |
| --- | --- |
| HTTP request | A client asks Express to perform an operation |
| HTTP response | Express returns a status, headers, and usually JSON |
| Endpoint | An HTTP method and path, such as `GET /api/courses` |
| Route | Express mapping from method/path to a handler |
| Controller | Function that handles a request and produces a response |
| Middleware | Function that runs during the request-response pipeline |
| CORS | Browser cross-origin response-reading policy |
| JSON | Text data format exchanged by frontend and backend |
| Environment variable | Configuration kept outside source code |
| Connection pool | Reusable set of PostgreSQL connections |
| Migration | Version-controlled database structure change |
| Seed | Initial or reference data inserted into a database |
| Transaction | Group of SQL operations that commit or roll back together |
| Parameterized query | SQL text and input values sent separately |
| Upsert | Insert a new row or update an existing conflicting row |
| Primary key | Column that uniquely identifies a row |
| Foreign key | Column that must reference a row in another table |
| Unique constraint | Database rule preventing duplicate values |
| Check constraint | Database rule rejecting invalid values |
| Join table | Table representing a relationship between two other tables |

## 15. How to trace unfamiliar code

For an API request, follow this order:

```text
app.js
  -> matching file under routes/
  -> imported controller function
  -> database pool or utility used by the controller
  -> SQL table definitions in sql/
```

For frontend behavior, follow this order:

```text
app/<route>/page.js
  -> imported components
  -> event handler
  -> fetch() URL
  -> matching Express endpoint
  -> state update
  -> rendered JSX
```

For database setup and reference data:

```text
sql/001_initial_schema.sql
  -> scripts/runMigration.js

data/bits-goa-courses.csv
  -> scripts/seedCourses.js
  -> courses table
```

This trace is the core architecture the project is intended to teach:

```text
React UI
  -> fetch()
  -> HTTP
  -> Express route
  -> controller
  -> parameterized SQL
  -> PostgreSQL
  -> JSON response
  -> React state
  -> updated UI
```
