'use client';

import { getApiUrlDynamic } from '@/lib/api-config';

/**
 * Inicia o fluxo de login OAuth2
 * Redireciona o usuário para o endpoint de autorização do backend
 */
export function initiateOAuth2Login(provider: string) {
    const apiUrl = getApiUrlDynamic();
    const authUrl = `${apiUrl}/oauth2/authorization/${provider}`;

    // Redireciona para o backend que irá iniciar o fluxo OAuth2
    // authUrl é absoluta (backend), não uma página do Next
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(authUrl);
}

/**
 * Retorna o ícone do provider como emoji (fallback)
 */
export function getProviderIcon(provider: string): string {
    switch (provider.toLowerCase()) {
        case 'google':
            return '🔵';
        case 'github':
            return '⚫';
        case 'facebook':
            return '🔵';
        case 'microsoft':
            return '🟦';
        default:
            return '🔗';
    }
}

/**
 * Retorna o nome formatado do provider
 */
export function getProviderName(provider: string): string {
    switch (provider.toLowerCase()) {
        case 'google':
            return 'Google';
        case 'github':
            return 'GitHub';
        case 'facebook':
            return 'Facebook';
        case 'microsoft':
            return 'Microsoft';
        default:
            return provider;
    }
}
