# Learnerweave API

The backend authentication and paths API service for learnerweave. A live web site is running here

https://www.learnerweave.space

## Quick start

### Prerequsites

- Node.js 18+
- npm package manager

### Installation

1. Clone the repo

```bash
git clone https://github.com/fanverseio/lw-auth.git
cd lw-auth
npm install
```

2. Envrionment variables
   .env file is saved in the final report (Appendix J)

Download the env file and save it in a .env file in the root folder.

3. Start the development server

```bash
npm run dev
```

or for production

```bash
npm start
```

## Library and frameworks used

"bcrypt": "^6.0.0",
"cors": "^2.8.5",
"crypto": "^1.0.1",
"dotenv": "^17.2.0",
"express": "^5.1.0",
"express-session": "^1.18.2",
"jsonwebtoken": "^9.0.2",
"nodemailer": "^7.0.5",
"passport": "^0.7.0",
"passport-google-oauth20": "^2.0.0",
"pg": "^8.16.3",
"postgres": "^3.4.7"

## API endpoints

### Authentication routes (/api/auth)

- POST /register - user registation with email
- POST /login - user login
- POST /verify-email - verify user email
- POST /resent-opt - sending OTP to user's eail
- POST /forgot-password - start forogot password process, send email to reset password
- POST /reset-password - resetting user password
- POST /update-profile - updating user profile
- GET /protected - testing user is authenticated
- GET /profile - get user profile
- GET /google - Google OAuth login
- GET /google/callback - Google OAuth callback

### Paths routes (/api/auth)

- GET /public - get all paths with puhlic flag
- GET /public/:id - get a path with id with a public flag
- GET / - get all paths
- GET /:id - get a path with path Id
- POST / - create a path
- PUT /:id - update a path with path Id
- DELETE /:id - delete a path with path Id
- GET /:id/data - Get a path's data (content)
- PUT /:id/data - update a path's data (content)
- POST /:id/copy - copy a public path
- PUT /:id/visibility - toggle a path's "visibility" status

### Health check

- GET /health - return 200 to confirm health check
- GET /db-test - test auth db is connected
- GET /supabase-test - test paths db is connected
