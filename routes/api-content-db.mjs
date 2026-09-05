/**
 * api-content-db.mjs — OPC-BĐS SQLite Storage Engine
 * Nguyệt Land Brand Channel Content Database
 * Schema: articles, videos, pipeline_runs, youtube_channels, users, leads
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdminAuth } from '../lib/security.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'opc_bds.db');

let _db = null;

export function getDb() {
    if (_db) return _db;
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    return _db;
}

export function checkpointDb() {
    try {
        if (_db) {
            _db.pragma('wal_checkpoint(PASSIVE)');
            console.log('[DB] 🧹 SQLite WAL checkpoint passive executed.');
        }
    } catch (e) {
        console.warn('[DB Checkpoint Warning]', e.message);
    }
}

function initSchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        slug            TEXT UNIQUE NOT NULL,
        title           TEXT NOT NULL,
        summary         TEXT,
        content         TEXT,
        location        TEXT,
        price           TEXT,
        cap_rate        TEXT,
        monthly_revenue TEXT,
        image_url       TEXT,
        youtube_url     TEXT,
        youtube_id      TEXT,
        category        TEXT DEFAULT 'market-news',
        tags            TEXT DEFAULT '[]',
        status          TEXT DEFAULT 'published',
        source_url      TEXT,
        author          TEXT DEFAULT 'Nguyệt Land AI',
        view_count      INTEGER DEFAULT 0,
        seo_title       TEXT,
        seo_description TEXT,
        publish_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_id         TEXT UNIQUE NOT NULL,
        title              TEXT,
        description        TEXT,
        channel_name       TEXT,
        channel_id         TEXT,
        thumbnail_url      TEXT,
        published_at       TEXT,
        duration           TEXT,
        ai_summary         TEXT,
        category           TEXT DEFAULT 'bds-news',
        relevance_score    REAL DEFAULT 0.8,
        linked_article_id  INTEGER,
        is_featured        INTEGER DEFAULT 0,
        created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pipeline_runs (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        run_type          TEXT NOT NULL,
        status            TEXT DEFAULT 'running',
        articles_created  INTEGER DEFAULT 0,
        videos_fetched    INTEGER DEFAULT 0,
        error_log         TEXT,
        details           TEXT DEFAULT '{}',
        ran_at            DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS youtube_channels (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id  TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        description TEXT,
        active      INTEGER DEFAULT 1,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        email       TEXT,
        phone       TEXT,
        role        TEXT DEFAULT 'VIP_INVESTOR',
        budget      TEXT DEFAULT '5 - 15 Tỷ',
        status      TEXT DEFAULT 'ACTIVE',
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id     TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        phone       TEXT NOT NULL,
        email       TEXT,
        property    TEXT,
        budget      TEXT,
        heat        TEXT DEFAULT 'WARM',
        source      TEXT DEFAULT 'bds.breaths.live',
        note        TEXT,
        email_step  INTEGER DEFAULT 1,
        status      TEXT DEFAULT 'NEW',
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_status   ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_created  ON articles(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_videos_published  ON videos(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_featured   ON videos(is_featured);
    CREATE INDEX IF NOT EXISTS idx_users_phone       ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_leads_phone       ON leads(phone);
    `);

    // Seed default BĐS channels
    const seedChannels = [
        { id: 'UCbds_dn_2026', name: 'BĐS Dòng Tiền Đà Nẵng', desc: 'Kênh tổng hợp BĐS Đà Nẵng' },
        { id: 'UCcafef_bds',   name: 'Cafef BĐS',              desc: 'Thị trường BĐS Việt Nam' },
        { id: 'UCndt_tv',      name: 'Nhà Đất TV',             desc: 'Tin tức nhà đất mới nhất' }
    ];
    const ins = db.prepare(`INSERT OR IGNORE INTO youtube_channels (channel_id, name, description) VALUES (?, ?, ?)`);
    for (const ch of seedChannels) ins.run(ch.id, ch.name, ch.desc);

    console.log('[DB] ✅ SQLite schema initialized — opc_bds.db ready at:', DB_PATH);
}

// ─── ARTICLE CRUD ────────────────────────────────────────────────────────────

export function upsertArticle(article) {
    const db = getDb();
    const slug = article.slug || slugify(article.title);
    const res = db.prepare(`
        INSERT INTO articles (slug, title, summary, content, location, price, cap_rate,
            monthly_revenue, image_url, youtube_url, youtube_id, category, tags, status,
            source_url, author, seo_title, seo_description, publish_at)
        VALUES (@slug,@title,@summary,@content,@location,@price,@cap_rate,
            @monthly_revenue,@image_url,@youtube_url,@youtube_id,@category,@tags,@status,
            @source_url,@author,@seo_title,@seo_description,@publish_at)
        ON CONFLICT(slug) DO UPDATE SET
            title=excluded.title, summary=excluded.summary, content=excluded.content,
            youtube_url=excluded.youtube_url, youtube_id=excluded.youtube_id,
            category=excluded.category, tags=excluded.tags, status=excluded.status,
            updated_at=CURRENT_TIMESTAMP
    `).run({
        slug,
        title:           article.title || '',
        summary:         article.summary || '',
        content:         article.content || '',
        location:        article.location || 'Đà Nẵng',
        price:           article.price || null,
        cap_rate:        article.cap_rate || null,
        monthly_revenue: article.monthly_revenue || null,
        image_url:       article.image_url || null,
        youtube_url:     article.youtube_url || null,
        youtube_id:      article.youtube_id || null,
        category:        article.category || 'market-news',
        tags:            JSON.stringify(article.tags || []),
        status:          article.status || 'published',
        source_url:      article.source_url || null,
        author:          article.author || 'Nguyệt Land AI',
        seo_title:       article.seo_title || article.title,
        seo_description: article.seo_description || article.summary,
        publish_at:      article.publish_at || new Date().toISOString()
    });
    return res;
}

export function getArticles({ page=1, limit=12, category=null, status='published' }={}) {
    const db = getDb();
    const offset = (page-1)*limit;
    let q = `SELECT * FROM articles WHERE status=?`;
    const p = [status];
    if (category) { q += ` AND category=?`; p.push(category); }
    q += ` ORDER BY publish_at DESC LIMIT ? OFFSET ?`;
    p.push(limit, offset);
    const articles = db.prepare(q).all(...p);
    const cntQ = `SELECT COUNT(*) as c FROM articles WHERE status=?${category?' AND category=?':''}`;
    const total = db.prepare(cntQ).get(...[status,...(category?[category]:[])]).c;
    return { articles, total, page, limit, pages: Math.ceil(total/limit) };
}

export function getArticleBySlug(slug) {
    const db = getDb();
    const a = db.prepare(`SELECT * FROM articles WHERE slug=?`).get(slug);
    if (a) db.prepare(`UPDATE articles SET view_count=view_count+1 WHERE slug=?`).run(slug);
    return a;
}

// ─── VIDEO CRUD ──────────────────────────────────────────────────────────────

export function upsertVideo(video) {
    const db = getDb();
    return db.prepare(`
        INSERT INTO videos (youtube_id,title,description,channel_name,channel_id,
            thumbnail_url,published_at,duration,ai_summary,category,relevance_score,is_featured)
        VALUES (@youtube_id,@title,@description,@channel_name,@channel_id,
            @thumbnail_url,@published_at,@duration,@ai_summary,@category,@relevance_score,@is_featured)
        ON CONFLICT(youtube_id) DO UPDATE SET
            ai_summary=excluded.ai_summary, is_featured=excluded.is_featured
    `).run({
        youtube_id:      video.youtube_id,
        title:           video.title || '',
        description:     video.description || '',
        channel_name:    video.channel_name || '',
        channel_id:      video.channel_id || '',
        thumbnail_url:   video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`,
        published_at:    video.published_at || new Date().toISOString(),
        duration:        video.duration || '',
        ai_summary:      video.ai_summary || '',
        category:        video.category || 'bds-news',
        relevance_score: video.relevance_score ?? 0.8,
        is_featured:     video.is_featured ? 1 : 0
    });
}

export function getVideos({ limit=6, featured=false }={}) {
    const db = getDb();
    let q = `SELECT * FROM videos`;
    if (featured) q += ` WHERE is_featured=1`;
    q += ` ORDER BY published_at DESC LIMIT ?`;
    return db.prepare(q).all(limit);
}

export function getYoutubeChannels() {
    return getDb().prepare(`SELECT * FROM youtube_channels WHERE active=1 ORDER BY name`).all();
}

export function upsertYoutubeChannel(ch) {
    return getDb().prepare(`
        INSERT INTO youtube_channels (channel_id,name,description,active)
        VALUES (@channel_id,@name,@description,1)
        ON CONFLICT(channel_id) DO UPDATE SET name=excluded.name, active=1
    `).run({ channel_id: ch.channel_id, name: ch.name, description: ch.description||'' });
}

// ─── PIPELINE LOG ────────────────────────────────────────────────────────────

export function logPipelineRun({ run_type, status, articles_created=0, videos_fetched=0, error_log=null, details={} }) {
    return getDb().prepare(`
        INSERT INTO pipeline_runs (run_type,status,articles_created,videos_fetched,error_log,details)
        VALUES (?,?,?,?,?,?)
    `).run(run_type, status, articles_created, videos_fetched, error_log, JSON.stringify(details));
}

export function getStats() {
    const db = getDb();
    return {
        totalArticles: db.prepare(`SELECT COUNT(*) as c FROM articles WHERE status='published'`).get()?.c || 0,
        totalVideos:   db.prepare(`SELECT COUNT(*) as c FROM videos`).get()?.c || 0,
        totalViews:    db.prepare(`SELECT SUM(view_count) as s FROM articles`).get()?.s || 0,
        todayArticles: db.prepare(`SELECT COUNT(*) as c FROM articles WHERE date(created_at)=date('now')`).get()?.c || 0,
        lastRun:       db.prepare(`SELECT * FROM pipeline_runs ORDER BY ran_at DESC LIMIT 1`).get()
    };
}

// ─── USER & LEAD CRUD ─────────────────────────────────────────────────────────

export function upsertUser(user) {
    const db = getDb();
    const userId = user.user_id || 'USR_' + Date.now().toString(36).toUpperCase();
    return db.prepare(`
        INSERT INTO users (user_id, name, email, phone, role, budget, status)
        VALUES (@user_id, @name, @email, @phone, @role, @budget, @status)
        ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            phone = excluded.phone,
            role = excluded.role,
            budget = excluded.budget,
            status = excluded.status
    `).run({
        user_id: userId,
        name: user.name || 'Nhà Đầu Tư VIP',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'VIP_INVESTOR',
        budget: user.budget || '5 - 15 Tỷ',
        status: user.status || 'ACTIVE'
    });
}

export function getUsers({ limit = 50 } = {}) {
    const db = getDb();
    return db.prepare(`SELECT * FROM users ORDER BY created_at DESC LIMIT ?`).all(limit);
}

export function upsertLeadDb(lead) {
    const db = getDb();
    const leadId = lead.lead_id || 'LEAD_' + Date.now().toString(36).toUpperCase();
    return db.prepare(`
        INSERT INTO leads (lead_id, name, phone, email, property, budget, heat, source, note, email_step, status)
        VALUES (@lead_id, @name, @phone, @email, @property, @budget, @heat, @source, @note, @email_step, @status)
        ON CONFLICT(lead_id) DO UPDATE SET
            status = excluded.status,
            email_step = excluded.email_step
    `).run({
        lead_id: leadId,
        name: lead.name || 'Nhà Đầu Tư VIP',
        phone: lead.phone || '',
        email: lead.email || '',
        property: lead.property || lead.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng',
        budget: lead.budget || '5 - 15 Tỷ',
        heat: lead.heat || 'WARM',
        source: lead.source || 'bds.breaths.live',
        note: lead.note || '',
        email_step: lead.email_step || 1,
        status: lead.status || 'NEW'
    });
}

export function getLeadsDb({ limit = 50 } = {}) {
    const db = getDb();
    return db.prepare(`SELECT * FROM leads ORDER BY created_at DESC LIMIT ?`).all(limit);
}

// ─── HTTP HANDLERS ───────────────────────────────────────────────────────────

export function handleContentApi(req, res) {
    const url = new URL(req.url, `http://localhost`);
    const p = url.pathname;
    try {
        if (p === '/api/content/articles') {
            return jsonOk(res, getArticles({
                page:     parseInt(url.searchParams.get('page')||'1'),
                limit:    parseInt(url.searchParams.get('limit')||'12'),
                category: url.searchParams.get('category'),
                status:   url.searchParams.get('status')||'published'
            }));
        }
        if (p.startsWith('/api/content/articles/')) {
            const slug = p.replace('/api/content/articles/','');
            const article = getArticleBySlug(slug);
            return article ? jsonOk(res, article) : jsonError(res, 404, 'Không tìm thấy bài viết');
        }
        if (p === '/api/content/videos') {
            return jsonOk(res, getVideos({
                limit:    parseInt(url.searchParams.get('limit')||'6'),
                featured: url.searchParams.get('featured')==='1'
            }));
        }
        if (p === '/api/content/stats')    return jsonOk(res, getStats());
        if (p === '/api/content/channels') return jsonOk(res, getYoutubeChannels());
        if (p === '/api/content/leads') {
            const admin = requireAdminAuth(req, res);
            if (!admin) return;
            return jsonOk(res, getLeadsDb({ limit: 50 }));
        }
        if (p === '/api/content/users') {
            const admin = requireAdminAuth(req, res);
            if (!admin) return;
            return jsonOk(res, getUsers({ limit: 50 }));
        }
        jsonError(res, 404, 'Endpoint không tồn tại');
    } catch (err) {
        console.error('[ContentDB API]', err);
        jsonError(res, 500, err.message);
    }
}

export function handleContentPost(req, res) {
    let body = '';
    req.on('data', c => {
        body += c;
        if (body.length > 50000) {
            jsonError(res, 413, 'Payload quá lớn');
            req.destroy();
        }
    });
    req.on('end', () => {
        const url = new URL(req.url, 'http://localhost');
        const p = url.pathname;
        try {
            const data = JSON.parse(body||'{}');
            if (p === '/api/content/articles') {
                if (!data.title) return jsonError(res, 400, 'title là bắt buộc');
                const slug = data.slug || slugify(data.title);
                upsertArticle({ ...data, slug });
                return jsonOk(res, { success:true, slug, message:'Bài viết đã lưu!' });
            }
            if (p === '/api/content/channels') {
                if (!data.channel_id||!data.name) return jsonError(res, 400, 'Thiếu channel_id hoặc name');
                upsertYoutubeChannel(data);
                return jsonOk(res, { success:true, message:'Kênh YouTube đã thêm!' });
            }
            if (p === '/api/content/videos') {
                if (!data.youtube_id) return jsonError(res, 400, 'Thiếu youtube_id');
                upsertVideo(data);
                return jsonOk(res, { success:true, message:'Video đã lưu!' });
            }
            jsonError(res, 404, 'Endpoint không tồn tại');
        } catch (err) { jsonError(res, 500, err.message); }
    });
}

function jsonOk(res, data) {
    res.writeHead(200, { 'Content-Type':'application/json;charset=utf-8', 'Cache-Control':'no-cache' });
    res.end(JSON.stringify(data));
}
function jsonError(res, code, msg) {
    res.writeHead(code, { 'Content-Type':'application/json;charset=utf-8' });
    res.end(JSON.stringify({ success:false, message:msg }));
}

export function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function slugify(text, addRandom = false) {
    let clean = (text || 'article')
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g,'a')
        .replace(/[èéẹẻẽêềếệểễ]/g,'e')
        .replace(/[ìíịỉĩ]/g,'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,'o')
        .replace(/[ùúụủũưừứựửữ]/g,'u')
        .replace(/[ỳýỵỷỹ]/g,'y')
        .replace(/đ/g,'d')
        .replace(/[^a-z0-9\s-]/g,'')
        .replace(/\s+/g,'-')
        .replace(/-+/g,'-')
        .replace(/^-|-$/g,'')
        .substring(0, 80);

    if (addRandom) {
        clean += '-' + Date.now().toString(36);
    }
    return clean || 'bds-danang';
}

// STA-06 FIX: Graceful DB shutdown to prevent WAL corruption
function gracefulDbShutdown(signal) {
    if (_db) {
        try {
            _db.pragma('wal_checkpoint(TRUNCATE)');
            _db.close();
            console.log(`[DB] ✅ Database closed gracefully on ${signal}.`);
        } catch (e) {
            console.error(`[DB] Error during graceful shutdown:`, e.message);
        }
        _db = null;
    }
    process.exit(0);
}

process.on('SIGINT', () => gracefulDbShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulDbShutdown('SIGTERM'));
