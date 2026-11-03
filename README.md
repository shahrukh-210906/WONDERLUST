# Wonderlust deployment

Use a Node.js web service with Node 22, build command `npm ci`, and start command `npm start`. No frontend build step is needed. Configure `/health` as the health check path. The server uses the host's `PORT` and binds to all interfaces.

Set `NODE_ENV=production`, `ATLASDB_URL`, `SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` in the hosting dashboard. See `.env.example` for names and formats; never commit actual credentials. Use a long random session secret. URL-encode special characters in the Atlas database password.

In MongoDB Atlas, permit the deployment service's outbound IP addresses and ensure the database user has read/write access to the selected database. The server waits for MongoDB before listening; connection failures exit with a nonzero status. Sessions share the database connection. HTTPS hosting must forward the original protocol through its reverse proxy for secure login cookies.

Run `npm test` to check public pages, authentication redirects, health checks, error pages, and upload storage without accessing external services.
