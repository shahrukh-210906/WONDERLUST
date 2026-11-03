# Wonderlust deployment

Use a Node.js web service with Node 22, build command `npm ci`, and start command `npm start`. No frontend build step is needed. Configure `/health` as the health check path. The server uses the host's `PORT` and binds to all interfaces.

Set `NODE_ENV=production`, `ATLASDB_URL`, `SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` in the hosting dashboard. See `.env.example` for names and formats; never commit actual credentials. Use a long random session secret. URL-encode special characters in the Atlas database password.

In MongoDB Atlas, permit the deployment service's outbound IP addresses and ensure the database user has read/write access to the selected database. The server waits for MongoDB before listening; connection failures exit with a nonzero status. Sessions share the database connection. HTTPS hosting must forward the original protocol through its reverse proxy for secure login cookies.

Run `npm test` to check public pages, authentication redirects, health checks, error pages, and upload storage without accessing external services.

## Admin and demo catalog

Create or promote the deployment admin with one-time environment variables `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 14 characters), alongside `ATLASDB_URL`:

```powershell
$env:ADMIN_USERNAME = "your-admin-name"
$env:ADMIN_EMAIL = "you@example.com"
$env:ADMIN_PASSWORD = "use-a-unique-long-password"
npm run admin:create
```

Use a secure local environment or the hosting dashboard; do not commit the values. Existing user signup always creates a regular account. Once logged in with the admin account, use **Import 100 demo stays** on the listings page. The import is repeatable and leaves other listings untouched. Demo stays are clearly marked as fictional previews and cannot be booked. The demo photos use Unsplash image URLs.
