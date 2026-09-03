# Project Structure

```text
cgpa_pilot_bpgc/
|-- client/                    Next.js frontend
|   |-- app/                   Pages, layouts, styles, and the API proxy
|   |-- lib/                   Shared browser-side helpers
|   |-- public/                Static images and icons
|   `-- package.json           Frontend dependencies and commands
|
|-- server/                    Express backend
|   |-- src/
|   |   |-- config/            Database and authentication settings
|   |   |-- controllers/       Request handling and database queries
|   |   |-- middleware/        Authentication, security, and error handling
|   |   |-- routes/            API endpoint definitions
|   |   |-- utils/             Shared calculation helpers
|   |   |-- validation/        Zod request schemas
|   |   |-- app.js             Express application setup
|   |   `-- server.js          API entry point
|   |-- sql/                   Ordered database migrations
|   |-- data/                  Course catalogue source data
|   |-- scripts/               Migration, seed, and database test tools
|   |-- test/                  Backend automated tests
|   `-- package.json           Backend dependencies and commands
|
|-- .github/                   CI, issue templates, and pull-request template
|-- README.md                  Project overview and setup guide
`-- LICENSE                    MIT license
```

Local `.env` files contain secrets and are ignored by Git. The committed `.env.example` files document the required settings.
