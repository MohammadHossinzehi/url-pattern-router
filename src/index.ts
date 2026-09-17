export interface RouteParams {
    [key: string]: string | string[];
}

export interface Route {
    pattern: string;
    regex?: RegExp;
    paramNames: string[];
    handler?: (params: RouteParams) => void;
}

export interface MatchResult {
    matched: boolean;
    params: RouteParams;
    route?: Route;
}

export class URLRouter {
    private routes: Route[] = [];

  addRoute(pattern: string, handler?: (params: RouteParams) => void): void {
        const route = this.parsePattern(pattern);
        route.handler = handler;
        this.routes.push(route);
  }

  match(url: string): MatchResult {
        for (const route of this.routes) {
                if (route.regex) {
                          const m = route.regex.exec(url);
                          if (m) {
                                      const params = this.extractParams(route, m);
                                      return { matched: true, params, route };
                          }
                }
        }
        return { matched: false, params: {} };
  }

  matchAll(url: string): MatchResult[] {
        const results: MatchResult[] = [];
        for (const route of this.routes) {
                if (route.regex) {
                          const m = route.regex.exec(url);
                          if (m) {
                                      const params = this.extractParams(route, m);
                                      results.push({ matched: true, params, route });
                          }
                }
        }
        return results;
  }

  route(url: string): void {
        const result = this.match(url);
        if (result.matched && result.route?.handler) {
                result.route.handler(result.params);
        }
  }

  private parsePattern(pattern: string): Route {
        const paramNames: string[] = [];
        let regexPattern = pattern;

      if (regexPattern.startsWith('/') && regexPattern.endsWith('/')) {
              const regexStr = regexPattern.slice(1, -1);
              return {
                        pattern,
                        regex: new RegExp(`^${regexStr}$`),
                        paramNames: [],
              };
      }

      regexPattern = regexPattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\\:/g, ':')
          .replace(/\\\*/g, '*');

      regexPattern = regexPattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
              paramNames.push(name);
              return '([^/]+)';
      });

      regexPattern = regexPattern.replace(/\*/g, '.*');
        regexPattern = `^${regexPattern}$`;

      return {
              pattern,
              regex: new RegExp(regexPattern),
              paramNames,
      };
  }

  private extractParams(route: Route, match: RegExpExecArray): RouteParams {
        const params: RouteParams = {};
        for (let i = 0; i < route.paramNames.length; i++) {
                const name = route.paramNames[i];
                params[name] = match[i + 1];
        }
        return params;
  }
}

export function createRouter(): URLRouter {
    return new URLRouter();
}
