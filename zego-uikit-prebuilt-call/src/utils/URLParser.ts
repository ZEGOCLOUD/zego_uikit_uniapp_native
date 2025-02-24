
export class URLParser {
    static append(path: string, params: Record<string, any>): string {
        const base = path.includes('?') ? path : `${path}?`;
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        return queryString ? `${base}${queryString}` : path;
    }

    static parse(path: string): Record<string, any> {
        const params: Record<string, any> = {};
        const queryString = path.split('?')[1];
        if (queryString) {
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    params[key] = params[key] ? [...(params[key] as string[]), value] : value;
                }
            });
        }
        return params;
    }
}