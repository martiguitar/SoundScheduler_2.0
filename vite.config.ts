import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
  },
  configureServer(server) {
    // Mock endpoint for login
    server.middlewares.use('/server/api/login.php', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end('Method Not Allowed')
        return
      }
      
      let body = ''
      req.on('data', (chunk) => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}')
          // Mock successful login response
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ 
            ok: true, 
            token: 'demo-token', 
            user: { 
              email: data?.email || 'guest@ton.band',
              id: 1,
              name: 'Demo User'
            } 
          }))
        } catch (e) {
          res.statusCode = 400
          res.end('Bad Request')
        }
      })
    })
    
    // Mock health endpoint
    server.middlewares.use('/server/health.php', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true, ts: Date.now() }))
    })
  }
});