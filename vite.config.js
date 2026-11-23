import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { processAIChat } from './server/aiProxy.js';

function aiProxyPlugin(env) {
  const handler = async (req, res, next) => {
    if (req.url?.startsWith('/api/chat')) {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Metode tidak diizinkan (Gunakan POST).' }));
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          if (!payload.messages || !Array.isArray(payload.messages)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Format pesan (messages) tidak valid.' }));
            return;
          }
          const result = await processAIChat(payload.messages, env);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = err.status || 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: err.message || 'Terjadi kesalahan pada AI.',
              provider: err.provider,
              code: err.code,
            })
          );
        }
      });
      return;
    }
    next();
  };

  return {
    name: 'ai-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const combinedEnv = { ...process.env, ...env };

  return {
    plugins: [react(), tailwindcss(), aiProxyPlugin(combinedEnv)],
  };
});
