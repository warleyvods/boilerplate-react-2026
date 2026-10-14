import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

function getApiUrl(): string {
    return process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
        : 'http://localhost:8080';
}

/**
 * Lê o `exp` do access token SEM verificar a assinatura.
 *
 * Isto NÃO é autorização: serve só como dica para decidir redirects (evitar
 * mandar para /dashboard quem tem um token já expirado, ou tentar o refresh
 * antes de renderizar). Quem decide se o token vale é a API, que valida a
 * assinatura em toda requisição.
 */
function looksUnexpired(token: string): boolean {
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        return !!exp && exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

/**
 * Redirect que preserva o idioma. Com `localePrefix: 'never'` a URL não carrega
 * o locale (ele vive no cookie NEXT_LOCALE), então basta repassar os cookies
 * que o next-intl definiu nesta resposta.
 */
function redirectTo(path: string, request: NextRequest, i18nResponse: NextResponse) {
    const response = NextResponse.redirect(new URL(path, request.url));
    i18nResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Run I18n
    const i18nResponse = handleI18n(request);

    if (i18nResponse.status === 307 || i18nResponse.status === 308) {
        return i18nResponse;
    }

    // 2. Auth Logic
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const csrfToken = request.cookies.get('csrf_token')?.value;

    const localeRegex = new RegExp(`^/(${routing.locales.join('|')})`);
    const pathWithoutLocale = pathname.replace(localeRegex, '') || '/';

    const publicRoutes = [
        '/', '/login', '/signup',
        '/forgot-password', '/reset-password',
        '/email-verification', '/verify-email',
    ];

    const oauthRoutes = [
        '/oauth2/authorization',
        '/login/oauth2/code'
    ];

    const isPublic = publicRoutes.includes(pathWithoutLocale);
    const isOauth = oauthRoutes.some(route => pathWithoutLocale.startsWith(route));

    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
        return i18nResponse;
    }

    if (isOauth) return i18nResponse;

    if (isPublic) {
        if (accessToken && looksUnexpired(accessToken)) {
            return redirectTo('/dashboard', request, i18nResponse);
        }
        return i18nResponse;
    }

    if (!accessToken && !refreshToken) {
        return redirectTo('/login', request, i18nResponse);
    }

    if (accessToken && looksUnexpired(accessToken)) {
        return i18nResponse;
    }

    if (refreshToken && csrfToken) {
        try {
            const apiUrl = getApiUrl();
            const refreshResponse = await fetch(`${apiUrl}/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                    'Cookie': `refresh_token=${refreshToken}; csrf_token=${csrfToken}`
                },
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                const setCookieHeaders = refreshResponse.headers.getSetCookie();
                setCookieHeaders.forEach(cookieString => {
                    i18nResponse.headers.append('Set-Cookie', cookieString);
                });
                return i18nResponse;
            } else {
                return redirectTo('/login', request, i18nResponse);
            }
        } catch {
            return redirectTo('/login', request, i18nResponse);
        }
    }

    return redirectTo('/login', request, i18nResponse);
}

export const config = {
    matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)']
};
