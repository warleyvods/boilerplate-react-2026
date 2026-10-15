import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { useUserStore, type User } from '@/stores/useUserStore';
import { useCurrentUser } from './use-current-user';

vi.mock('@/lib/api', () => ({ api: { get: vi.fn() } }));

const user: User = {
    id: 1,
    name: 'Maria',
    login: 'maria',
    email: 'maria@example.com',
    admin: false,
    active: true,
    createdAt: '2026-10-14T00:00:00Z',
};

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCurrentUser', () => {
    beforeEach(() => {
        vi.mocked(api.get).mockReset();
        useUserStore.setState({ user: null, isAuthenticated: false });
    });

    it('busca /v1/users/me mesmo sem nada no localStorage (sessão é cookie httpOnly)', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: user });

        const { result } = renderHook(() => useCurrentUser(), { wrapper });

        await waitFor(() => expect(result.current.user).toEqual(user));
        expect(api.get).toHaveBeenCalledWith('/v1/users/me');
        expect(useUserStore.getState()).toMatchObject({ user, isAuthenticated: true });
    });

    it('limpa o store quando a API responde 401', async () => {
        useUserStore.setState({ user, isAuthenticated: true });
        const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
            status: 401,
            statusText: 'Unauthorized',
            data: {},
            headers: {},
            config: { headers: new AxiosHeaders() },
        });
        vi.mocked(api.get).mockRejectedValue(error);

        const { result } = renderHook(() => useCurrentUser(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        await waitFor(() => expect(useUserStore.getState().isAuthenticated).toBe(false));
        expect(useUserStore.getState().user).toBeNull();
    });
});
