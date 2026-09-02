import fs from 'fs';
import path from 'path';

const dirs = [
  'e:/OPC-BĐS/apps/nguyet-land-bds/public/p',
  'e:/OPC-BĐS/apps/nguyet-land-bds/p'
];

const targetFontLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&display=swap" rel="stylesheet">`;

const targetStyle = `<style>
        body { font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0f1a; color: #f1f5f9; }
        .font-sans { font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .glass { background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .article-body h2 { font-size: 1.35rem; font-weight: 800; color: #fbbf24; margin-top: 1.75rem; margin-bottom: 0.75rem; font-family: 'Be Vietnam Pro', sans-serif; }
        .article-body p { margin-bottom: 1rem; line-height: 1.75; color: #cbd5e1; font-size: 0.95rem; }
        .article-body ul, .article-body ol { margin-left: 1.5rem; margin-bottom: 1rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; }
        .article-body li { margin-bottom: 0.5rem; }
    </style>`;

let count = 0;
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  files.forEach(f => {
    const fp = path.join(dir, f);
    let content = fs.readFileSync(fp, 'utf8');
    
    // Replace font link
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]+" rel="stylesheet">/g, targetFontLink);
    
    // Replace style block
    content = content.replace(/<style>[\s\S]*?body \{ font-family: 'Inter'[\s\S]*?<\/style>/g, targetStyle);
    
    fs.writeFileSync(fp, content, 'utf8');
    count++;
  });
});

console.log(`[Font Fix Engine] Successfully standardized typography across ${count} article pages!`);
