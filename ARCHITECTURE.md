# CGPA Pilot BPGC — Project Structure

The project has two applications:

```text
Browser -> Next.js client -> Express server -> Supabase PostgreSQL
```

The frontend never connects directly to PostgreSQL. It calls the Express API, and the server performs the database work.

## Folder map

```text
cgpa_pilot_bpgc/
|-- client/                         Next.js frontend
|   |-- app/                        Pages, layouts, and page styles
|   |   |-- login/
|   |   |   `-- page.jsx            Login page
|   |   |-- register/
|   |   |   `-- page.jsx            Registration page
|   |   |-- auth.module.css         Shared authentication-page styles
|   |   |-- layout.jsx              Shared root layout
|   |   |-- page.jsx                Home page
|   |   |-- globals.css             Site-wide styles
|   |   `-- page.module.css         Home-page styles
|   |-- lib/
|   |   `-- api.js                  Shared frontend API helper
|   |-- public/                     Static files such as images and icons
|   |-- .env.local                  Local frontend configuration (ignored)
|   |-- .env.example                Safe frontend environment template
|   |-- package.json                Frontend dependencies and npm scripts
|   `-- next.config.mjs             Next.js configuration
|
|-- server/                         Express backend
|   |-- src/                        Code used while the API is running
|   |   |-- server.js               Starts the HTTP server
|   |   |-- app.js                  Configures middleware and mounts routes
|   |   |-- config/                 Shared application configuration
|   |   |   |-- auth.js             Cookie and JWT configuration
|   |   |   `-- db.js               PostgreSQL connection pool and SSL setup
|   |   |-- routes/                 Maps HTTP methods and paths to controllers
|   |   |   |-- auth.routes.js
|   |   |   `-- course.routes.js
|   |   |-- controllers/            Processes requests and creates responses
|   |   |   |-- auth.controller.js
|   |   |   `-- course.controller.js
|   |   |-- middleware/             Functions that run before controllers
|   |   |   `-- auth.middleware.js  Verifies JWTs and attaches the user ID
|   |   `-- validation/             Zod request-validation rules
|   |       `-- auth.schemas.js
|   |-- sql/                        Version-controlled database structure
|   |   `-- 001_initial_schema.sql
|   |-- data/                       Reference data used by seed scripts
|   |   `-- bits-goa-courses.csv
|   |-- scripts/                    Commands run manually for setup or testing
|   |   |-- runMigration.js
|   |   |-- seedCourses.js
|   |   `-- testDatabase.js
|   |-- certs/                      Public certificates used for database SSL
|   |   `-- supabase_ca.crt
|   |-- .env                        Real backend configuration (ignored)
|   |-- .env.example                Safe backend environment template
|   `-- package.json                Backend dependencies and npm scripts
|
|-- ARCHITECTURE.md                 This repository guide
`-- .gitignore                      Files Git must not commit
```

## What belongs where

### `client/`

Everything related to the user interface belongs here. Next.js pages go in `app/`, reusable UI components will go in a future `components/` folder, and browser-side API helpers can go in a future `lib/` folder.

### `server/src/`

This is the backend application code:

- `server.js` starts the process and listens on a port.
- `app.js` assembles the Express application.
- `routes/` decides which controller handles an endpoint.
- `controllers/` validates the request flow, runs application logic, queries PostgreSQL, and sends the response.
- `middleware/` contains reusable request checks such as JWT authentication.
- `validation/` contains reusable Zod schemas.
- `config/` contains shared settings such as authentication options and the database pool.

The usual backend flow is:

```text
request -> app.js -> route -> controller -> PostgreSQL -> response
```

### `server/sql/`, `server/data/`, and `server/scripts/`

- `sql/` stores database schema changes that should be tracked by Git.
- `data/` stores version-controlled input data such as the course catalogue CSV.
- `scripts/` contains standalone tools. They are run from the terminal and are not API endpoints.

### Environment and generated files

- `.env` and `.env.local` contain real machine-specific values and must remain ignored.
- `.env.example` files contain safe placeholders and should be committed.
- `package.json` records dependencies and commands; `package-lock.json` records exact installed versions.
- `node_modules/`, `.next/`, and logs are generated locally and should not be committed.
