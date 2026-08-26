# Free Fire Tournament Registration Website

## Features
- Team name + exactly 4 players
- Public registration page
- Registered team list
- Admin login/dashboard
- Edit tournament name, date, time, prize pool, banner text and rules
- Delete registrations
- Export registrations to CSV
- Data stored in `data/database.json`

## Run on Windows
1. Install Node.js (LTS).
2. Extract this ZIP.
3. Open the project folder.
4. In the folder address bar type `cmd` and press Enter.
5. Run:
   npm install
   npm start
6. Open: http://localhost:3000
7. Admin panel: http://localhost:3000/admin.html

Default admin password:
NSCJ@yed

IMPORTANT: Change the password in `server.js` or use the environment variable `ADMIN_PASSWORD` before publishing the site online.

## Online publishing
This version is ready for a Node.js hosting service. The `data/database.json` file is local to the server, so for a serious/high-traffic tournament you should later move the teams database to a hosted database such as Supabase/PostgreSQL.
