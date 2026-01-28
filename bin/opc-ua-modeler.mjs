#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {
    host: '127.0.0.1',
    port: 4173,
    dir: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--host') args.host = argv[++i] ?? args.host;
    else if (a === '--port' || a === '-p') args.port = Number(argv[++i] ?? args.port);
    else if (a === '--dir') args.dir = argv[++i] ?? args.dir;
  }

  return args;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    case '.txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const stripped = decoded.replace(/^\/+/, '');
  const full = path.resolve(root, stripped);
  const rootResolved = path.resolve(root);
  if (!full.startsWith(rootResolved)) return null;
  return full;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  // eslint-disable-next-line no-console
  console.log(`opc-ua-modeler

Serve the built web app (./dist) over HTTP.

Usage:
  opc-ua-modeler [--host 127.0.0.1] [--port 4173] [--dir ./dist]

Options:
  --host        Host to bind (default: 127.0.0.1)
  --port, -p    Port to listen on (default: 4173)
  --dir         Directory to serve (default: <package>/dist)
  --help, -h    Show help
`);
  process.exit(0);
}

const distDir = args.dir ? path.resolve(process.cwd(), args.dir) : path.resolve(__dirname, '..', 'dist');
const indexHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  // eslint-disable-next-line no-console
  console.error(`Cannot find ${indexHtml}.

If you cloned the repo, run:
  npm install
  npm run build
  npm run preview

If you installed from a package tarball, ensure the tarball includes the dist/ folder.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = req.url ?? '/';

    // Serve index.html for SPA routes when file doesn't exist
    const candidate = safeJoin(distDir, urlPath);
    const servePath = candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
      ? candidate
      : indexHtml;

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(servePath));
    fs.createReadStream(servePath).pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
});

server.listen(args.port, args.host, () => {
  // eslint-disable-next-line no-console
  console.log(`OPC UA Modeler running at http://${args.host}:${args.port}`);
});
