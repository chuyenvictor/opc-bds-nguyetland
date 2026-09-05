/**
 * lib/load-env.mjs — Synchronous Environment Loader for ES Modules
 * Ensures process.env is fully populated before any module executes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.join(__dirname, '..');

export function loadEnvironment() {
    const envPaths = [
        path.join(appRoot, '.env'),
        path.join(appRoot, '.env.local'),
        path.join(appRoot, '..', '..', '.env')
    ];

    for (const envPath of envPaths) {
        if (!fs.existsSync(envPath)) continue;
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx === -1) continue;
                const k = trimmed.slice(0, eqIdx).trim();
                const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                if (k && process.env[k] === undefined) {
                    process.env[k] = v;
                }
            }
        } catch (err) {
            console.warn(`[load-env] Warning reading ${envPath}:`, err.message);
        }
    }
}

// Auto-run immediately upon module import
loadEnvironment();
