import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.webm': 'video/webm', '.json': 'application/json' };

const server = http.createServer(async (request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end('{"ok":true}');
    return;
  }
  const pathname = request.url === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname;
  const filePath = path.join(root, pathname);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const info = await stat(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store'
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(4173, '127.0.0.1');
