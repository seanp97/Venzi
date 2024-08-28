/* VenziJS created by Sean Pelser */

import http from 'http';
import { parse } from 'url';

class Venzi {
    constructor() {
        this.routes = {
            'GET': [],
            'POST': [],
            'PUT': [],
            'DELETE': [],
            'PATCH': [],
            'OPTIONS': [],
            'HEAD': [],
            'ALL': []
        };
        this.middlewares = [];
        this._server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    handleRequest(req, res) {
        const { method, url } = req;
        const { pathname, query } = parse(url, true);

        const context = {
            req,
            res,
            pathname,
            query,
            header: (name) => this.getHeader(req, name),
            status: (code) => this.status(res, code),
            notFound: () => this.notFound(res),
            text: (body) => this.text(res, body),
            json: (body) => this.json(res, body),
            html: (body) => this.html(res, body),
            params: {},
        };

        let index = 0;

        const next = () => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                if (middleware.length === 3) {
                    middleware(req, res, next);
                } else {
                    middleware(context, next);
                }
            } else {
                this.handleRoute(context, method, pathname);
            }
        };

        next();
    }

    handleRoute(context, method, pathname) {
        const matchedRoute = this.matchRoute(method, pathname) ||
            this.matchRoute('ALL', pathname);

        if (matchedRoute) {
            const { handler, params = {} } = matchedRoute;

            context.params = params;

            handler(context);
        } else {
            this.notFound(context.res);
        }
    }

    matchRoute(method, pathname) {
        const routes = this.routes[method] || [];

        for (let route of routes) {
            const { path, handler } = route;
            const paramNames = [];
            const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
                paramNames.push(paramName);
                return '([^/]+)';
            });

            const regex = new RegExp(`^${regexPath}$`);
            const match = pathname.match(regex);

            if (match) {
                const params = paramNames.reduce((acc, paramName, index) => {
                    acc[paramName] = match[index + 1];
                    return acc;
                }, {});

                return { handler, params };
            }
        }

        return null;
    }

    getHeader(req, name) {
        return req.headers[name.toLowerCase()];
    }

    text(res, body) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(body);
    }

    json(res, body) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
    }

    html(res, body) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(body);
    }

    status(res, code) {
        res.statusCode = code;
        return this;
    }

    notFound(res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }

    options(path, handler) {
        this.routes['OPTIONS'].push({ path, handler });
    }

    head(path, handler) {
        this.routes['HEAD'].push({ path, handler });
    }

    all(path, handler) {
        this.routes['ALL'].push({ path, handler });
    }

    get(path, handler) {
        this.routes['GET'].push({ path, handler });
    }

    post(path, handler) {
        this.routes['POST'].push({ path, handler });
    }

    put(path, handler) {
        this.routes['PUT'].push({ path, handler });
    }

    delete(path, handler) {
        this.routes['DELETE'].push({ path, handler });
    }

    patch(path, handler) {
        this.routes['PATCH'].push({ path, handler });
    }

    listen(port, callback) {
        this._server.listen(port, callback);
    }
}

export default Venzi;