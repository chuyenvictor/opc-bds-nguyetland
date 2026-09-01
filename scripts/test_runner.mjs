import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..');

console.log('[Test Runner] Khởi động server nền...');
const srv = spawn('node', ['serve_local.mjs'], { cwd: appDir, stdio: 'pipe' });

srv.stdout.on('data', (d) => {
    // console.log('[Server]', d.toString());
});
srv.stderr.on('data', (d) => {
    console.error('[Server Error]', d.toString());
});

// Chờ 2 giây cho server bind port 8088
setTimeout(() => {
    console.log('[Test Runner] Bắt đầu chạy bộ kiểm thử E2E...');
    try {
        const out = execSync('node scripts/run_full_az_test_and_deploy.mjs', { cwd: appDir, encoding: 'utf8' });
        console.log(out);
    } catch (err) {
        console.log(err.stdout || err.message);
    } finally {
        srv.kill();
        process.exit(0);
    }
}, 2500);
