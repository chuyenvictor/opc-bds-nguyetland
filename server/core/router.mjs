/**
 * server/core/router.mjs — Lightweight, High-Speed SaaS HTTP Router
 * Features: Route Grouping, Parameter Matching, Middleware Pipelines.
 */

export class Router {
    constructor(prefix = '') {
        this.prefix = prefix.replace(/\/+$/, '');
        this.routes = [];
        this.middlewares = [];
    }

    use(middlewareOrRouter) {
        if (middlewareOrRouter instanceof Router) {
            // Merge sub-router
            for (const r of middlewareOrRouter.routes) {
                this.routes.push({
                    method: r.method,
                    pattern: this.prefix + r.pattern,
                    regex: this._compilePattern(this.prefix + r.pattern),
                    handlers: [...this.middlewares, ...r.handlers]
                });
            }
        } else if (typeof middlewareOrRouter === 'function') {
            this.middlewares.push(middlewareOrRouter);
        }
        return this;
    }

    get(path, ...handlers) {
        return this._addRoute('GET', path, handlers);
    }

    post(path, ...handlers) {
        return this._addRoute('POST', path, handlers);
    }

    put(path, ...handlers) {
        return this._addRoute('PUT', path, handlers);
    }

    delete(path, ...handlers) {
        return this._addRoute('DELETE', path, handlers);
    }

    _addRoute(method, path, handlers) {
        const fullPath = this.prefix + (path.startsWith('/') ? path : '/' + path);
        this.routes.push({
            method: method.toUpperCase(),
            pattern: fullPath,
            regex: this._compilePattern(fullPath),
            handlers: [...this.middlewares, ...handlers]
        });
        return this;
    }

    _compilePattern(pattern) {
        const paramNames = [];
        const regexStr = pattern
            .replace(/\/+$/, '')
            .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
                paramNames.push(name);
                return '([^/]+)';
            });
        return {
            regex: new RegExp(`^${regexStr || '/'}/?$`),
            paramNames
        };
    }

    async handle(req, res, pathname) {
        const method = req.method.toUpperCase();
        for (const route of this.routes) {
            if (route.method !== method && route.method !== 'ALL') continue;

            const match = pathname.match(route.regex.regex);
            if (match) {
                const params = {};
                route.regex.paramNames.forEach((name, idx) => {
                    params[name] = decodeURIComponent(match[idx + 1]);
                });
                req.params = params;

                // Execute handlers sequentially
                for (const handler of route.handlers) {
                    let handled = false;
                    await handler(req, res, () => { handled = true; });
                    if (!handled) return true; // Request completed by handler
                }
                return true;
            }
        }
        return false; // Not matched
    }
}
