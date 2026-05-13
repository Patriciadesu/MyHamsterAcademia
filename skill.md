1. Do only what i order
2. Write Changes in every commit as skill.md

## Commit: Separate frontend and backend
- Created frontend and backend directories.
- Moved all React/Vite webapp files (including node_modules) into the frontend directory.
- Initialized backend directory and copied .gitignore to root.

## Commit: Setup backend server and root workspace
- Added Express and CORS backend server.
- Connected React frontend to fetch data from backend.
- Created root package.json with concurrently to run both.

## Commit: Create Log in with discord page
- Replaced frontend UI with a Discord login page styling.
- Added Discord SVG logo and brand colors.
- Implemented "Log in with Discord" button.

## Commit: Use pm2 to run frontend and backend
- Replaced concurrently with pm2 in root package.json.
- Created ecosystem.config.js to manage frontend (Vite) and backend (Express) processes.

## Commit: Create .env file
- Added backend/.env file with MongoDB connection string, frontend URL, Discord placeholders, and necessary vars.
- Updated .gitignore to exclude .env files to ensure security.

## Commit: Host website at frontend URL
- Updated Vite config to build for /myhamsteracademia/ base path and output to /var/www/myhamsteracademia.
- Added Nginx location block for /myhamsteracademia/ pointing to the build directory.

## Commit: Fix Nginx trailing slash routing
- Added exact match location block to automatically redirect /myhamsteracademia to /myhamsteracademia/ so it doesn't return 404.

## Commit: Make Discord login work and add main page
- Implemented Discord OAuth2 endpoints in the Express backend using axios and jsonwebtoken.
- Added Nginx proxy for /myhamsteracademia/api/ to route to backend on port 3000.
- Updated frontend to use React Router with a /main route showing user's Discord info after successful authentication.

## Commit: Update Discord callback variable
- Updated server.js to read from DISCORD_CALLBACK_URL environment variable as requested.
