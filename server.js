// Standalone Node.js server untuk produksi
// Menjalankan backend proxy AI di /api/chat dan menyajikan file statis dari folder dist/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processAIChat } from './server/aiProxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Baca .env jika ada
const envPath = path.join(__dirname, '.env');
const env = { ...process.env };
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!env[key]) env[key] = val;
      }
    }
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  // 1. API endpoint /api/chat
  if (req.url?.startsWith('/api/chat')) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Gunakan metode POST.' }));
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
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Daftar pesan tidak valid.' }));
          return;
        }
        const result = await processAIChat(payload.messages, env, payload.machineContext);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(err.status || 500, { 'Content-Type': 'application/json' });
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

  // 2. Static file serving dari dist/
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Aplikasi belum dibuild. Jalankan npm run build terlebih dahulu.');
  }
});

server.listen(PORT, () => {
  console.log(`Server Getara berjalan di http://localhost:${PORT}`);
});
