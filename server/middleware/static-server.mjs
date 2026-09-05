/**
 * server/middleware/static-server.mjs — High-Performance Static File Server
 * Features: Path Traversal Shield, MIME Resolver, ETag Caching & HTTP 304 Not Modified.
 */
import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8'
};

export function serveStaticFile(req, res, targetRelPath, rootDir) {
    const cleanRelPath = (targetRelPath || '').replace(/^[/\\]+/, '');
    const resolvedRoot = path.resolve(rootDir);
    let filePath = path.resolve(resolvedRoot, cleanRelPath);

    // Defense-in-depth against Path Traversal
    if (!filePath.startsWith(resolvedRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: Access Denied');
        return true;
    }

    if (!fs.existsSync(filePath)) {
        return false; // Let router handle 404
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        if (!fs.existsSync(filePath)) return false;
    }

    const fileStat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // HTTP 1.1 ETag generation (mtime + size)
    const etag = `W/"${fileStat.size.toString(16)}-${fileStat.mtime.getTime().toString(16)}"`;
    if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, {
            'ETag': etag,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
        });
        res.end();
        return true;
    }

    const headers = {
        'Content-Type': contentType,
        'Content-Length': fileStat.size,
        'ETag': etag,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff'
    };

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
    return true;
}
