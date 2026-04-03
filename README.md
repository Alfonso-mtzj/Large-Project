# Large-Project
real-life D&amp;D skill builder — log workouts, study sessions, and social activities to level up your character stats. Built with the MERN stack.

## Contributors
[Alfonso Martinez](https://github.com/Alfonso-mtzj)
<br> [Alyssa Dambeck](https://github.com/AlyssaDambeck)
<br> [Grace Hawkins](https://github.com/Grace-1019)
<br> [Rachel Ross](https://github.com/ross-rachell)
<br> [Wade Zimmerle](https://github.com/WadeZimmerleUCF)

## Production Deployment (Option A — nginx proxy, same domain)

The frontend is served at `https://lifexpskilltree.xyz/` and all API calls are proxied through nginx to the Express backend on `localhost:5000`. Port 5000 does **not** need to be publicly exposed.

### Nginx configuration

Add a proxy block inside your existing `server {}` block:

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Frontend

In production the frontend uses relative API calls (no explicit `baseURL`), so requests automatically go to `https://lifexpskilltree.xyz/api/...` via the nginx proxy.

For local development, create `skilltree-frontend/.env.development` (already committed as an example):

```
VITE_API_BASE_URL=http://localhost:5000
```

Build for production:

```bash
cd skilltree-frontend
npm install
npm run build
# copy dist/ contents to /var/www/html on the server
```

### Backend environment variables

On the server, create `/var/cardsServer/.env` (do **not** commit this file). Use `skilltree-backend/.env.example` as a template:

| Variable | Description |
|---|---|
| `PORT` | Port Express listens on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `SMTP_USER` | Gmail address used for sending verification emails |
| `SMTP_PASS` | Gmail app password |
| `APP_BASE_URL` | Public base URL of the app, e.g. `https://lifexpskilltree.xyz` |
| `FRONTEND_URL` | Frontend URL for redirects, e.g. `https://lifexpskilltree.xyz` |

### Starting the backend with PM2

```bash
cd /var/cardsServer
npm install
pm2 start server.js --name express-server
pm2 save
pm2 startup systemd
```
